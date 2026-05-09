import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  CalendarDays,
  Sparkles,
  Target,
  UserRound,
} from 'lucide-react'
import { getCurrentUserProfile } from '@/app/lib/auth/session'
import { getTeamProfileName, type TeamProfile } from '../search'
import { buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type TeamMemberPageProps = {
  params: {
    id: string
  }
}

function formatDate(value: string | null) {
  if (!value) {
    return 'Not recorded'
  }

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function PillList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Nothing recorded yet.</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex h-7 items-center rounded-lg bg-secondary px-2.5 text-xs font-medium text-secondary-foreground"
        >
          {item}
        </span>
      ))}
    </div>
  )
}

export default async function TeamMemberPage({ params }: TeamMemberPageProps) {
  const { supabase } = await getCurrentUserProfile()

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(
      'id, first_name, last_name, skills_to_develop, enjoyable_work, stretch_projects, created_at, updated_at'
    )
    .eq('id', params.id)
    .maybeSingle<TeamProfile>()

  if (profileError || !profile) {
    notFound()
  }

  const profileName = getTeamProfileName(profile)

  return (
    <div className="grid gap-6">
      <div>
        <Link
          href="/team"
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          <ArrowLeft className="size-4" />
          Back to team
        </Link>
      </div>

      <section className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary text-lg font-semibold text-primary-foreground">
            {profile.first_name[0]}
            {profile.last_name[0]}
          </div>
          <div className="min-w-0">
            <p className="truncate text-2xl font-semibold tracking-normal">
              {profileName}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Skills to develop</CardTitle>
            <CardDescription>
              Growth areas this teammate has identified.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PillList items={profile.skills_to_develop} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Work they enjoy most</CardTitle>
            <CardDescription>
              Work patterns that keep contribution energizing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PillList items={profile.enjoyable_work} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Target className="size-5" />
            Growth direction
          </CardTitle>
          <CardDescription>
            Projects that should stretch this teammate in a good way.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            {profile.stretch_projects}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-4" />
              Work modes
            </CardTitle>
            <CardDescription>Preferred contribution styles.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {profile.enjoyable_work.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="size-4" />
              Updated
            </CardTitle>
            <CardDescription>Latest profile refresh.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {formatDate(profile.updated_at)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="size-4" />
              Created
            </CardTitle>
            <CardDescription>Profile creation date.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {formatDate(profile.created_at)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
