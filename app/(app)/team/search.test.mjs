import assert from 'node:assert/strict'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import ts from 'typescript'

async function loadSearchModule() {
  const source = await readFile(new URL('./search.ts', import.meta.url), 'utf8')
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2020,
    },
  })
  const dir = await mkdtemp(join(tmpdir(), 'team-search-'))
  const file = join(dir, 'search.mjs')
  await writeFile(file, compiled.outputText)
  return import(file)
}

const profiles = [
  {
    id: 'profile-1',
    first_name: 'Ada',
    last_name: 'Lovelace',
    skills_to_develop: ['Software engineering'],
    enjoyable_work: ['Deep focus work'],
    stretch_projects: 'Compiler work',
    created_at: '2026-05-09T00:00:00.000Z',
    updated_at: '2026-05-09T00:00:00.000Z',
  },
  {
    id: 'profile-2',
    first_name: 'Grace',
    last_name: 'Hopper',
    skills_to_develop: ['Leadership'],
    enjoyable_work: ['Teaching and enablement'],
    stretch_projects: 'Team architecture',
    created_at: '2026-05-09T00:00:00.000Z',
    updated_at: '2026-05-09T00:00:00.000Z',
  },
]

test('empty team search returns all profiles', async () => {
  const { filterTeamProfiles } = await loadSearchModule()

  assert.deepEqual(filterTeamProfiles(profiles, ''), profiles)
  assert.deepEqual(filterTeamProfiles(profiles, '   '), profiles)
})

test('team search matches names case-insensitively', async () => {
  const { filterTeamProfiles } = await loadSearchModule()

  assert.deepEqual(filterTeamProfiles(profiles, 'ada'), [profiles[0]])
  assert.deepEqual(filterTeamProfiles(profiles, 'HOPPER'), [profiles[1]])
  assert.deepEqual(filterTeamProfiles(profiles, 'grace hopper'), [profiles[1]])
})

test('team search does not match profile fields beyond names', async () => {
  const { filterTeamProfiles } = await loadSearchModule()

  assert.deepEqual(filterTeamProfiles(profiles, 'Leadership'), [])
  assert.deepEqual(filterTeamProfiles(profiles, 'Deep focus work'), [])
  assert.deepEqual(filterTeamProfiles(profiles, 'Compiler work'), [])
})
