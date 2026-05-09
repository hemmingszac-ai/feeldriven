import 'server-only';

import { readError } from '@/app/lib/http';
import type { JsonObject } from '@/app/lib/object';
import { resolveSystemPrompt } from './system-prompt';

export type StructuredOutputInput = {
  systemPrompt?: string;
  database?: unknown;
  form?: unknown;
  input?: unknown;
  schema?: JsonObject;
  outputSchema?: JsonObject;
  schemaName?: string;
  model?: string;
};

export type StructuredOutputResult = {
  output: unknown;
  model: string;
  usage: unknown;
};

export class OpenRouterError extends Error {
  status: number;
  detail?: unknown;

  constructor(message: string, status = 500, detail?: unknown) {
    super(message);
    this.name = 'OpenRouterError';
    this.status = status;
    this.detail = detail;
  }
}

const OPENROUTER_CHAT_URL = 'https://openrouter.ai/api/v1/chat/completions';

const defaultOutputSchema = {
  type: 'object',
  properties: {
    summary: {
      type: 'string',
      description: 'A concise summary of the supplied input',
    },
    nextAction: {
      type: 'string',
      description: 'The most useful next action to take',
    },
    tags: {
      type: 'array',
      items: { type: 'string' },
      description: 'Short labels that classify the input',
    },
  },
  required: ['summary', 'nextAction', 'tags'],
  additionalProperties: false,
};

function readSchema(input: StructuredOutputInput) {
  return input.schema ?? input.outputSchema ?? defaultOutputSchema;
}

export async function generateStructuredOutput(
  input: StructuredOutputInput,
): Promise<StructuredOutputResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new OpenRouterError('Missing OPENROUTER_API_KEY in the server environment.');
  }

  const systemPrompt = resolveSystemPrompt(input.systemPrompt);
  const schema = readSchema(input);
  const schemaName = input.schemaName ?? 'structured_output';
  const model = input.model ?? process.env.OPENROUTER_MODEL ?? 'openai/gpt-4.1-mini';

  const promptInput = {
    database: input.database ?? null,
    form: input.form ?? null,
    input: input.input ?? null,
  };

  const openRouterResponse = await fetch(OPENROUTER_CHAT_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
      'X-Title': 'teamhuddle',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: `${systemPrompt}\n\nReturn only JSON that matches the provided schema.`,
        },
        {
          role: 'user',
          content: JSON.stringify(promptInput, null, 2),
        },
      ],
      temperature: 0.2,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: schemaName,
          strict: true,
          schema,
        },
      },
      provider: {
        require_parameters: true,
      },
    }),
  });

  if (!openRouterResponse.ok) {
    throw new OpenRouterError(
      'OpenRouter request failed.',
      502,
      await readError(openRouterResponse),
    );
  }

  const completion = await openRouterResponse.json();
  const content = completion?.choices?.[0]?.message?.content;

  if (typeof content !== 'string') {
    throw new OpenRouterError('OpenRouter returned an unexpected response shape.', 502);
  }

  try {
    return {
      output: JSON.parse(content),
      model: completion.model,
      usage: completion.usage ?? null,
    };
  } catch {
    throw new OpenRouterError('OpenRouter returned invalid JSON.', 502, content);
  }
}
