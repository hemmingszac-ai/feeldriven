// app/login/actions.ts
'use server'
import { redirect } from 'next/navigation'
import { createClient } from '../lib/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    })
    if (error) redirect('/login?error=Invalid%20credentials')
    redirect('/shout-outs')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signUp({
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    })
    if (error) redirect('/login?error=' + encodeURIComponent(error.message))
    if (data.session) redirect('/profile/setup')
    redirect('/login?message=Check%20your%20email')
}
