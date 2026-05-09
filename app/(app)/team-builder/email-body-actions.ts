'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'
import { loadAiDatabaseContext } from '@/app/lib/ai/database-context'
import { generateStructuredOutput, OpenRouterError } from '@/app/lib/ai/openrouter'
import { TEAM_BUILDER_EMAIL_PROMPT } from '@/app/lib/ai/system-prompt'
import { formatProfileName } from '@/app/lib/profiles'
import { getIsManager } from '@/app/lib/user-metadata'
import type { TeamBuilderProfile } from './types'

const teamBuilderEmailBodySchema = {
  type: 'object',
  properties: {
    emailBody: {
      type: 'string',
      description:
        'A short email body that briefly describes the work and asks whether the recipients would be keen to help and share their thoughts.',
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

function readSelectedProfileIds(formData: FormData) {
  return formData
    .getAll('selectedProfileIds')
    .map((value) => value.toString().trim())
    .filter(Boolean)
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
  const selectedProfileIds = readSelectedProfileIds(formData).filter(
    (profileId) => profileId !== user.id,
  )

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
      },
      schemaName: 'team_builder_email_body',
      schema: teamBuilderEmailBodySchema,
    })

    return {
      status: 'success',
      emailBody: (result.output as { emailBody: string }).emailBody,
    }
  } catch (error) {
    if (error instanceof OpenRouterError) {
      return failEmail(error.message)
    }

    throw error
  }
}
