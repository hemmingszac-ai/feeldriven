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
import type {
  TeamBuilderFormState,
  TeamBuilderOutput,
  TeamBuilderProfile,
} from './types'

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
    emailBody: {
      type: 'string',
      description:
        'A short email body that briefly describes the work and asks whether the recipients would be keen to help and share their thoughts.',
    },
  },
  required: ['profileIds', 'subject', 'emailBody'],
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
  skills_to_develop: string[]
  enjoyable_work: string[]
  stretch_projects: string
}): TeamBuilderProfile {
  return {
    id: value.id,
    name: formatProfileName(value),
    email: value.email,
    skillsToDevelop: value.skills_to_develop ?? [],
    enjoyableWork: value.enjoyable_work ?? [],
    stretchProjects: value.stretch_projects ?? '',
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

  if (user.user_metadata?.role !== 'Team Manager') {
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

    const result = await generateStructuredOutput({
      database,
      systemPrompt: `${DEFAULT_SYSTEM_PROMPT}\n\n${TEAM_BUILDER_EMAIL_PROMPT}`,
      form: {
        emailComms,
        projectTitle,
        jobDescription,
        attachments: await readAttachments(formData),
      },
      schemaName: 'team_builder_recommendation',
      schema: teamBuilderSchema,
    })

    return {
      status: 'success',
      output: {
        ...(result.output as Omit<
          TeamBuilderOutput,
          'profiles' | 'projectTitle' | 'jobDescription' | 'emailComms'
        >),
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
