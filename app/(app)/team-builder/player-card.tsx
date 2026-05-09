'use client'

import Link from 'next/link'
import { GripVertical, Plus, X } from 'lucide-react'
import type { TeamBuilderProfile } from './types'
import { Button } from '@/components/ui/button'

type PlayerCardProps = {
  profile: TeamBuilderProfile
  rank?: number
  selected: boolean
  highlight?: boolean
  onAdd: (profileId: string) => void
  onRemove: (profileId: string) => void
  onDragStart: (profileId: string, list: 'selected' | 'bench') => void
}

export function PlayerCard({
  profile,
  rank,
  selected,
  highlight = false,
  onAdd,
  onRemove,
  onDragStart,
}: PlayerCardProps) {
  const topTags = [...profile.enjoyableWork, ...profile.skillsToDevelop].slice(0, 2)
  const profileHref = `/organization/${profile.id}`

  return (
    <article
      draggable
      onDragStart={() => onDragStart(profile.id, selected ? 'selected' : 'bench')}
      className={`group relative min-h-44 rounded-xl border p-3 shadow-sm transition ${
        selected
          ? 'border-primary/40 bg-gradient-to-b from-primary/15 via-background to-background'
          : 'border-border/60 bg-gradient-to-b from-secondary/20 to-background'
      } ${highlight ? 'ring-2 ring-primary/35' : ''}`}
    >
      <div className="absolute right-2 top-2 flex items-center gap-1.5">
        {typeof rank === 'number' ? (
          <span className="inline-flex h-5 items-center rounded-md border border-border/70 bg-background px-1.5 text-[11px] font-semibold">
            #{rank + 1}
          </span>
        ) : null}
        <GripVertical className="size-3.5 text-muted-foreground" />
      </div>

      <div className="grid h-full gap-2.5 pt-5">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Player</p>
          <h3 className="truncate text-base font-semibold">
            <Link
              href={profileHref}
              className="truncate font-semibold text-primary underline-offset-4 transition hover:underline"
            >
              {profile.name}
            </Link>
          </h3>
          <p className="truncate text-xs text-muted-foreground">
            {profile.email ?? 'No work email on profile'}
          </p>
        </div>

        <div className="flex flex-wrap gap-1">
          {topTags.length ? (
            topTags.map((tag) => (
              <span
                key={`${profile.id}-${tag}`}
                className="inline-flex h-5 items-center rounded-md border border-border/70 bg-background px-1.5 text-[10px]"
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="inline-flex h-5 items-center rounded-md border border-border/70 bg-background px-1.5 text-[10px]">
              General contributor
            </span>
          )}
        </div>

        <div className="mt-auto pt-0.5">
          {selected ? (
            <Button
              type="button"
              variant="outline"
              size="xs"
              className="w-full"
              onClick={() => onRemove(profile.id)}
            >
              <X className="size-3.5" />
              Remove
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="xs"
              className="w-full"
              onClick={() => onAdd(profile.id)}
            >
              <Plus className="size-3.5" />
              Add
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}
