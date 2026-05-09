import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

test('sidebar exposes shout-outs navigation', async () => {
  const source = await readFile(new URL('./app-nav.tsx', import.meta.url), 'utf8')

  assert.match(source, /id:\s*'shout-outs'/)
  assert.match(source, /href:\s*'\/shout-outs'/)
  assert.match(source, /label:\s*'Shout-outs'/)
})

test('sidebar exposes organization navigation', async () => {
  const source = await readFile(new URL('./app-nav.tsx', import.meta.url), 'utf8')

  assert.match(source, /id:\s*'organization'/)
  assert.match(source, /href:\s*'\/organization'/)
  assert.match(source, /label:\s*'Organization'/)
})

test('sidebar brand uses svg logo assets', async () => {
  const source = await readFile(
    new URL('./sidebar-logo-trigger.tsx', import.meta.url),
    'utf8'
  )

  assert.match(source, /\/logos\/longlogo\.svg/)
  assert.match(source, /\/logos\/iconlogo\.svg/)
  assert.doesNotMatch(source, />\s*FD\s*</)
})
