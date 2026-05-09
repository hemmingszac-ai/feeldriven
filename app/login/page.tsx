import { login, signup } from '../auth/login'
import Link from 'next/link'
import { AnimatedSphere } from '@/components/landing/animated-sphere'

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

          <form className="grid gap-4">
            <div className="grid gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@company.com"
                className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-[#ff6333] focus:ring-2 focus:ring-[#ff6333]/20"
              />
            </div>

            <div className="grid gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                minLength={6}
                required
                placeholder="••••••••"
                className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-[#ff6333] focus:ring-2 focus:ring-[#ff6333]/20"
              />
            </div>

            <div className="mt-2 flex gap-3">
              <button
                formAction={login}
                type="submit"
                className="h-10 flex-1 rounded-lg bg-[#ff6333] text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Log in
              </button>
              <button
                formAction={signup}
                type="submit"
                className="h-10 flex-1 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Sign up
              </button>
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-white/50">
          © 2026 teamhuddl
        </p>
      </div>
    </main>
  )
}
