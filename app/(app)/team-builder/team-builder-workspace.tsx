'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useFormState } from 'react-dom'
import { submitTeamBuilderInput } from './actions'
import { TeamBuilderForm } from './team-builder-form'
import { TeamScorecard } from './team-scorecard'
import type { TeamBuilderFormState, TeamBuilderOutput } from './types'
import {
  Card,
  CardContent,
  CardAction,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

const initialState: TeamBuilderFormState = {
  status: 'idle',
}

const TEAM_BUILDER_SESSION_KEY = 'team-builder-session-state-v6'

type TeamBuilderSessionState = {
  state: TeamBuilderFormState
  selectedIds: string[]
}

function getOutputSignature(output: TeamBuilderOutput) {
  return [
    output.projectTitle,
    output.jobDescription,
    output.managerProfileId ?? '',
    output.profileIds.join('|'),
  ].join('::')
}

function dedupeIds(ids: string[]) {
  return Array.from(new Set(ids))
}

function normalizeSelectedIds(
  output: TeamBuilderOutput,
  selectedIds?: string[],
) {
  const validIds = new Set(output.profiles.map((profile) => profile.id))
  const managerProfileId =
    output.managerProfileId && validIds.has(output.managerProfileId)
      ? output.managerProfileId
      : null
  const candidateIds =
    selectedIds && selectedIds.length > 0 ? selectedIds : output.profileIds
  const filtered = dedupeIds(
    candidateIds.filter(
      (id) => validIds.has(id) && id !== managerProfileId,
    ),
  )

  if (managerProfileId) {
    return [managerProfileId, ...filtered]
  }

  return filtered
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
      parsed.state.output &&
      'managerProfileId' in parsed.state.output &&
      Array.isArray(parsed.state.output.chemistryLinks) &&
      parsed.state.output.ratings &&
      Array.isArray(parsed.state.output.ratingCache) &&
      typeof parsed.state.output.selectionSummary === 'string'
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
  const [isFormOpen, setIsFormOpen] = useState(
    initialFormState.status !== 'success',
  )
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
  const previousFormState = useRef(state)

  useEffect(() => {
    if (state.status !== 'success') {
      previousFormState.current = state
      return
    }

    const isNewFormState = previousFormState.current !== state
    previousFormState.current = state
    const nextSignature = getOutputSignature(state.output)
    const nextSelectedIds =
      isNewFormState || previousOutputSignature.current !== nextSignature
        ? normalizeSelectedIds(state.output)
        : normalizeSelectedIds(state.output, selectedIds)

    if (isNewFormState || previousOutputSignature.current !== nextSignature) {
      previousOutputSignature.current = nextSignature
      setSelectedIds(nextSelectedIds)
    }

    setPersistedSessionState((previousSessionState) => {
      const nextState =
        isNewFormState
          ? state
          : previousSessionState?.state.status === 'success' &&
              getOutputSignature(previousSessionState.state.output) === nextSignature
            ? previousSessionState.state
            : state
      const nextSessionState = {
        state: nextState,
        selectedIds: nextSelectedIds,
      }

      persistTeamBuilderSessionState(nextSessionState)
      return nextSessionState
    })
  }, [selectedIds, state])

  const stateSignature =
    state.status === 'success' ? getOutputSignature(state.output) : null
  const persistedSignature =
    persistedSessionState?.state.status === 'success'
      ? getOutputSignature(persistedSessionState.state.output)
      : null
  const activeSessionState =
    persistedSessionState?.state.status === 'success' &&
    persistedSignature === stateSignature
      ? {
          state: persistedSessionState.state,
          selectedIds:
            state.status === 'success'
              ? selectedIds
              : persistedSessionState.selectedIds,
        }
      : state.status === 'success'
        ? {
            state,
            selectedIds,
          }
        : persistedSessionState?.state.status === 'success'
          ? {
              state: persistedSessionState.state,
              selectedIds: persistedSessionState.selectedIds,
            }
          : persistedSessionState

  const activeDreamTeamSignature =
    activeSessionState?.state.status === 'success'
      ? getOutputSignature(activeSessionState.state.output)
      : null

  useEffect(() => {
    if (activeDreamTeamSignature) {
      setIsFormOpen(false)
    }
  }, [activeDreamTeamSignature])

  const activeOutput =
    activeSessionState?.state.status === 'success'
      ? activeSessionState.state.output
      : null
  const activeSelectedIds = activeOutput
    ? normalizeSelectedIds(activeOutput, activeSessionState?.selectedIds)
    : []
  const handleOutputUpdate = useCallback(
    (nextOutput: TeamBuilderOutput) => {
      const nextSessionState: TeamBuilderSessionState = {
        state: {
          status: 'success',
          output: nextOutput,
        },
        selectedIds: normalizeSelectedIds(nextOutput, activeSelectedIds),
      }

      setPersistedSessionState(nextSessionState)
      persistTeamBuilderSessionState(nextSessionState)
    },
    [activeSelectedIds],
  )

  return (
    <div className="mx-auto w-full max-w-6xl">
      <Collapsible open={isFormOpen} onOpenChange={setIsFormOpen}>
        <Card size="sm">
          <CardHeader>
            <div className="grid min-w-0 gap-1">
              <CardTitle>Team Builder</CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Paste details for a new job and attach one supporting file to
                generate an AI team recommendation.
              </CardDescription>
            </div>

            <CardAction>
              <CollapsibleTrigger
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-border/70 bg-background/80 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                aria-label={
                  isFormOpen ? 'Collapse team builder form' : 'Expand team builder form'
                }
              >
                <ChevronDown
                  className={`size-4 transition-transform ${isFormOpen ? 'rotate-180' : ''}`}
                />
              </CollapsibleTrigger>
            </CardAction>
          </CardHeader>

          <CollapsibleContent>
            <CardContent>
              <TeamBuilderForm state={state} formAction={formAction} />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {activeOutput ? (
        <TeamScorecard
          key={getOutputSignature(activeOutput)}
          output={activeOutput}
          selectedIds={activeSelectedIds}
          onOutputUpdate={handleOutputUpdate}
          onSelectedIdsChange={(nextSelectedIds) => {
            setSelectedIds(
              normalizeSelectedIds(activeOutput, nextSelectedIds),
            )
          }}
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
