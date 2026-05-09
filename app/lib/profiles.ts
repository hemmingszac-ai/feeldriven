export type ProfileNameParts = {
  first_name?: string | null
  last_name?: string | null
}

export function formatProfileName(
  profile: ProfileNameParts | null | undefined,
  fallback = 'Unknown teammate'
) {
  if (!profile) {
    return fallback
  }

  const name = [profile.first_name, profile.last_name]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ')

  return name || fallback
}

export function getNameInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
}

export function getProfileInitials(profile: ProfileNameParts) {
  return getNameInitials(formatProfileName(profile, ''))
}
