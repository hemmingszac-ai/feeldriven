import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const redirectUrl = new URL('/profile/setup', request.url)
  let response = NextResponse.redirect(redirectUrl)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const code = requestUrl.searchParams.get('code')
  const tokenHash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('error', error.message)
      response = NextResponse.redirect(redirectUrl)
    }

    return response
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as any,
    })

    if (error) {
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('error', error.message)
      response = NextResponse.redirect(redirectUrl)
    }

    return response
  }

  redirectUrl.pathname = '/login'
  redirectUrl.searchParams.set('error', 'Invalid auth callback.')

  return NextResponse.redirect(redirectUrl)
}
