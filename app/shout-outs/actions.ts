'use server'

import { redirect } from 'next/navigation'
import { createClient } from '../lib/supabase/server'
import { validateShoutOutInput } from './validation'

function fail(message: string): never {
  redirect(`/shout-outs?error=${encodeURIComponent(message)}`)
}

export async function createShoutOut(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: recipients, error: recipientsError } = await supabase
    .from('profiles')
    .select('id')

  if (recipientsError || !recipients) {
    fail('Could not load team members.')
  }

  const validation = validateShoutOutInput(
    {
      senderId: user.id,
      recipientId: formData.get('recipientId')?.toString() ?? '',
      message: formData.get('message')?.toString() ?? '',
    },
    new Set(recipients.map((recipient) => recipient.id))
  )

  if (!validation.ok) {
    fail(validation.error)
  }

  const { error: insertError } = await supabase.from('shout_outs').insert({
    sender_id: user.id,
    recipient_id: validation.value.recipientId,
    message: validation.value.message,
  })

  if (insertError) {
    fail(insertError.message)
  }

  redirect('/shout-outs')
}
