'use client'

import { useEffect, useRef, useState } from 'react'
import { useFormState } from 'react-dom'
import { submitTeamBuilderInput } from './actions'
import { TeamBuilderForm } from './team-builder-form'
import { TeamScorecard } from './team-scorecard'
import type { TeamBuilderFormState, TeamBuilderOutput } from './types'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const initialState: TeamBuilderFormState = {
  status: 'idle',
}

const TEAM_BUILDER_SESSION_KEY = 'team-builder-session-state'

type TeamBuilderSessionState = {
  state: TeamBuilderFormState
  selectedIds: string[]
}

function getOutputSignature(output: TeamBuilderOutput) {
  return [
    output.projectTitle,
    output.jobDescription,
    output.requiredTeamSize,
    output.profileIds.join('|'),
  ].join('::')
}

function normalizeSelectedIds(
  output: TeamBuilderOutput,
  selectedIds?: string[],
) {
  const validIds = new Set(output.profiles.map((profile) => profile.id))
  const filtered = (selectedIds ?? []).filter((id) => validIds.has(id))

  if (filtered.length > 0) {
    return filtered
  }

  return output.profileIds.filter((id) => validIds.has(id))
}

function readTeamBuilderSessionState(): TeamBuilderSessionState | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.sessionStorage.getItem(TEAM_BUILDER_SESSION_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as TeamBuilderSessionState
    if (
      parsed?.state?.status === 'success' &&
      Array.isArray(parsed.selectedIds) &&
      parsed.state.output
    ) {
      return {
        state: parsed.state,
        selectedIds: parsed.selectedIds,
      }
    }
  } catch {
    return null
  }

  return null
}

function persistTeamBuilderSessionState(state: TeamBuilderSessionState | null) {
  if (typeof window === 'undefined') {
    return
  }

  if (!state) {
    window.sessionStorage.removeItem(TEAM_BUILDER_SESSION_KEY)
    return
  }

  window.sessionStorage.setItem(TEAM_BUILDER_SESSION_KEY, JSON.stringify(state))
}

function TeamBuilderWorkspaceContent({
  initialFormState,
  initialSelectedIds,
}: {
  initialFormState: TeamBuilderFormState
  initialSelectedIds: string[]
}) {
  const [state, formAction] = useFormState(submitTeamBuilderInput, initialFormState)
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    state.status === 'success'
      ? normalizeSelectedIds(state.output, initialSelectedIds)
      : [],
  )
  const [persistedSessionState, setPersistedSessionState] =
    useState<TeamBuilderSessionState | null>(() =>
      state.status === 'success'
        ? {
            state,
            selectedIds: normalizeSelectedIds(state.output, initialSelectedIds),
          }
        : null,
    )
  const previousOutputSignature = useRef(
    state.status === 'success' ? getOutputSignature(state.output) : null,
  )

  useEffect(() => {
    if (state.status !== 'success') {
      return
    }

    const nextSignature = getOutputSignature(state.output)
    const nextSelectedIds =
      previousOutputSignature.current !== nextSignature
        ? normalizeSelectedIds(state.output)
        : selectedIds

    if (previousOutputSignature.current !== nextSignature) {
      previousOutputSignature.current = nextSignature
      setSelectedIds(nextSelectedIds)
    }

    const nextSessionState = {
      state,
      selectedIds: nextSelectedIds,
    }

    setPersistedSessionState(nextSessionState)
    persistTeamBuilderSessionState(nextSessionState)
  }, [selectedIds, state])

  const activeSessionState =
    persistedSessionState?.state.status === 'success'
      ? persistedSessionState
      : state.status === 'success'
        ? {
            state,
            selectedIds,
          }
        : persistedSessionState

  useEffect(() => {
    if (activeSessionState?.state.status !== 'success') {
      return
    }

    setPersistedSessionState(activeSessionState)
  }, [activeSessionState])

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Card size="sm">
        <CardHeader>
          <CardTitle>Team Builder</CardTitle>
          <CardDescription className="text-xs leading-relaxed">
            Paste details for a new job and attach one supporting file to generate
            an AI team recommendation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeamBuilderForm state={state} formAction={formAction} />
        </CardContent>
      </Card>

      {activeSessionState?.state.status === 'success' ? (
        <TeamScorecard
          key={getOutputSignature(activeSessionState.state.output)}
          output={activeSessionState.state.output}
          selectedIds={activeSessionState.selectedIds}
          onSelectedIdsChange={setSelectedIds}
        />
      ) : null}
    </div>
  )
}

export function TeamBuilderWorkspace() {
  const [hydratedSessionState, setHydratedSessionState] =
    useState<TeamBuilderSessionState | null>(null)

  useEffect(() => {
    setHydratedSessionState(readTeamBuilderSessionState())
  }, [])

  const initialFormState = hydratedSessionState?.state ?? initialState
  const initialSelectedIds = hydratedSessionState?.selectedIds ?? []

  return (
    <TeamBuilderWorkspaceContent
      key={hydratedSessionState ? 'hydrated' : 'default'}
      initialFormState={initialFormState}
      initialSelectedIds={initialSelectedIds}
    />
  )
}
