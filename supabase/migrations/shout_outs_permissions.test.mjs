import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { test } from 'node:test'

test('shout_outs grants authenticated users the table privileges needed by RLS policies', async () => {
  const files = await readdir(new URL('.', import.meta.url))
  const migrationTexts = await Promise.all(
    files
      .filter((file) => file.endsWith('.sql'))
      .map((file) => readFile(new URL(file, import.meta.url), 'utf8'))
  )
  const allMigrations = migrationTexts.join('\n').toLowerCase()

  assert.match(
    allMigrations,
    /grant\s+select\s*,\s*insert\s+on\s+table\s+public\.shout_outs\s+to\s+authenticated/
  )
})
