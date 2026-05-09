import { cache } from 'react'
import { redirect } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/app/lib/supabase/server'

export type CurrentProfile = {
  id: string
  first_name: string
  last_name: string
  skills_to_develop: string[]
  enjoyable_work: string[]
  stretch_projects: string
  created_at: string | null
  updated_at: string | null
}

export const getCurrentUserProfile = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(
      'id, first_name, last_name, skills_to_develop, enjoyable_work, stretch_projects, created_at, updated_at'
    )
    .eq('id', user.id)
    .maybeSingle<CurrentProfile>()

  if (profileError || !profile) {
    redirect('/profile/setup')
  }

  return {
    supabase,
    user: user as User,
    profile,
    userName: `${profile.first_name} ${profile.last_name}`,
  }
})
