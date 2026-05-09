'use client'

import { useFormState } from 'react-dom'
import { submitTeamBuilderInput } from './actions'
import { TeamBuilderForm } from './team-builder-form'
import { TeamScorecard } from './team-scorecard'
import type { TeamBuilderFormState } from './types'
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

export function TeamBuilderWorkspace() {
  const [state, formAction] = useFormState(submitTeamBuilderInput, initialState)

  return (
    <div className="mx-auto w-full max-w-5xl">
      <Card>
        <CardHeader>
          <CardTitle>Team Builder</CardTitle>
          <CardDescription>
            Paste details for a new job and attach one supporting file to generate
            an AI team recommendation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeamBuilderForm state={state} formAction={formAction} />
        </CardContent>
      </Card>

      {state.status === 'success' ? <TeamScorecard output={state.output} /> : null}
    </div>
  )
}
