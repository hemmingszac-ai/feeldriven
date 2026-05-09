import { redirect } from 'next/navigation'
import { Award, Brain, CalendarDays, Sparkles, Target, UserRound } from 'lucide-react'
import { createClient } from '../lib/supabase/server'
import { AppShell } from '@/components/app-shell'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type Profile = {
  first_name: string
  last_name: string
  skills_to_develop: string[]
  enjoyable_work: string[]
  stretch_projects: string
  created_at: string | null
  updated_at: string | null
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

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(
      'first_name, last_name, skills_to_develop, enjoyable_work, stretch_projects, created_at, updated_at'
    )
    .eq('id', user.id)
    .maybeSingle<Profile>()

  if (profileError || !profile) {
    redirect('/profile/setup')
  }

  const fullName = `${profile.first_name} ${profile.last_name}`
  const role = user.user_metadata?.role ?? 'Role not set'
  const skillCount = profile.skills_to_develop.length
  const workTypeCount = profile.enjoyable_work.length

  return (
    <AppShell active="profile" userEmail={user.email} userName={fullName}>
      <div className="grid gap-6">
        <section className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary text-lg font-semibold text-primary-foreground">
                {profile.first_name[0]}
                {profile.last_name[0]}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-muted-foreground">
                  FieldDriven profile
                </p>
                <h1 className="mt-1 truncate text-3xl font-semibold tracking-normal">
                  {fullName}
                </h1>
              </div>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium">
              <Award className="size-4" />
              {role}
            </div>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="size-4" />
                Skills
              </CardTitle>
              <CardDescription>Development signals captured.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{skillCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-4" />
                Work modes
              </CardTitle>
              <CardDescription>Preferred contribution styles.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{workTypeCount}</p>
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
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Skills to develop</CardTitle>
              <CardDescription>
                Growth areas FieldDriven can use when shaping missions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PillList items={profile.skills_to_develop} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Work you enjoy most</CardTitle>
              <CardDescription>
                The work patterns most likely to keep momentum high.
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
              Projects that should stretch you in a good way.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              {profile.stretch_projects}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="size-4" />
              Profile record
            </CardTitle>
            <CardDescription>
              Account profile dates for workspace setup.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Created</p>
              <p className="font-medium">{formatDate(profile.created_at)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Last updated</p>
              <p className="font-medium">{formatDate(profile.updated_at)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
