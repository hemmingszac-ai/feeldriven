export type TeamProfile = {
  id: string
  first_name: string
  last_name: string
  skills_to_develop: string[]
  enjoyable_work: string[]
  stretch_projects: string
  created_at: string | null
  updated_at: string | null
}

export function getTeamProfileName(profile: Pick<TeamProfile, 'first_name' | 'last_name'>) {
  return `${profile.first_name} ${profile.last_name}`
}

export function filterTeamProfiles(
  profiles: TeamProfile[],
  query: string | undefined
) {
  const normalizedQuery = query?.trim().toLowerCase() ?? ''

  if (!normalizedQuery) {
    return profiles
  }

  return profiles.filter((profile) =>
    getTeamProfileName(profile).toLowerCase().includes(normalizedQuery)
  )
}
