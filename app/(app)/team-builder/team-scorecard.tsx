'use client'

import type { ReactNode, RefObject } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useFormState, useFormStatus } from 'react-dom'
import type { TeamBuilderOutput, TeamBuilderProfile } from './types'
import { PlayerCard } from './player-card'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { TeamBuilderEmail } from './team-builder-email'
import {
  regenerateTeamBuilderEmailBody,
  type TeamBuilderEmailFormState,
} from './email-body-actions'
import {
  getRatingCacheKey,
  upsertRatingCacheEntry,
} from './rating-cache'

type DragSource = {
  profileId: string
  from: 'selected' | 'bench'
}

type TeamScorecardProps = {
  output: TeamBuilderOutput
  selectedIds: string[]
  onSelectedIdsChange: (selectedIds: string[]) => void
  onOutputUpdate: (output: TeamBuilderOutput) => void
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
      className="ml-auto rounded-full border-primary/20 bg-primary/5 px-3.5 text-primary shadow-none hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
    >
      <RefreshCw className={`size-3.5 ${pending ? 'animate-spin' : ''}`} />
      {pending ? 'Regenerating' : 'Regenerate ratings and email body'}
    </Button>
  )
}

function RatingBadge({
  label,
  value,
  featured = false,
}: {
  label: string
  value: number
  featured?: boolean
}) {
  return (
    <div className="grid justify-items-center gap-1">
      <div
        className={`grid rounded-full border-2 bg-background text-center shadow-sm ${
          featured
            ? 'size-16 border-primary text-primary'
            : 'size-14 border-border text-foreground'
        } place-items-center`}
      >
        <span
          className={`font-heading leading-none ${
            featured ? 'text-2xl' : 'text-xl'
          }`}
        >
          {value}
        </span>
      </div>
      <span className="text-[0.68rem] font-semibold uppercase text-muted-foreground">
        {label}
      </span>
    </div>
  )
}

export function TeamScorecard({
  output,
  selectedIds,
  onSelectedIdsChange,
  onOutputUpdate,
}: TeamScorecardProps) {
  const [dragSource, setDragSource] = useState<DragSource | null>(null)
  const [activeDropZone, setActiveDropZone] = useState<'selected' | 'bench' | null>(null)
  const [regenerateState, regenerateFormAction] = useFormState(
    regenerateTeamBuilderEmailBody,
    initialEmailState,
  )
  const [emailBody, setEmailBody] = useState(output.emailBody)
  const [ratings, setRatings] = useState(output.ratings)
  const [ratingCache, setRatingCache] = useState(output.ratingCache)
  const selectedZoneRef = useRef<HTMLElement | null>(null)
  const benchZoneRef = useRef<HTMLElement | null>(null)
  const appliedRegenerationKey = useRef<string | null>(null)
  const draggingProfileId = dragSource?.profileId ?? null
  const managerProfileId = output.managerProfileId

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

  const managerProfile = managerProfileId
    ? profileMap.get(managerProfileId)
    : undefined
  const selectedNonManagerProfiles = sortProfilesByRecommendation(
    selectedIds
      .filter((id) => id !== managerProfileId)
      .map((id) => profileMap.get(id))
      .filter((profile): profile is TeamBuilderProfile => Boolean(profile)),
  )
  const selectedProfiles = managerProfile
    ? [managerProfile, ...selectedNonManagerProfiles]
    : selectedNonManagerProfiles
  const currentRatingProfileIds = selectedProfiles.map((profile) => profile.id)
  const currentRatingProfileKey = getRatingCacheKey(currentRatingProfileIds)
  const recommendedProfiles = [
    ...(managerProfile ? [managerProfile] : []),
    ...output.profileIds
      .map((id) => profileMap.get(id))
      .filter((profile): profile is TeamBuilderProfile => Boolean(profile)),
  ]
  const benchProfiles = sortProfilesByRecommendation(
    output.profiles.filter(
      (profile) =>
        profile.id !== managerProfileId && !selectedIds.includes(profile.id),
    ),
  )
  const showDropZones = Boolean(dragSource)
  const canRegenerateEmail = selectedNonManagerProfiles.length > 0

  function renderCardRow(
    profiles: TeamBuilderProfile[],
    renderCard: (profile: TeamBuilderProfile) => ReactNode,
  ) {
    return (
      <div className="team-builder-scroll-row flex flex-nowrap gap-2 overflow-x-auto overflow-y-hidden pb-1">
        {profiles.map((profile) => (
          <div key={profile.id} className="w-40 shrink-0">
            {renderCard(profile)}
          </div>
        ))}
      </div>
    )
  }

  useEffect(() => {
    setEmailBody(output.emailBody)
    setRatings(output.ratings)
    setRatingCache(output.ratingCache)
  }, [output.emailBody, output.ratingCache, output.ratings])

  useEffect(() => {
    if (regenerateState.status === 'success') {
      const regenerationKey = [
        getRatingCacheKey(regenerateState.ratingProfileIds),
        regenerateState.emailBody,
        regenerateState.ratings.overall,
        regenerateState.ratings.skills,
        regenerateState.ratings.drive,
        regenerateState.ratings.chemistry,
      ].join('|')

      if (appliedRegenerationKey.current === regenerationKey) {
        return
      }

      appliedRegenerationKey.current = regenerationKey
      const nextRatingCache = upsertRatingCacheEntry(
        ratingCache,
        regenerateState.ratingProfileIds,
        regenerateState.ratings,
      )
      const isCurrentLineup =
        getRatingCacheKey(regenerateState.ratingProfileIds) ===
        currentRatingProfileKey

      setEmailBody(regenerateState.emailBody)
      setRatingCache(nextRatingCache)
      if (isCurrentLineup) {
        setRatings(regenerateState.ratings)
      }
      onOutputUpdate({
        ...output,
        emailBody: regenerateState.emailBody,
        ratings: isCurrentLineup ? regenerateState.ratings : ratings,
        ratingCache: nextRatingCache,
      })
    }
  }, [
    currentRatingProfileKey,
    output,
    onOutputUpdate,
    ratingCache,
    ratings,
    regenerateState.status,
    regenerateState.status === 'success' ? regenerateState.emailBody : null,
    regenerateState.status === 'success'
      ? getRatingCacheKey(regenerateState.ratingProfileIds)
      : null,
    regenerateState.status === 'success' ? regenerateState.ratings : null,
  ])

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
    if (profileId === managerProfileId) {
      return
    }

    onSelectedIdsChange(selectedIds.filter((id) => id !== profileId))
  }

  function addToSelected(profileId: string) {
    if (profileId === managerProfileId) {
      return
    }

    if (selectedIds.includes(profileId)) {
      return
    }
    onSelectedIdsChange([...selectedIds, profileId])
  }

  function startDrag(profileId: string, from: 'selected' | 'bench') {
    if (profileId === managerProfileId) {
      return
    }

    setDragSource({ profileId, from })
  }

  return (
    <Card className="mt-6 border-primary/20 bg-linear-to-b from-primary/5 to-background">
      <form action={regenerateFormAction}>
        <CardHeader className="gap-2">
          <div className="grid gap-1">
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
            <p className="w-full text-sm leading-6 text-muted-foreground">
              {output.selectionSummary}
            </p>
            <div className="flex flex-wrap items-end gap-3 pt-2">
              <RatingBadge label="OVR" value={ratings.overall} featured />
              <RatingBadge label="Skills" value={ratings.skills} />
              <RatingBadge label="Drive" value={ratings.drive} />
              <RatingBadge label="Chemistry" value={ratings.chemistry} />
              <RegenerateButton disabled={!canRegenerateEmail} />
            </div>
          </div>
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
              renderCardRow(selectedProfiles, (profile) => (
                  <PlayerCard
                    profile={profile}
                    selected
                    rank={
                      profile.id === managerProfileId
                        ? undefined
                        : recommendationRankByProfileId.get(profile.id)
                    }
                    isManager={profile.id === managerProfileId}
                    dragging={draggingProfileId === profile.id}
                    onAdd={addToSelected}
                    onRemove={removeFromSelected}
                    onPointerDown={startDrag}
                  />
              ))
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
              renderCardRow(benchProfiles, (profile) => (
                  <PlayerCard
                    profile={profile}
                    selected={false}
                    rank={recommendationRankByProfileId.get(profile.id)}
                    highlight={dragSource?.profileId === profile.id}
                    dragging={draggingProfileId === profile.id}
                    onAdd={addToSelected}
                    onRemove={removeFromSelected}
                    onPointerDown={startDrag}
                  />
              ))
            )}
          </section>

          <TeamBuilderEmail
            output={output}
            selectedIds={selectedIds}
            emailBody={emailBody}
            regenerateState={regenerateState}
            onEmailBodyChange={setEmailBody}
          />
          <input type="hidden" name="projectTitle" value={output.projectTitle} />
          <input type="hidden" name="jobDescription" value={output.jobDescription} />
          <input type="hidden" name="emailComms" value={output.emailComms} />
          {selectedIds
            .filter((profileId) => profileId !== output.managerProfileId)
            .map((profileId) => (
              <input
                key={`email-${profileId}`}
                type="hidden"
                name="selectedProfileIds"
                value={profileId}
              />
            ))}
          {selectedProfiles.map((profile) => (
            <input
              key={`rating-${profile.id}`}
              type="hidden"
              name="ratingProfileIds"
              value={profile.id}
            />
          ))}
          {recommendedProfiles.map((profile) => (
            <input
              key={`recommended-rating-${profile.id}`}
              type="hidden"
              name="recommendedRatingProfileIds"
              value={profile.id}
            />
          ))}
          <input
            type="hidden"
            name="ratingCache"
            value={JSON.stringify(ratingCache)}
          />
        </CardContent>
      </form>
    </Card>
  )
}
