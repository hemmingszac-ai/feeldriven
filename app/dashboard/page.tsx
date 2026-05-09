import { redirect } from 'next/navigation'
import { BadgeCheck, Radar, Sparkles } from 'lucide-react'
import { createClient } from '../lib/supabase/server'
import { AppShell } from '@/components/app-shell'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError || !profile) {
    redirect('/profile/setup')
  }

  return (
    <AppShell
      active="dashboard"
      userEmail={user.email}
      userName={`${profile.first_name} ${profile.last_name}`}
    >
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BadgeCheck className="size-4 text-primary" />
                Profile ready
              </CardTitle>
              <CardDescription>Your FeelDriven identity is set.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">100%</p>
            </CardContent>
          </Card>
          <Card className="border-t-4 border-t-info">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-4 text-info" />
                Growth focus
              </CardTitle>
              <CardDescription>Skills selected for development.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">Active</p>
            </CardContent>
          </Card>
          <Card className="border-t-4 border-t-warning">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radar className="size-4 text-warning" />
                Mission fit
              </CardTitle>
              <CardDescription>Work preferences ready for matching.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">Mapped</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Workspace pulse</CardTitle>
            <CardDescription>
              FeelDriven is ready to turn team goals into shared missions,
              progress, and recognition.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Your profile now gives the workspace a starting point for matching
              work to strengths, growth edges, and the type of projects that
              keep contribution energizing.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
