'use client'

import { useEffect, useState } from 'react'
import { Mail, RefreshCw } from 'lucide-react'
import { useFormState, useFormStatus } from 'react-dom'
import { regenerateTeamBuilderEmailBody, type TeamBuilderEmailFormState } from './email-body-actions'
import type { TeamBuilderOutput } from './types'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type TeamBuilderEmailProps = {
  output: TeamBuilderOutput
  selectedIds: string[]
}

const initialEmailState: TeamBuilderEmailFormState = {
  status: 'idle',
}

function RegenerateButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      variant="outline"
      size="sm"
      disabled={pending || disabled}
      className="rounded-full border-primary/20 bg-primary/5 px-3.5 text-primary shadow-none hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
    >
      <RefreshCw className={`size-3.5 ${pending ? 'animate-spin' : ''}`} />
      {pending ? 'Regenerating' : 'Regenerate'}
    </Button>
  )
}

function normalizeSubjectSummary(value?: string | null) {
  return value
    ?.trim()
    .replace(/^(team huddle\s*-\s*|team assignment:\s*)/i, '')
    .trim()
}

export function TeamBuilderEmail({ output, selectedIds }: TeamBuilderEmailProps) {
  const [regenerateState, regenerateFormAction] = useFormState(
    regenerateTeamBuilderEmailBody,
    initialEmailState,
  )
  const [emailBody, setEmailBody] = useState(output.emailBody)

  const selectedProfiles = selectedIds
    .filter((id) => id !== output.managerProfileId)
    .map((id) => output.profiles.find((profile) => profile.id === id))
    .filter(Boolean)
  const selectedEmails = selectedProfiles
    .map((profile) => profile?.email?.trim())
    .filter((email): email is string => Boolean(email))

  const canDraftEmail = selectedEmails.length > 0
  const canRegenerateEmail = selectedProfiles.length > 0
  const subjectSummary =
    normalizeSubjectSummary(output.subject) ||
    output.projectTitle ||
    output.jobDescription.split('\n')[0]?.trim() ||
    'New mission'
  const subject = `Team huddle - ${subjectSummary}`
  const mailtoHref = `mailto:${selectedEmails
    .map((email) => encodeURIComponent(email))
    .join(',')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`

  useEffect(() => {
    setEmailBody(output.emailBody)
  }, [output.emailBody])

  useEffect(() => {
    if (regenerateState.status === 'success') {
      setEmailBody(regenerateState.emailBody)
    }
  }, [
    regenerateState.status,
    regenerateState.status === 'success' ? regenerateState.emailBody : null,
  ])

  return (
    <form action={regenerateFormAction} className="grid gap-3">
      <section className="grid gap-2 rounded-xl p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Label htmlFor="team-builder-email-body">Email body</Label>
          <RegenerateButton disabled={!canRegenerateEmail} />
        </div>
        <Textarea
          id="team-builder-email-body"
          value={emailBody}
          onChange={(event) => setEmailBody(event.target.value)}
          className="min-h-32 resize-y bg-background/70"
        />
      </section>

      <input type="hidden" name="projectTitle" value={output.projectTitle} />
      <input type="hidden" name="jobDescription" value={output.jobDescription} />
      <input type="hidden" name="emailComms" value={output.emailComms} />
      {selectedIds
        .filter((profileId) => profileId !== output.managerProfileId)
        .map((profileId) => (
          <input
            key={profileId}
            type="hidden"
            name="selectedProfileIds"
            value={profileId}
          />
        ))}

      {regenerateState.status === 'error' ? (
        <Alert variant="destructive">
          <AlertDescription>{regenerateState.error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          disabled={!canDraftEmail}
          onClick={() => {
            window.location.href = mailtoHref
          }}
        >
          <Mail className="size-4" />
          Start Huddle
        </Button>
        {!canDraftEmail ? (
          <p className="text-sm text-muted-foreground">
            At least one selected employee needs an email on their profile.
          </p>
        ) : null}
        {!canRegenerateEmail ? (
          <p className="text-sm text-muted-foreground">
            Select at least one profile to regenerate the email body.
          </p>
        ) : null}
      </div>
    </form>
  )
}
