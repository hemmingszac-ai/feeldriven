import type { ReactNode } from 'react'
import { getCurrentUserProfile } from '@/app/lib/auth/session'
import { getIsManager } from '@/app/lib/user-metadata'
import { AppShell } from '@/components/app-shell'

export default async function ProtectedAppLayout({
  children,
}: {
  children: ReactNode
}) {
  const { user, userName } = await getCurrentUserProfile()
  const isManager = getIsManager(user.user_metadata)

  return (
    <AppShell userEmail={user.email} userName={userName} isManager={isManager}>
      {children}
    </AppShell>
  )
}
