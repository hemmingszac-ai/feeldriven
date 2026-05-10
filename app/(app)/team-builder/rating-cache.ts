import type {
  TeamBuilderRatingCacheEntry,
  TeamBuilderRatings,
} from './types'

export function canonicalProfileIds(profileIds: string[]) {
  return Array.from(new Set(profileIds)).sort()
}

export function getRatingCacheKey(profileIds: string[]) {
  return canonicalProfileIds(profileIds).join('|')
}

export function getCachedRatings(
  ratingCache: TeamBuilderRatingCacheEntry[],
  profileIds: string[],
) {
  const key = getRatingCacheKey(profileIds)

  return ratingCache.find(
    (entry) => getRatingCacheKey(entry.profileIds) === key,
  )?.ratings
}

export function upsertRatingCacheEntry(
  ratingCache: TeamBuilderRatingCacheEntry[],
  profileIds: string[],
  ratings: TeamBuilderRatings,
) {
  const key = getRatingCacheKey(profileIds)
  const nextEntry = {
    profileIds: canonicalProfileIds(profileIds),
    ratings,
  }
  const existingIndex = ratingCache.findIndex(
    (entry) => getRatingCacheKey(entry.profileIds) === key,
  )

  if (existingIndex === -1) {
    return [...ratingCache, nextEntry]
  }

  return ratingCache.map((entry, index) =>
    index === existingIndex ? nextEntry : entry,
  )
}
