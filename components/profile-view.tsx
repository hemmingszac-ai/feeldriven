import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Target } from 'lucide-react'
import { PillList } from '@/components/pill-list'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type ProfileHeroProps = {
  name: string
  initials: string
  meta?: ReactNode
  action?: ReactNode
}

type ProfileMetric = {
  icon: LucideIcon
  title: string
  description: string
  value: ReactNode
}

type ProfileSection = {
  title: string
  description: string
  items: string[]
  emptyMessage?: string
}

type ProfileListCardProps = {
  initials: string
  title: string
  description?: ReactNode
  action?: ReactNode
}

export function ProfileHero({
  name,
  initials,
  meta,
  action,
}: ProfileHeroProps) {
  return (
    <section className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary text-lg font-semibold text-primary-foreground">
            {initials}
          </div>
          <div className="min-w-0">
            <h1 className="mt-1 truncate text-3xl font-semibold tracking-normal">
              {name}
            </h1>
            {meta ? <div className="mt-2 min-w-0">{meta}</div> : null}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </section>
  )
}

export function ProfileMetricsGrid({ metrics }: { metrics: ProfileMetric[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {metrics.map(({ icon: Icon, title, description, value }) => (
        <Card key={title}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon className="size-4" />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function ProfileDetailsGrid({ sections }: { sections: ProfileSection[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {sections.map(({ title, description, items, emptyMessage }) => (
        <Card key={title}>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <PillList items={items} emptyMessage={emptyMessage} />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function ProfileGrowthCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Target className="size-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export function ProfileListCard({
  initials,
  title,
  description,
  action,
}: ProfileListCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <CardTitle className="truncate text-lg">{title}</CardTitle>
          {description ? (
            <CardDescription className="truncate">{description}</CardDescription>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </CardHeader>
    </Card>
  )
}
