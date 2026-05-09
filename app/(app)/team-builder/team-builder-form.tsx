'use client'

import { useFormStatus } from 'react-dom'
import type { TeamBuilderFormState } from './types'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type TeamBuilderFormProps = {
  state: TeamBuilderFormState
  formAction: (payload: FormData) => void
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-fit" disabled={pending}>
      {pending ? 'Generating recommendation...' : 'Continue to AI processing'}
    </Button>
  )
}

export function TeamBuilderForm({ state, formAction }: TeamBuilderFormProps) {
  return (
    <form action={formAction} className="grid gap-4">
      {state.status === 'error' ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-2">
        <Label htmlFor="projectTitle">Project title (optional)</Label>
        <Input
          id="projectTitle"
          name="projectTitle"
          placeholder="e.g. Q3 Retention Website Refresh"
        />
      </div>

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
        <Label htmlFor="attachments">Attachment (optional)</Label>
        <Input id="attachments" name="attachments" type="file" />
        <p className="text-xs text-muted-foreground">
          Add one supporting file. Text-based attachments are included in the AI
          request.
        </p>
      </div>

      <SubmitButton />
    </form>
  )
}
