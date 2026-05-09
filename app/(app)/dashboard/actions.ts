'use server'

import {
  generateStructuredOutput,
  OpenRouterError,
} from '@/app/lib/ai/openrouter'
import { loadAiDatabaseContext } from '@/app/lib/ai/database-context'
import { DEFAULT_SYSTEM_PROMPT } from '@/app/lib/ai/system-prompt'

export type WorkspacePulseOutput = {
  profileId: string
}

type GenerateDashboardPulseResult =
  | {
      ok: true
      output: WorkspacePulseOutput
    }
  | {
      ok: false
      error: string
    }

const workspacePulseSchema = {
  type: 'object',
  properties: {
    profileId: {
      type: 'string',
      description: 'The selected profile id.',
    },
  },
  required: ['profileId'],
  additionalProperties: false,
}

export async function generateDashboardPulse(): Promise<GenerateDashboardPulseResult> {
  try {
    const database = await loadAiDatabaseContext()
    const result = await generateStructuredOutput({
      database,
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      form: {
        request: 'Select your favorite candidate from the supplied profiles.',
      },
      schemaName: 'favorite_candidate',
      schema: workspacePulseSchema,
    })

    return {
      ok: true,
      output: result.output as WorkspacePulseOutput,
    }
  } catch (error) {
    if (error instanceof OpenRouterError) {
      return {
        ok: false,
        error: error.message,
      }
    }

    throw error
  }
}
