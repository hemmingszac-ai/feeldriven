import { redirect } from 'next/navigation'
import { TeamBuilderWorkspace } from './team-builder-workspace'
import { getCurrentUserProfile } from '@/app/lib/auth/session'

export default async function TeamBuilderPage() {
  const { user } = await getCurrentUserProfile()

  if (user.user_metadata?.role !== 'Team Manager') {
    redirect('/shout-outs')
  }

  return <TeamBuilderWorkspace />
}
