'use client'

import type { RefObject } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
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
  const selectedZoneRef = useRef<HTMLElement | null>(null)
  const benchZoneRef = useRef<HTMLElement | null>(null)
  const draggingProfileId = dragSource?.profileId ?? null

  const profileMap = useMemo(
    () => new Map(output.profiles.map((profile) => [profile.id, profile])),
    [output.profiles],
  )

  const recommendationRankByProfileId = useMemo(
    () =>
      new Map(
        output.profileIds.map((profileId, index) => [profileId, index] as const),
      ),
    [output.profileIds],
  )

  const selectedProfiles = selectedIds
    .map((id) => profileMap.get(id))
    .filter((profile): profile is TeamBuilderProfile => Boolean(profile))

  const benchProfiles = output.profiles.filter((profile) => !selectedIds.includes(profile.id))
  const showDropZones = Boolean(dragSource)
  const selectedEmails = selectedProfiles
    .map((profile) => profile.email?.trim())
    .filter((email): email is string => Boolean(email))

  const canDraftEmail = selectedEmails.length > 0
  const subjectBase =
    output.projectTitle || output.jobDescription.split('\n')[0]?.trim() || 'New mission'
  const mailtoHref = `mailto:${selectedEmails
    .map((email) => encodeURIComponent(email))
    .join(',')}?subject=${encodeURIComponent(`Team assignment: ${subjectBase}`)}`

  useEffect(() => {
    function isOverZone(
      event: PointerEvent,
      zoneRef: RefObject<HTMLElement | null>,
    ) {
      const element = document.elementFromPoint(event.clientX, event.clientY)
      return Boolean(element && zoneRef.current?.contains(element))
    }

    if (dragSource) {
      document.body.classList.add('team-builder-dragging')
      const handlePointerMove = (event: PointerEvent) => {
        event.preventDefault()
        if (isOverZone(event, selectedZoneRef)) {
          setActiveDropZone('selected')
          return
        }
        if (isOverZone(event, benchZoneRef)) {
          setActiveDropZone('bench')
          return
        }
        setActiveDropZone(null)
      }

      const handlePointerUp = (event: PointerEvent) => {
        event.preventDefault()

        const overSelected = isOverZone(event, selectedZoneRef)
        const overBench = isOverZone(event, benchZoneRef)

        if (dragSource.from === 'bench' && overSelected) {
          addToSelected(dragSource.profileId)
        } else if (dragSource.from === 'selected' && overBench) {
          removeFromSelected(dragSource.profileId)
        }

        setDragSource(null)
        setActiveDropZone(null)
        document.body.classList.remove('team-builder-dragging')
      }

      const handlePointerCancel = () => {
        setDragSource(null)
        setActiveDropZone(null)
        document.body.classList.remove('team-builder-dragging')
      }

      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
      window.addEventListener('pointercancel', handlePointerCancel)

      return () => {
        document.body.classList.remove('team-builder-dragging')
        window.removeEventListener('pointermove', handlePointerMove)
        window.removeEventListener('pointerup', handlePointerUp)
        window.removeEventListener('pointercancel', handlePointerCancel)
      }
    } else {
      document.body.classList.remove('team-builder-dragging')
    }
  }, [dragSource])

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
          ref={selectedZoneRef}
          className={`grid gap-3 rounded-xl border p-4 transition-colors ${showDropZones ? (activeDropZone === 'selected' ? 'border-primary ring-2 ring-primary/20' : 'border-border/70') : 'border-transparent'
            }`}
          aria-label="Selected team lineup"
        >
          <h3 className="text-sm font-semibold">Selected lineup</h3>
          {selectedProfiles.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No players selected. Drag from the bench or click add.
            </p>
          ) : (
            <div className="grid justify-start gap-5 [grid-template-columns:repeat(auto-fit,minmax(10rem,10rem))]">
              {selectedProfiles.map((profile) => (
                <PlayerCard
                  key={profile.id}
                  profile={profile}
                  selected
                  rank={recommendationRankByProfileId.get(profile.id)}
                  dragging={draggingProfileId === profile.id}
                  onAdd={addToSelected}
                  onRemove={removeFromSelected}
                  onPointerDown={startDrag}
                />
              ))}
            </div>
          )}
        </section>

        <section
          ref={benchZoneRef}
          className={`grid gap-3 rounded-xl border p-4 transition-colors ${showDropZones ? (activeDropZone === 'bench' ? 'border-primary ring-2 ring-primary/20' : 'border-border/70') : 'border-transparent'
            }`}
          aria-label="Available bench players"
        >
          <h3 className="text-sm font-semibold">Bench (available to swap in)</h3>
          {benchProfiles.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Everyone is currently selected.
            </p>
          ) : (
            <div className="grid justify-start gap-1 [grid-template-columns:repeat(auto-fit,minmax(10rem,10rem))]">
              {benchProfiles.map((profile) => (
                <PlayerCard
                  key={profile.id}
                  profile={profile}
                  selected={false}
                  rank={recommendationRankByProfileId.get(profile.id)}
                  highlight={dragSource?.profileId === profile.id}
                  dragging={draggingProfileId === profile.id}
                  onAdd={addToSelected}
                  onRemove={removeFromSelected}
                  onPointerDown={startDrag}
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
            Start Huddle
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
