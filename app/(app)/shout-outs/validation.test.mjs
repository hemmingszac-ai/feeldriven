import assert from 'node:assert/strict'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import ts from 'typescript'

async function loadValidationModule() {
  const source = await readFile(new URL('./validation.ts', import.meta.url), 'utf8')
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2020,
    },
  })
  const dir = await mkdtemp(join(tmpdir(), 'shout-outs-validation-'))
  const file = join(dir, 'validation.mjs')
  await writeFile(file, compiled.outputText)
  return import(file)
}

test('accepts a valid shout-out submission', async () => {
  const { validateShoutOutInput } = await loadValidationModule()

  const result = validateShoutOutInput(
    {
      senderId: 'sender-1',
      recipientId: 'recipient-1',
      message: 'Thank you for helping unblock the launch.',
    },
    new Set(['recipient-1'])
  )

  assert.deepEqual(result, {
    ok: true,
    value: {
      recipientId: 'recipient-1',
      message: 'Thank you for helping unblock the launch.',
    },
  })
})

test('rejects invalid shout-out submissions', async () => {
  const { validateShoutOutInput } = await loadValidationModule()
  const recipients = new Set(['recipient-1'])

  assert.equal(
    validateShoutOutInput(
      { senderId: 'sender-1', recipientId: 'recipient-1', message: '   ' },
      recipients
    ).error,
    'Please write a shout-out message.'
  )

  assert.equal(
    validateShoutOutInput(
      { senderId: 'sender-1', recipientId: 'sender-1', message: 'Great work.' },
      new Set(['sender-1'])
    ).error,
    'Choose another team member to recognize.'
  )

  assert.equal(
    validateShoutOutInput(
      { senderId: 'sender-1', recipientId: 'missing', message: 'Great work.' },
      recipients
    ).error,
    'Choose a valid recipient.'
  )
})
