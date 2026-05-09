import { redirect } from 'next/navigation'
import { TeamBuilderWorkspace } from './team-builder-workspace'
import { getCurrentUserProfile } from '@/app/lib/auth/session'
import { getIsManager } from '@/app/lib/user-metadata'

export default async function TeamBuilderPage() {
  const { user } = await getCurrentUserProfile()

  if (!getIsManager(user.user_metadata)) {
    redirect('/shout-outs')
  }

  return <TeamBuilderWorkspace />
}
