import type { ReactNode } from 'react'
import { getCurrentUserProfile } from '@/app/lib/auth/session'
import { AppShell } from '@/components/app-shell'

export default async function ProtectedAppLayout({
  children,
}: {
  children: ReactNode
}) {
  const { user, userName } = await getCurrentUserProfile()

  return (
    <AppShell userEmail={user.email} userName={userName}>
      {children}
    </AppShell>
  )
}
