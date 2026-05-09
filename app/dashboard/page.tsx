import { redirect } from 'next/navigation'
import { signout } from '../auth/actions'
import { createClient } from '../lib/supabase/server'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
    .schema('dbo')
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError || !profile) {
    redirect('/profile/setup')
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-12">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-3xl">Dashboard</CardTitle>
          <CardDescription>
            Welcome back, {profile.first_name} {profile.last_name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your FieldDriven workspace is ready for the next product workflow.
          </p>
        </CardContent>
        <CardFooter>
        <form>
            <Button formAction={signout} type="submit" variant="outline">
              Sign out
            </Button>
        </form>
        </CardFooter>
      </Card>
    </main>
  )
}
