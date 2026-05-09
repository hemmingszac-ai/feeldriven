import { createClient } from '@/app/lib/supabase/server'
import { OpenRouterError } from './openrouter'

export async function loadAiDatabaseContext() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new OpenRouterError('Authentication required.', 401)
  }

  const [profilesResult, shoutOutsResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, email, first_name, last_name, role, skills_to_develop, enjoyable_work, stretch_projects')
      .order('first_name', { ascending: true })
      .order('last_name', { ascending: true }),
    supabase
      .from('shout_outs')
      .select(`
        id,
        sender_id,
        recipient_id,
        message,
        created_at,
        sender:profiles!shout_outs_sender_id_fkey(id, first_name, last_name),
        recipient:profiles!shout_outs_recipient_id_fkey(id, first_name, last_name)
      `)
      .order('created_at', { ascending: false })
      .limit(2),
  ])

  if (profilesResult.error) {
    throw new OpenRouterError('Could not load profiles.', 500, profilesResult.error.message)
  }

  if (shoutOutsResult.error) {
    throw new OpenRouterError('Could not load shout-outs.', 500, shoutOutsResult.error.message)
  }

  return {
    currentUserId: user.id,
    profiles: profilesResult.data ?? [],
    shoutOuts: shoutOutsResult.data ?? [],
  }
}
