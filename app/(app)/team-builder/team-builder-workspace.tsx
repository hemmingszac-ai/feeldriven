'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useFormState } from 'react-dom'
import { submitTeamBuilderInput } from './actions'
import { TeamBuilderForm } from './team-builder-form'
import { TeamScorecard } from './team-scorecard'
import type { TeamBuilderFormState, TeamBuilderOutput } from './types'
import {
  Card,
  CardContent,
  CardDescription,
  CardAction,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

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

  const activeDreamTeamSignature =
    activeSessionState?.state.status === 'success'
      ? getOutputSignature(activeSessionState.state.output)
      : null

  useEffect(() => {
    if (activeSessionState?.state.status !== 'success') {
      return
    }

    setPersistedSessionState(activeSessionState)
  }, [activeSessionState])

  useEffect(() => {
    if (activeDreamTeamSignature) {
      setIsFormOpen(false)
    }
  }, [activeDreamTeamSignature])

  return (
    <div className="mx-auto w-full max-w-3xl">
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
