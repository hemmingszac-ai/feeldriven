import { redirect } from 'next/navigation'
import { signout } from '../auth/actions'
import { createClient } from '../lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <main>
      <section>
        <h1>Dashboard</h1>
        <p>You are signed in as {user.email}.</p>
        <form>
          <button formAction={signout}>Sign out</button>
        </form>
      </section>
    </main>
  )
}
