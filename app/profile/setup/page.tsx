import { redirect } from 'next/navigation'
import { ProfileSetupForm } from './ProfileSetupForm'
import { createClient } from '../../lib/supabase/server'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card'

type ProfileSetupPageProps = {
  searchParams?: {
    error?: string
  }
}

export default async function ProfileSetupPage({
  searchParams,
}: ProfileSetupPageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (profile) {
    redirect('/dashboard')
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-12">
      <Card className="w-full">
        <CardHeader>
          <CardDescription>
            Tell FeelDriven how you work so the workspace can personalize your
            next steps.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileSetupForm error={searchParams?.error} />
        </CardContent>
      </Card>
    </main>
  )
}
