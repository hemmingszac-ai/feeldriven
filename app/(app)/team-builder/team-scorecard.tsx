'use client'

import { useMemo, useState } from 'react'
import { Mail } from 'lucide-react'
import type { TeamBuilderOutput, TeamBuilderProfile } from './types'
import { PlayerCard } from './player-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

type DragSource = {
  profileId: string
  from: 'selected' | 'bench'
}

type TeamScorecardProps = {
  output: TeamBuilderOutput
  selectedIds: string[]
  onSelectedIdsChange: (selectedIds: string[]) => void
}

export function TeamScorecard({
  output,
  selectedIds,
  onSelectedIdsChange,
}: TeamScorecardProps) {
  const [dragSource, setDragSource] = useState<DragSource | null>(null)
  const [activeDropZone, setActiveDropZone] = useState<'selected' | 'bench' | null>(null)

  const profileMap = useMemo(
    () => new Map(output.profiles.map((profile) => [profile.id, profile])),
    [output.profiles],
  )

  const selectedProfiles = selectedIds
    .map((id) => profileMap.get(id))
    .filter((profile): profile is TeamBuilderProfile => Boolean(profile))

  const benchProfiles = output.profiles.filter((profile) => !selectedIds.includes(profile.id))
  const selectedEmails = selectedProfiles
    .map((profile) => profile.email?.trim())
    .filter((email): email is string => Boolean(email))

  const canDraftEmail = selectedEmails.length > 0
  const subjectBase =
    output.projectTitle || output.jobDescription.split('\n')[0]?.trim() || 'New mission'
  const mailtoHref = `mailto:${selectedEmails
    .map((email) => encodeURIComponent(email))
    .join(',')}?subject=${encodeURIComponent(`Team assignment: ${subjectBase}`)}`

  function removeFromSelected(profileId: string) {
    onSelectedIdsChange(selectedIds.filter((id) => id !== profileId))
  }

  function addToSelected(profileId: string) {
    if (selectedIds.includes(profileId)) {
      return
    }
    if (selectedIds.length >= output.requiredTeamSize) {
      onSelectedIdsChange([...selectedIds.slice(1), profileId])
      return
    }
    onSelectedIdsChange([...selectedIds, profileId])
  }

  function startDrag(profileId: string, from: 'selected' | 'bench') {
    setDragSource({ profileId, from })
  }

  function dropToSelected() {
    if (!dragSource) {
      return
    }

    if (dragSource.from === 'selected') {
      return
    }

    addToSelected(dragSource.profileId)
    setDragSource(null)
    setActiveDropZone(null)
  }

  function dropToBench() {
    if (!dragSource) {
      return
    }

    if (dragSource.from === 'selected') {
      removeFromSelected(dragSource.profileId)
    }

    setDragSource(null)
    setActiveDropZone(null)
  }

  return (
    <Card className="mt-6 border-primary/20 bg-gradient-to-b from-primary/5 to-background">
      <CardHeader className="gap-2">
        <Tooltip>
          <TooltipTrigger
            render={
              <h2 className="font-heading text-base font-medium leading-snug cursor-help w-fit">
                Your Dream Team
              </h2>
            }
          />
          <TooltipContent>
            Build your lineup by dragging cards between selected team and bench
            or clicking their buttons.
          </TooltipContent>
        </Tooltip>
        <p className="text-sm text-muted-foreground">
          Recommended team size: {output.requiredTeamSize}
        </p>
      </CardHeader>
      <CardContent className="grid gap-5">
        <section
          className={`grid gap-3 rounded-xl border p-3 ${activeDropZone === 'selected' ? 'border-primary ring-2 ring-primary/20' : 'border-border/70'
            }`}
          onDragOver={(event) => {
            event.preventDefault()
            setActiveDropZone('selected')
          }}
          onDrop={(event) => {
            event.preventDefault()
            dropToSelected()
          }}
          onDragLeave={() => setActiveDropZone(null)}
          aria-label="Selected team lineup"
        >
          <h3 className="text-sm font-semibold">Selected lineup</h3>
          {selectedProfiles.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No players selected. Drag from the bench or click add.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {selectedProfiles.map((profile, index) => (
                <PlayerCard
                  key={profile.id}
                  profile={profile}
                  selected
                  rank={index}
                  onAdd={addToSelected}
                  onRemove={removeFromSelected}
                  onDragStart={startDrag}
                />
              ))}
            </div>
          )}
        </section>

        <section
          className={`grid gap-3 rounded-xl border p-3 ${activeDropZone === 'bench' ? 'border-primary ring-2 ring-primary/20' : 'border-border/70'
            }`}
          onDragOver={(event) => {
            event.preventDefault()
            setActiveDropZone('bench')
          }}
          onDrop={(event) => {
            event.preventDefault()
            dropToBench()
          }}
          onDragLeave={() => setActiveDropZone(null)}
          aria-label="Available bench players"
        >
          <h3 className="text-sm font-semibold">Bench (available to swap in)</h3>
          {benchProfiles.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Everyone is currently selected.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {benchProfiles.map((profile) => (
                <PlayerCard
                  key={profile.id}
                  profile={profile}
                  selected={false}
                  highlight={dragSource?.profileId === profile.id}
                  onAdd={addToSelected}
                  onRemove={removeFromSelected}
                  onDragStart={startDrag}
                />
              ))}
            </div>
          )}
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            disabled={!canDraftEmail}
            onClick={() => {
              window.location.href = mailtoHref
            }}
          >
            <Mail className="size-4" />
            Draft Email
          </Button>
          {!canDraftEmail ? (
            <p className="text-sm text-muted-foreground">
              At least one selected employee needs an email on their profile.
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
