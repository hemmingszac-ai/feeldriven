'use client'

import { useFormState, useFormStatus } from 'react-dom'
import {
  submitTeamBuilderInput,
  type TeamBuilderFormState,
} from './actions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const initialState: TeamBuilderFormState = {
  status: 'idle',
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-fit" disabled={pending}>
      {pending ? 'Generating recommendation...' : 'Continue to AI processing'}
    </Button>
  )
}

export function TeamBuilderForm() {
  const [state, formAction] = useFormState(
    submitTeamBuilderInput,
    initialState,
  )

  return (
    <form action={formAction} className="grid gap-4">
      {state.status === 'error' ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      {state.status === 'success' ? (
        <div className="grid gap-3 rounded-lg border border-border/70 bg-surface-subtle/50 p-3">
          <div className="grid gap-1">
            <h2 className="text-sm font-medium">AI recommendation</h2>
            <p className="text-sm text-muted-foreground">
              Required team size: {state.output.requiredTeamSize}
            </p>
          </div>

          <div className="grid gap-2">
            <h3 className="text-sm font-medium">Recommended profile IDs</h3>
            {state.output.profileIds.length > 0 ? (
              <ol className="grid gap-1 text-sm">
                {state.output.profileIds.map((profileId, index) => (
                  <li
                    key={`${profileId}-${index}`}
                    className="rounded-md bg-background px-2 py-1 font-mono text-xs"
                  >
                    {profileId}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">
                No profile IDs were returned.
              </p>
            )}
          </div>

          <div className="grid gap-1">
            <h3 className="text-sm font-medium">Rationale</h3>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {state.output.rationale}
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-2">
        <Label htmlFor="emailComms">Email communications (optional)</Label>
        <Textarea
          id="emailComms"
          name="emailComms"
          placeholder="Paste relevant email thread content here."
          className="min-h-40"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="jobDescription">Job description</Label>
        <Textarea
          id="jobDescription"
          name="jobDescription"
          placeholder="Describe the project goals, constraints, and deliverables."
          className="min-h-40"
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="attachments">Attachments (optional)</Label>
        <Input id="attachments" name="attachments" type="file" multiple />
        <p className="text-xs text-muted-foreground">
          Add one or more supporting files. Text-based attachments are included
          in the AI request.
        </p>
      </div>

      <SubmitButton />
    </form>
  )
}
