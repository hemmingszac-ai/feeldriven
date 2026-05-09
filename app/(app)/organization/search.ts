import { formatProfileName } from '@/app/lib/profiles'

export type OrganizationProfile = {
  id: string
  first_name: string
  last_name: string
  skills_to_develop: string[]
  enjoyable_work: string[]
  stretch_projects: string
}

export function getOrganizationProfileName(
  profile: Pick<OrganizationProfile, 'first_name' | 'last_name'>
) {
  return formatProfileName(profile)
}

export function filterOrganizationProfiles(
  profiles: OrganizationProfile[],
  query: string | undefined
) {
  const normalizedQuery = query?.trim().toLowerCase() ?? ''

  if (!normalizedQuery) {
    return profiles
  }

  return profiles.filter((profile) =>
    getOrganizationProfileName(profile).toLowerCase().includes(normalizedQuery)
  )
}
