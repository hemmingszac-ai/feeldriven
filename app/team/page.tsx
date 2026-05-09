import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Search, UserRound, UsersRound } from 'lucide-react'
import { createClient } from '../lib/supabase/server'
import {
  filterTeamProfiles,
  getTeamProfileName,
  type TeamProfile,
} from './search'
import { AppShell } from '@/components/app-shell'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'

type TeamPageProps = {
  searchParams?: {
    q?: string
  }
}

function Initials({ profile }: { profile: TeamProfile }) {
  return (
    <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
      {profile.first_name[0]}
      {profile.last_name[0]}
    </div>
  )
}

export default async function TeamPage({ searchParams }: TeamPageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: currentProfile, error: currentProfileError } = await supabase
    .from('profiles')
    .select('id, first_name, last_name')
    .eq('id', user.id)
    .maybeSingle<Pick<TeamProfile, 'id' | 'first_name' | 'last_name'>>()

  if (currentProfileError || !currentProfile) {
    redirect('/profile/setup')
  }

  const { data: profiles = [] } = await supabase
    .from('profiles')
    .select(
      'id, first_name, last_name, skills_to_develop, enjoyable_work, stretch_projects, created_at, updated_at'
    )
    .order('first_name', { ascending: true })
    .order('last_name', { ascending: true })

  const query = searchParams?.q ?? ''
  const teamProfiles = profiles as TeamProfile[]
  const filteredProfiles = filterTeamProfiles(teamProfiles, query)
  const currentUserName = getTeamProfileName(currentProfile)

  return (
    <AppShell active="team" userEmail={user.email} userName={currentUserName}>
      <div className="grid gap-6">
        <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <form action="/team" className="flex w-full gap-2 md:w-96">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={query}
                placeholder="Search by name"
                className="pl-8"
              />
            </div>
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>
        </section>

        {teamProfiles.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <UsersRound className="mx-auto size-9 text-muted-foreground" />
              <p className="mt-3 font-medium">No team profiles yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Teammates will appear here after they complete profile setup.
              </p>
            </CardContent>
          </Card>
        ) : filteredProfiles.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <Search className="mx-auto size-9 text-muted-foreground" />
              <p className="mt-3 font-medium">No matching teammates</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try searching for another first or last name.
              </p>
            </CardContent>
          </Card>
        ) : (
          <section className="grid gap-3" aria-label="Team members">
            {filteredProfiles.map((profile) => (
              <Card key={profile.id}>
                <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                  <Initials profile={profile} />
                  <div className="min-w-0 flex-1">
                    <CardTitle className="truncate text-lg">
                      {getTeamProfileName(profile)}
                    </CardTitle>
                    <CardDescription>
                      {profile.skills_to_develop.length} skills to develop
                    </CardDescription>
                  </div>
                  <Link
                    href={`/team/${profile.id}`}
                    className={buttonVariants({ variant: 'outline', size: 'sm' })}
                  >
                    <UserRound className="size-4" />
                    View profile
                  </Link>
                </CardHeader>
              </Card>
            ))}
          </section>
        )}
      </div>
    </AppShell>
  )
}
