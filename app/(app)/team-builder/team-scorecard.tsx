'use client'

import type { RefObject } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { TeamBuilderOutput, TeamBuilderProfile } from './types'
import { PlayerCard } from './player-card'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { TeamBuilderEmail } from './team-builder-email'

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

  const profileOrderById = useMemo(
    () => new Map(output.profiles.map((profile, index) => [profile.id, index] as const)),
    [output.profiles],
  )

  const sortProfilesByRecommendation = (profiles: TeamBuilderProfile[]) =>
    [...profiles].sort((left, right) => {
      const leftRank = recommendationRankByProfileId.get(left.id)
      const rightRank = recommendationRankByProfileId.get(right.id)

      if (leftRank != null && rightRank != null) {
        if (leftRank !== rightRank) {
          return leftRank - rightRank
        }

        return (
          (profileOrderById.get(left.id) ?? 0) - (profileOrderById.get(right.id) ?? 0)
        )
      }

      if (leftRank != null) {
        return -1
      }

      if (rightRank != null) {
        return 1
      }

      return (profileOrderById.get(left.id) ?? 0) - (profileOrderById.get(right.id) ?? 0)
    })

  const selectedProfiles = sortProfilesByRecommendation(
    selectedIds
      .map((id) => profileMap.get(id))
      .filter((profile): profile is TeamBuilderProfile => Boolean(profile)),
  )
  const benchProfiles = sortProfilesByRecommendation(
    output.profiles.filter((profile) => !selectedIds.includes(profile.id)),
  )
  const showDropZones = Boolean(dragSource)

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
            <div className="grid justify-start gap-x-2 gap-y-1 [grid-template-columns:repeat(auto-fit,minmax(10rem,10rem))]">
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
            <div className="grid justify-start gap-x-2 gap-y-1 [grid-template-columns:repeat(auto-fit,minmax(10rem,10rem))]">
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

        <TeamBuilderEmail output={output} selectedIds={selectedIds} />
      </CardContent>
    </Card>
  )
}
