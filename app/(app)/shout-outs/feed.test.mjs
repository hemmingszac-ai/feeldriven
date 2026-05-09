import assert from 'node:assert/strict'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import ts from 'typescript'

async function loadFeedModule() {
  const source = await readFile(new URL('./feed.ts', import.meta.url), 'utf8')
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2020,
    },
  })
  const dir = await mkdtemp(join(tmpdir(), 'shout-outs-feed-'))
  const file = join(dir, 'feed.mjs')
  await writeFile(file, compiled.outputText)
  return import(file)
}

test('normalizes missing shout-out results to an empty feed', async () => {
  const { normalizeShoutOuts } = await loadFeedModule()

  assert.deepEqual(normalizeShoutOuts(null), [])
  assert.deepEqual(normalizeShoutOuts(undefined), [])
})

test('keeps returned shout-outs unchanged', async () => {
  const { normalizeShoutOuts } = await loadFeedModule()
  const shoutOuts = [
    {
      id: 'shout-out-1',
      sender_id: 'sender-1',
      recipient_id: 'recipient-1',
      message: 'Great work.',
      created_at: '2026-05-09T00:00:00.000Z',
    },
  ]

  assert.deepEqual(normalizeShoutOuts(shoutOuts), shoutOuts)
})
