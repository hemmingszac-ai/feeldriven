import Link from 'next/link'
import { Search, UserRound, UsersRound } from 'lucide-react'
import { getProfileInitials } from '@/app/lib/profiles'
import {
  filterOrganizationProfiles,
  getOrganizationProfileName,
  type OrganizationProfile,
} from './search'
import { getCurrentUserProfile } from '@/app/lib/auth/session'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ProfileListCard } from '@/components/profile-view'

type OrganizationPageProps = {
  searchParams?: {
    q?: string
  }
}

export default async function OrganizationPage({ searchParams }: OrganizationPageProps) {
  const { supabase } = await getCurrentUserProfile()

  const { data: profiles = [] } = await supabase
    .from('profiles')
    .select(
      'id, first_name, last_name, role, skills_to_develop, enjoyable_work, stretch_projects'
    )
    .order('first_name', { ascending: true })
    .order('last_name', { ascending: true })

  const query = searchParams?.q ?? ''
  const organizationProfiles = profiles as OrganizationProfile[]
  const filteredProfiles = filterOrganizationProfiles(organizationProfiles, query)

  return (
    <div className="grid gap-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <form action="/organization" className="flex w-full gap-2 md:w-96">
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

      {organizationProfiles.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <UsersRound className="mx-auto size-9 text-muted-foreground" />
            <p className="mt-3 font-medium">No organization profiles yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Organization members will appear here after they complete profile setup.
            </p>
          </CardContent>
        </Card>
      ) : filteredProfiles.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Search className="mx-auto size-9 text-muted-foreground" />
            <p className="mt-3 font-medium">No matching organization members</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try searching for another first or last name.
            </p>
          </CardContent>
        </Card>
      ) : (
        <section className="grid gap-3" aria-label="Organization members">
          {filteredProfiles.map((profile) => (
            <ProfileListCard
              key={profile.id}
              initials={getProfileInitials(profile)}
              title={getOrganizationProfileName(profile)}
              description={`${profile.skills_to_develop.length} skills to develop`}
              action={
                <Link
                  href={`/organization/${profile.id}`}
                  className={buttonVariants({ variant: 'outline', size: 'sm' })}
                >
                  <UserRound className="size-4" />
                  View profile
                </Link>
              }
            />
          ))}
        </section>
      )}
    </div>
  )
}
