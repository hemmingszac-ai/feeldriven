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
    <Button type="submit" size="sm" className="w-fit" disabled={pending}>
      {pending ? 'Assembling recommended squad...' : 'Find My Dream Team!'}
    </Button>
  )
}

export function TeamBuilderForm({ state, formAction }: TeamBuilderFormProps) {
  return (
    <form action={formAction} className="grid gap-3">
      {state.status === 'error' ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-1.5">
        <Label htmlFor="projectTitle">Project title (optional)</Label>
        <Input
          id="projectTitle"
          name="projectTitle"
          placeholder="e.g. Q3 Retention Website Refresh"
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="emailComms">Email communications (optional)</Label>
        <Textarea
          id="emailComms"
          name="emailComms"
          placeholder="Paste relevant email thread content here."
          className="min-h-28 py-1.5"
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="jobDescription">Job description</Label>
        <Textarea
          id="jobDescription"
          name="jobDescription"
          placeholder="Describe the project goals, constraints, and deliverables."
          className="min-h-28 py-1.5"
          required
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="attachments">Attachment (optional)</Label>
        <Input id="attachments" name="attachments" type="file" />
      </div>

      <SubmitButton />
    </form>
  )
}
