'use client'

import type { PointerEvent as ReactPointerEvent } from 'react'
import Link from 'next/link'
import { BriefcaseBusiness, Check, GripVertical, Plus, X } from 'lucide-react'
import type { TeamBuilderProfile } from './types'
import { Button } from '@/components/ui/button'

type PlayerCardProps = {
  profile: TeamBuilderProfile
  rank?: number
  selected: boolean
  highlight?: boolean
  dragging?: boolean
  onAdd: (profileId: string) => void
  onRemove: (profileId: string) => void
  onPointerDown: (
    profileId: string,
    list: 'selected' | 'bench',
    event: ReactPointerEvent<HTMLElement>,
  ) => void
}

export function PlayerCard({
  profile,
  rank,
  selected,
  highlight = false,
  dragging = false,
  onAdd,
  onRemove,
  onPointerDown,
}: PlayerCardProps) {
  const attributeRows = [
    ...profile.enjoyableWork,
    ...profile.skillsToDevelop,
  ].slice(0, 3)
  const profileHref = `/organization/${profile.id}`

  return (
    <article
      onPointerDown={(event) => {
        if (event.pointerType === 'touch') {
          return
        }

        const target = event.target as HTMLElement | null
        if (target?.closest('a,button,input,textarea,select,label')) {
          return
        }

        event.preventDefault()
        onPointerDown(profile.id, selected ? 'selected' : 'bench', event)
      }}
      data-dragging={dragging ? 'true' : 'false'}
      className={`team-builder-player-card group relative aspect-[4/6] w-full max-w-40 cursor-grab select-none touch-pan-x overflow-hidden active:cursor-grabbing rounded-xl border-2 p-1.5 shadow-sm transition ${
        selected
          ? 'border-primary/60 bg-gradient-to-b from-primary/15 via-background to-background'
          : 'border-border/80 bg-gradient-to-b from-secondary/20 to-background'
      } ${highlight ? 'ring-2 ring-primary/35' : ''} ${dragging ? 'cursor-grabbing opacity-90' : ''}`}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="absolute bottom-1.5 right-1.5 size-6 touch-none cursor-grab active:cursor-grabbing"
        aria-label={`Drag ${profile.name}`}
        title={`Drag ${profile.name}`}
        onPointerDown={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onPointerDown(profile.id, selected ? 'selected' : 'bench', event)
        }}
      >
        <GripVertical className="size-3.5" />
      </Button>

      <div className="absolute right-1.5 top-1.5 flex items-center gap-1">
        {typeof rank === 'number' ? (
          <span className="inline-flex h-5 items-center rounded-md border border-border/70 bg-background px-1.5 text-[10px] font-semibold text-foreground">
            #{rank + 1}
          </span>
        ) : null}
        {selected ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="size-6"
            onClick={() => onRemove(profile.id)}
            aria-label={`Remove ${profile.name}`}
          >
            <X className="size-3.5" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="size-6"
            onClick={() => onAdd(profile.id)}
            aria-label={`Add ${profile.name}`}
          >
            <Plus className="size-3.5" />
          </Button>
        )}
      </div>

      <div className="grid h-full min-h-0 gap-1 pt-6">
        <div className="grid gap-1">
          <h3 className="grid text-[1.3rem] font-semibold leading-none">
            <Link
              href={profileHref}
              className="block truncate font-semibold text-primary underline-offset-4 transition hover:underline"
            >
              {profile.name.split(' ').map((part, index) => (
                <span key={`${profile.id}-${part}-${index}`} className="block truncate">
                  {part}
                </span>
              ))}
            </Link>
          </h3>
          {profile.role ? (
            <p className="flex items-center gap-1 text-[10px] leading-tight text-muted-foreground">
              <BriefcaseBusiness className="size-3 shrink-0" />
              <span className="truncate">{profile.role}</span>
            </p>
          ) : null}
        </div>

        <div className="grid min-h-0 gap-0 overflow-hidden">
          <div className="grid gap-0.5 overflow-hidden">
            {attributeRows.length ? (
              attributeRows.map((tag) => (
                <div
                  key={`${profile.id}-${tag}`}
                  className="flex items-start gap-1 overflow-hidden text-[11px] leading-tight text-foreground"
                >
                  <Check className="mt-0.5 size-3 shrink-0 text-success" />
                  <span className="truncate">{tag}</span>
                </div>
              ))
            ) : (
              <div className="flex items-start gap-1 text-[11px] leading-tight text-foreground">
                <Check className="mt-0.5 size-3 shrink-0 text-success" />
                <span>General contributor</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto flex items-end justify-end pt-0.5" />
      </div>
    </article>
  )
}
