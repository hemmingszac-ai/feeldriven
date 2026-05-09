import type { ReactNode } from 'react'
import { getCurrentUserProfile } from '@/app/lib/auth/session'
import { AppShell } from '@/components/app-shell'

export default async function ProtectedAppLayout({
  children,
}: {
  children: ReactNode
}) {
  const { user, userName } = await getCurrentUserProfile()
  const userRole = user.user_metadata?.role

  return (
    <AppShell userEmail={user.email} userName={userName} userRole={userRole}>
      {children}
    </AppShell>
  )
}
