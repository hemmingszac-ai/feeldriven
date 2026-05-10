export type TeamBuilderProfile = {
  id: string
  name: string
  email: string | null
  role: string | null
  skillsToDevelop: string[]
  enjoyableWork: string[]
  stretchProjects: string
}

export type TeamBuilderChemistryLink = {
  sourceProfileId: string
  targetProfileId: string
  count: number
}

export type TeamBuilderRatings = {
  overall: number
  skills: number
  drive: number
  chemistry: number
}

export type TeamBuilderRatingCacheEntry = {
  profileIds: string[]
  ratings: TeamBuilderRatings
}

export type TeamBuilderOutput = {
  profileIds: string[]
  managerProfileId: string | null
  chemistryLinks: TeamBuilderChemistryLink[]
  ratings: TeamBuilderRatings
  ratingCache: TeamBuilderRatingCacheEntry[]
  selectionSummary: string
  subject: string
  emailBody: string
  profiles: TeamBuilderProfile[]
  projectTitle: string
  jobDescription: string
  emailComms: string
}

export type TeamBuilderFormState =
  | {
      status: 'idle'
    }
  | {
      status: 'error'
      error: string
    }
  | {
      status: 'success'
      output: TeamBuilderOutput
    }
