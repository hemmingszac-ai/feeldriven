import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

test('root route redirects authenticated users to shout-outs', async () => {
  const source = await readFile(new URL('./page.tsx', import.meta.url), 'utf8')

  assert.match(source, /redirect\(user\s*\?\s*'\/shout-outs'\s*:\s*'\/login'\)/)
  assert.match(source, /supabase\.auth\.getUser\(\)/)
})
