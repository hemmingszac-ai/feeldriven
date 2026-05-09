'use server'

import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase/server'

function cleanList(values: FormDataEntryValue[]) {
  return Array.from(
    new Set(
      values
        .map((value) => value.toString().trim())
        .filter(Boolean)
    )
  )
}

function fail(message: string): never {
  redirect(`/profile/setup?error=${encodeURIComponent(message)}`)
}

export async function createProfile(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const firstName = formData.get('firstName')?.toString().trim() ?? ''
  const lastName = formData.get('lastName')?.toString().trim() ?? ''
  const role = formData.get('role')?.toString().trim() ?? ''
  const isManager = formData.get('isManager') === 'on'
  const skillsToDevelop = cleanList(formData.getAll('skillsToDevelop'))
  const enjoyableWork = cleanList(formData.getAll('enjoyableWork'))
  const stretchProjects =
    formData.get('stretchProjects')?.toString().trim() ?? ''

  if (!firstName || !lastName) {
    fail('Please enter your first and last name.')
  }

  if (!role) {
    fail('Please enter your role.')
  }

  if (skillsToDevelop.length === 0) {
    fail('Please add at least one skill you want to develop.')
  }

  if (enjoyableWork.length === 0) {
    fail('Please add at least one type of work you enjoy.')
  }

  if (!stretchProjects) {
    fail('Please describe the kind of projects that would stretch you.')
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert(
      {
        id: user.id,
        email: user.email,
        first_name: firstName,
        last_name: lastName,
        role,
        skills_to_develop: skillsToDevelop,
        enjoyable_work: enjoyableWork,
        stretch_projects: stretchProjects,
      },
      {
        onConflict: 'id',
      }
    )

  if (profileError) {
    fail(JSON.stringify(profileError))
  }

  const { error: userError } = await supabase.auth.updateUser({
    data: {
      isManager,
      role: null,
    },
  })

  if (userError) {
    fail(userError.message)
  }

  redirect('/shout-outs')
}
