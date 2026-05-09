'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'
import { loadAiDatabaseContext } from '@/app/lib/ai/database-context'
import {
  generateStructuredOutput,
  OpenRouterError,
} from '@/app/lib/ai/openrouter'
import { DEFAULT_SYSTEM_PROMPT } from '@/app/lib/ai/system-prompt'

export type TeamBuilderOutput = {
  profileIds: string[]
  requiredTeamSize: number
  rationale: string
}

export type TeamBuilderFormState =
  | {
      status: 'idle'
    }
  | {
      status: 'error'
      error: string
    }
  | {
      status: 'success'
      output: TeamBuilderOutput
    }

const teamBuilderSchema = {
  type: 'object',
  properties: {
    profileIds: {
      type: 'array',
      items: { type: 'string' },
      description:
        'The selected team member profile ids, in descending order of best fit.',
    },
    requiredTeamSize: {
      type: 'number',
      description: 'The recommended number of people required for the job.',
    },
    rationale: {
      type: 'string',
      description: 'A concise explanation of why this team was selected.',
    },
  },
  required: ['profileIds', 'requiredTeamSize', 'rationale'],
  additionalProperties: false,
}

const MAX_ATTACHMENT_TEXT_BYTES = 200_000

function fail(message: string): TeamBuilderFormState {
  return {
    status: 'error',
    error: message,
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
  const files = formData
    .getAll('attachments')
    .filter((entry): entry is File => entry instanceof File && entry.size > 0)

  return Promise.all(
    files.map(async (file) => {
      const attachment = {
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        content: null as string | null,
        contentTruncated: false,
      }

      if (isTextAttachment(file)) {
        const content = await file.text()
        attachment.content = content.slice(0, MAX_ATTACHMENT_TEXT_BYTES)
        attachment.contentTruncated = content.length > MAX_ATTACHMENT_TEXT_BYTES
      }

      return attachment
    }),
  )
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
    redirect('/dashboard')
  }

  const emailComms = formData.get('emailComms')?.toString().trim() ?? ''
  const jobDescription = formData.get('jobDescription')?.toString().trim() ?? ''

  if (!jobDescription) {
    return fail('Please add a job description before continuing.')
  }

  try {
    const database = await loadAiDatabaseContext()

    const result = await generateStructuredOutput({
      database,
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      form: {
        emailComms,
        jobDescription,
        attachments: await readAttachments(formData),
      },
      schemaName: 'team_builder_recommendation',
      schema: teamBuilderSchema,
    })

    return {
      status: 'success',
      output: result.output as TeamBuilderOutput,
    }
  } catch (error) {
    if (error instanceof OpenRouterError) {
      return fail(error.message)
    }

    throw error
  }
}
