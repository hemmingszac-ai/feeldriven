'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'

function fail(message: string): never {
  redirect(`/team-builder?error=${encodeURIComponent(message)}`)
}

export async function submitTeamBuilderInput(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  if (user.user_metadata?.role !== 'Team Manager') {
    redirect('/dashboard')
  }

  const emailComms = formData.get('emailComms')?.toString().trim() ?? ''
  const jobDescription = formData.get('jobDescription')?.toString().trim() ?? ''

  if (!emailComms) {
    fail('Please paste the relevant email communications.')
  }

  if (!jobDescription) {
    fail('Please add a job description before continuing.')
  }

  // Placeholder until AI processing is wired up.
  redirect('/team-builder?status=ready')
}
