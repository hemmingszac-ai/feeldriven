import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

test('sidebar exposes shout-outs navigation', async () => {
  const source = await readFile(new URL('./app-shell.tsx', import.meta.url), 'utf8')

  assert.match(source, /active:\s*'dashboard'\s*\|\s*'profile'\s*\|\s*'shout-outs'/)
  assert.match(source, /id:\s*'shout-outs'/)
  assert.match(source, /href:\s*'\/shout-outs'/)
  assert.match(source, /label:\s*'Shout-outs'/)
})

test('sidebar exposes team navigation', async () => {
  const source = await readFile(new URL('./app-shell.tsx', import.meta.url), 'utf8')

  assert.match(source, /'team'/)
  assert.match(source, /id:\s*'team'/)
  assert.match(source, /href:\s*'\/team'/)
  assert.match(source, /label:\s*'Team'/)
})

test('sidebar brand uses svg logo assets', async () => {
  const source = await readFile(new URL('./app-shell.tsx', import.meta.url), 'utf8')

  assert.match(source, /\/logos\/longlogo\.svg/)
  assert.match(source, /\/logos\/iconlogo\.svg/)
  assert.doesNotMatch(source, />\s*FD\s*</)
})
