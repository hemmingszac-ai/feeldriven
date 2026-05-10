'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'
import { loadAiDatabaseContext } from '@/app/lib/ai/database-context'
import {
  generateStructuredOutput,
  OpenRouterError,
} from '@/app/lib/ai/openrouter'
import {
  DEFAULT_SYSTEM_PROMPT,
  TEAM_BUILDER_EMAIL_PROMPT,
} from '@/app/lib/ai/system-prompt'
import { formatProfileName } from '@/app/lib/profiles'
import { getIsManager } from '@/app/lib/user-metadata'
import type {
  TeamBuilderChemistryLink,
  TeamBuilderFormState,
  TeamBuilderOutput,
  TeamBuilderProfile,
} from './types'
import { canonicalProfileIds } from './rating-cache'

const teamBuilderSchema = {
  type: 'object',
  properties: {
    profileIds: {
      type: 'array',
      items: { type: 'string' },
      description:
        'The selected team member profile ids, in descending order of best fit.',
    },
    subject: {
      type: 'string',
      description:
        'A very short subject summary for the job, ideally 2 to 5 words. Do not include any prefix, label, or greeting.',
    },
    selectionSummary: {
      type: 'string',
      description:
        'One to two concise sentences explaining why this team is a strong fit for the job, based on the brief, profile signals, and shout-out history.',
    },
    emailBody: {
      type: 'string',
      description:
        'A short email body that briefly describes the work, subtly nods to why this group is a good fit, and asks whether the recipients would be keen to help and share their thoughts.',
    },
    ratings: {
      type: 'object',
      properties: {
        overall: {
          type: 'number',
      description:
            'FIFA Ultimate Team-style overall final team score out of 100, balancing skills, drive, and chemistry. Include the fixed manager profile from the form if supplied.',
        },
        skills: {
          type: 'number',
          description:
            'Score out of 100 for how well the selected team skills cover the job needs.',
        },
        drive: {
          type: 'number',
          description:
            'Score out of 100 for how motivated the selected team is likely to be for this type of work.',
        },
        chemistry: {
          type: 'number',
          description:
            'Score out of 100 for how well the selected team is likely to work together, based on shout-out history and profile fit.',
        },
      },
      required: ['overall', 'skills', 'drive', 'chemistry'],
      additionalProperties: false,
    },
  },
  required: ['profileIds', 'subject', 'selectionSummary', 'emailBody', 'ratings'],
  additionalProperties: false,
}

const MAX_ATTACHMENT_TEXT_BYTES = 200_000

function fail(message: string): TeamBuilderFormState {
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

function getChemistryLinks(
  shoutOuts: { sender_id: unknown; recipient_id: unknown }[],
  validProfileIds: Set<string>,
): TeamBuilderChemistryLink[] {
  const counts = new Map<string, TeamBuilderChemistryLink>()

  for (const shoutOut of shoutOuts) {
    if (
      typeof shoutOut.sender_id !== 'string' ||
      typeof shoutOut.recipient_id !== 'string' ||
      shoutOut.sender_id === shoutOut.recipient_id ||
      !validProfileIds.has(shoutOut.sender_id) ||
      !validProfileIds.has(shoutOut.recipient_id)
    ) {
      continue
    }

    const key = `${shoutOut.sender_id}:${shoutOut.recipient_id}`
    const existing = counts.get(key)

    if (existing) {
      existing.count += 1
      continue
    }

    counts.set(key, {
      sourceProfileId: shoutOut.sender_id,
      targetProfileId: shoutOut.recipient_id,
      count: 1,
    })
  }

  return [...counts.values()]
}

function normalizeRating(value: unknown) {
  const numberValue = typeof value === 'number' ? value : Number(value)

  if (!Number.isFinite(numberValue)) {
    return 0
  }

  return Math.max(0, Math.min(100, Math.round(numberValue)))
}

function normalizeRatings(value: TeamBuilderOutput['ratings']) {
  return {
    overall: normalizeRating(value.overall),
    skills: normalizeRating(value.skills),
    drive: normalizeRating(value.drive),
    chemistry: normalizeRating(value.chemistry),
  }
}

function isTextAttachment(file: File) {
  return (
    file.type.startsWith('text/') ||
    [
      'application/json',
      'application/xml',
      'application/javascript',
      'application/typescript',
      'application/x-www-form-urlencoded',
    ].includes(file.type)
  )
}

async function readAttachments(formData: FormData) {
  const fileEntry = formData.get('attachments')
  if (!(fileEntry instanceof File) || fileEntry.size === 0) {
    return []
  }

  const attachment = {
    name: fileEntry.name,
    type: fileEntry.type || 'application/octet-stream',
    size: fileEntry.size,
    content: null as string | null,
    contentTruncated: false,
  }

  if (isTextAttachment(fileEntry)) {
    const content = await fileEntry.text()
    attachment.content = content.slice(0, MAX_ATTACHMENT_TEXT_BYTES)
    attachment.contentTruncated = content.length > MAX_ATTACHMENT_TEXT_BYTES
  }

  return [attachment]
}

export async function submitTeamBuilderInput(
  _previousState: TeamBuilderFormState,
  formData: FormData,
): Promise<TeamBuilderFormState> {
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

  if (!jobDescription) {
    return fail('Please add a job description before continuing.')
  }

  try {
    const database = await loadAiDatabaseContext()
    const profiles = database.profiles.map(normalizeProfile)
    const managerProfile = profiles.find((profile) => profile.id === user.id)
    const managerProfileId = managerProfile?.id ?? null
    const aiDatabase = managerProfileId
      ? {
          ...database,
          profiles: database.profiles.filter(
            (profile) => profile.id !== managerProfileId,
          ),
        }
      : database

    const result = await generateStructuredOutput({
      database: aiDatabase,
      systemPrompt: `${DEFAULT_SYSTEM_PROMPT}\n\n${TEAM_BUILDER_EMAIL_PROMPT}`,
      form: {
        emailComms,
        projectTitle,
        jobDescription,
        fixedManagerProfile: managerProfile ?? null,
        attachments: await readAttachments(formData),
      },
      schemaName: 'team_builder_recommendation',
      schema: teamBuilderSchema,
    })
    const generatedOutput = result.output as Pick<
      TeamBuilderOutput,
      'profileIds' | 'subject' | 'selectionSummary' | 'emailBody' | 'ratings'
    >
    const validProfileIds = new Set(profiles.map((profile) => profile.id))
    const chemistryLinks = getChemistryLinks(
      database.shoutOuts,
      validProfileIds,
    )
    const recommendedProfileIds = Array.from(
      new Set(
        generatedOutput.profileIds.filter(
          (profileId) =>
            profileId !== managerProfileId && validProfileIds.has(profileId),
        ),
      ),
    )
    const ratings = normalizeRatings(generatedOutput.ratings)
    const initialRatingProfileIds = canonicalProfileIds([
      ...(managerProfileId ? [managerProfileId] : []),
      ...recommendedProfileIds,
    ])

    return {
      status: 'success',
      output: {
        ...generatedOutput,
        ratings,
        ratingCache: [
          {
            profileIds: initialRatingProfileIds,
            ratings,
          },
        ],
        profileIds: recommendedProfileIds,
        managerProfileId,
        chemistryLinks,
        profiles,
        projectTitle,
        jobDescription,
        emailComms,
      },
    }
  } catch (error) {
    if (error instanceof OpenRouterError) {
      return fail(error.message)
    }

    throw error
  }
}
