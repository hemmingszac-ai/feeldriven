import Link from 'next/link'
import { AnimatedSphere } from '@/components/landing/animated-sphere'
import { LoginForm } from './login-form'

type LoginPageProps = {
  searchParams?: {
    error?: string
    message?: string
  }
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <main className="brand-page relative flex min-h-screen items-center justify-center px-4 py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-130 w-130 -translate-x-1/2 -translate-y-1/2 opacity-20 sm:h-160 sm:w-160">
          <AnimatedSphere />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Link href="/">
            <img
              src="/logo.svg"
              alt="teamhuddl"
              style={{ height: '44px', width: 'auto' }}
            />
          </Link>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-2xl">
          <h1 className="mb-6 text-center text-xl font-semibold text-gray-900">Welcome back</h1>

          {searchParams?.error ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {searchParams.error}
            </div>
          ) : null}

          {searchParams?.message ? (
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              {searchParams.message}
            </div>
          ) : null}

          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-white/50">
          © 2026 teamhuddl
        </p>
      </div>
    </main>
  )
}
