export type TeamBuilderProfile = {
  id: string
  name: string
  email: string | null
  skillsToDevelop: string[]
  enjoyableWork: string[]
  stretchProjects: string
}

export type TeamBuilderOutput = {
  profileIds: string[]
  requiredTeamSize: number
  rationale: string
  profiles: TeamBuilderProfile[]
  projectTitle: string
  jobDescription: string
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
