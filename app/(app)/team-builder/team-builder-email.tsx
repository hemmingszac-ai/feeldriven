'use client'

import { Mail } from 'lucide-react'
import type { TeamBuilderEmailFormState } from './email-body-actions'
import type { TeamBuilderOutput } from './types'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type TeamBuilderEmailProps = {
  output: TeamBuilderOutput
  selectedIds: string[]
  emailBody: string
  regenerateState: TeamBuilderEmailFormState
  onEmailBodyChange: (emailBody: string) => void
}

function normalizeSubjectSummary(value?: string | null) {
  return value
    ?.trim()
    .replace(/^(team hudd?l(?:e)?\s*-\s*|team assignment:\s*)/i, '')
    .trim()
}

export function TeamBuilderEmail({
  output,
  selectedIds,
  emailBody,
  regenerateState,
  onEmailBodyChange,
}: TeamBuilderEmailProps) {
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
  const subject = `Team huddl - ${subjectSummary}`
  const mailtoHref = `mailto:${selectedEmails
    .map((email) => encodeURIComponent(email))
    .join(',')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`

  return (
    <div className="grid gap-3">
      <section className="grid gap-2 rounded-xl p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Label htmlFor="team-builder-email-body">Email body</Label>
        </div>
        <Textarea
          id="team-builder-email-body"
          value={emailBody}
          onChange={(event) => onEmailBodyChange(event.target.value)}
          className="min-h-32 resize-y bg-background/70"
        />
      </section>

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
          Start huddl
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
    </div>
  )
}
