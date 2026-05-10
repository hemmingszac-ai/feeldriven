'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'
import { loadAiDatabaseContext } from '@/app/lib/ai/database-context'
import { generateStructuredOutput, OpenRouterError } from '@/app/lib/ai/openrouter'
import { TEAM_BUILDER_EMAIL_PROMPT } from '@/app/lib/ai/system-prompt'
import { formatProfileName } from '@/app/lib/profiles'
import { getIsManager } from '@/app/lib/user-metadata'
import type {
  TeamBuilderProfile,
  TeamBuilderRatingCacheEntry,
  TeamBuilderRatings,
} from './types'
import {
  canonicalProfileIds,
  getCachedRatings,
  getRatingCacheKey,
} from './rating-cache'

const teamBuilderEmailBodySchema = {
  type: 'object',
  properties: {
    emailBody: {
      type: 'string',
      description:
        'A short email body that briefly describes the work, lightly nods to why this group is a good fit, and asks whether the recipients would be keen to help and share their thoughts.',
    },
    ratings: {
      type: 'object',
      properties: {
        overall: {
          type: 'number',
          description:
            'FIFA Ultimate Team-style overall team score out of 100, balancing skills, drive, chemistry, and whether the current team has the right number of people compared with the recommended team.',
        },
        skills: {
          type: 'number',
          description:
            'Score out of 100 for how well the current team skills cover the job needs, penalising meaningful gaps or unnecessary dilution compared with the recommended team.',
        },
        drive: {
          type: 'number',
          description:
            'Score out of 100 for how motivated the current team is likely to be for this type of work, relative to the recommended team.',
        },
        chemistry: {
          type: 'number',
          description:
            'Score out of 100 for how well the current team is likely to work together, based on shout-out history, profile fit, and team size relative to the recommended team.',
        },
      },
      required: ['overall', 'skills', 'drive', 'chemistry'],
      additionalProperties: false,
    },
  },
  required: ['emailBody', 'ratings'],
  additionalProperties: false,
}

const teamBuilderEmailOnlySchema = {
  type: 'object',
  properties: {
    emailBody: {
      type: 'string',
      description:
        'A short email body that briefly describes the work, lightly nods to why this group is a good fit, and asks whether the recipients would be keen to help and share their thoughts.',
    },
  },
  required: ['emailBody'],
  additionalProperties: false,
}

export type TeamBuilderEmailFormState =
  | {
      status: 'idle'
    }
  | {
      status: 'error'
      error: string
    }
  | {
      status: 'success'
      emailBody: string
      ratings: TeamBuilderRatings
      ratingProfileIds: string[]
    }

function failEmail(message: string): TeamBuilderEmailFormState {
  return {
    status: 'error',
    error: message,
  }
}

function normalizeProfile(value: {
  id: string
  email: string | null
  first_name: string
  last_name: string
  role: string | null
  skills_to_develop: string[]
  enjoyable_work: string[]
  stretch_projects: string
}): TeamBuilderProfile {
  return {
    id: value.id,
    name: formatProfileName(value),
    email: value.email,
    role: value.role,
    skillsToDevelop: value.skills_to_develop ?? [],
    enjoyableWork: value.enjoyable_work ?? [],
    stretchProjects: value.stretch_projects ?? '',
  }
}

function readProfileIds(formData: FormData, name: string) {
  return formData
    .getAll(name)
    .map((value) => value.toString().trim())
    .filter(Boolean)
}

function normalizeRating(value: unknown) {
  const numberValue = typeof value === 'number' ? value : Number(value)

  if (!Number.isFinite(numberValue)) {
    return 0
  }

  return Math.max(0, Math.min(100, Math.round(numberValue)))
}

function normalizeRatings(value: TeamBuilderRatings) {
  return {
    overall: normalizeRating(value.overall),
    skills: normalizeRating(value.skills),
    drive: normalizeRating(value.drive),
    chemistry: normalizeRating(value.chemistry),
  }
}

function readRatingCache(formData: FormData): TeamBuilderRatingCacheEntry[] {
  const raw = formData.get('ratingCache')?.toString()

  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as TeamBuilderRatingCacheEntry[]

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .filter(
        (entry) =>
          Array.isArray(entry.profileIds) &&
          entry.profileIds.every((profileId) => typeof profileId === 'string') &&
          entry.ratings,
      )
      .map((entry) => ({
        profileIds: canonicalProfileIds(entry.profileIds),
        ratings: normalizeRatings(entry.ratings),
      }))
  } catch {
    return []
  }
}

function capAgainstRecommendedOverall({
  ratings,
  ratingProfileIds,
  recommendedRatingProfileIds,
  ratingCache,
}: {
  ratings: TeamBuilderRatings
  ratingProfileIds: string[]
  recommendedRatingProfileIds: string[]
  ratingCache: TeamBuilderRatingCacheEntry[]
}) {
  const recommendedRatings = getCachedRatings(
    ratingCache,
    recommendedRatingProfileIds,
  )

  if (
    !recommendedRatings ||
    getRatingCacheKey(ratingProfileIds) ===
      getRatingCacheKey(recommendedRatingProfileIds)
  ) {
    return ratings
  }

  return {
    ...ratings,
    overall: Math.min(ratings.overall, Math.max(0, recommendedRatings.overall - 1)),
  }
}

export async function regenerateTeamBuilderEmailBody(
  _previousState: TeamBuilderEmailFormState,
  formData: FormData,
): Promise<TeamBuilderEmailFormState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  if (!getIsManager(user.user_metadata)) {
    redirect('/shout-outs')
  }

  const emailComms = formData.get('emailComms')?.toString().trim() ?? ''
  const projectTitle = formData.get('projectTitle')?.toString().trim() ?? ''
  const jobDescription = formData.get('jobDescription')?.toString().trim() ?? ''
  const selectedProfileIds = readProfileIds(formData, 'selectedProfileIds').filter(
    (profileId) => profileId !== user.id,
  )
  const ratingProfileIds = readProfileIds(formData, 'ratingProfileIds')
  const recommendedRatingProfileIds = readProfileIds(
    formData,
    'recommendedRatingProfileIds',
  )
  const ratingCache = readRatingCache(formData)
  const cachedRatings = getCachedRatings(ratingCache, ratingProfileIds)

  if (!jobDescription) {
    return failEmail('Please add a job description before regenerating the email body.')
  }

  if (selectedProfileIds.length === 0) {
    return failEmail('Select at least one profile before regenerating the email body.')
  }

  try {
    const database = await loadAiDatabaseContext()
    const profiles = database.profiles.map(normalizeProfile)
    const profileById = new Map(profiles.map((profile) => [profile.id, profile]))
    const selectedProfiles = selectedProfileIds
      .map((profileId) => profileById.get(profileId))
      .filter((profile): profile is TeamBuilderProfile => Boolean(profile))
    const ratingProfiles = Array.from(new Set(ratingProfileIds))
      .map((profileId) => profileById.get(profileId))
      .filter((profile): profile is TeamBuilderProfile => Boolean(profile))
    const recommendedRatingProfiles = Array.from(
      new Set(recommendedRatingProfileIds),
    )
      .map((profileId) => profileById.get(profileId))
      .filter((profile): profile is TeamBuilderProfile => Boolean(profile))

    if (selectedProfiles.length === 0) {
      return failEmail(
        'The selected profiles are no longer available. Refresh the team and try again.',
      )
    }

    const result = await generateStructuredOutput({
      database,
      systemPrompt: TEAM_BUILDER_EMAIL_PROMPT,
      form: {
        emailComms,
        projectTitle,
        jobDescription,
        selectedProfiles,
        ratingProfiles,
        recommendedRatingProfiles:
          recommendedRatingProfiles.length > 0
            ? recommendedRatingProfiles
            : ratingProfiles,
        recommendedTeamSize:
          recommendedRatingProfiles.length > 0
            ? recommendedRatingProfiles.length
            : ratingProfiles.length,
        currentTeamSize: ratingProfiles.length,
      },
      schemaName: 'team_builder_email_body',
      schema: cachedRatings ? teamBuilderEmailOnlySchema : teamBuilderEmailBodySchema,
    })
    const output = result.output as {
      emailBody: string
      ratings?: TeamBuilderRatings
    }
    const ratings = cachedRatings
      ? cachedRatings
      : capAgainstRecommendedOverall({
          ratings: normalizeRatings(output.ratings as TeamBuilderRatings),
          ratingProfileIds,
          recommendedRatingProfileIds,
          ratingCache,
        })

    return {
      status: 'success',
      emailBody: output.emailBody,
      ratings,
      ratingProfileIds: canonicalProfileIds(ratingProfileIds),
    }
  } catch (error) {
    if (error instanceof OpenRouterError) {
      return failEmail(error.message)
    }

    throw error
  }
}
