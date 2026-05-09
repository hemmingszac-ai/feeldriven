export type TeamBuilderProfile = {
  id: string
  name: string
  email: string | null
  role: string | null
  skillsToDevelop: string[]
  enjoyableWork: string[]
  stretchProjects: string
}

export type TeamBuilderOutput = {
  profileIds: string[]
  managerProfileId: string | null
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
