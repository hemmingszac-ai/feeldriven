'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useFormStatus } from 'react-dom'
import { login, signup } from '../auth/login'

type AuthIntent = 'login' | 'signup'

function SubmitButton({
  action,
  activeAction,
  label,
  className,
}: {
  action: AuthIntent
  activeAction: AuthIntent | null
  label: string
  className: string
}) {
  const { pending } = useFormStatus()
  const isActive = pending && action === activeAction

  return (
    <button
      data-auth-intent={action}
      formAction={action === 'login' ? login : signup}
      type="submit"
      disabled={pending}
      aria-busy={isActive}
      aria-label={isActive ? label : undefined}
      className={className}
    >
      {isActive ? <Loader2 className="size-4 animate-spin" /> : label}
    </button>
  )
}

export function LoginForm() {
  const [activeAction, setActiveAction] = useState<AuthIntent | null>(null)

  return (
    <form
      className="grid gap-4"
      onSubmitCapture={(event) => {
        const submitter = (event.nativeEvent as SubmitEvent).submitter
        const intent = submitter?.getAttribute('data-auth-intent')

        setActiveAction(intent === 'signup' ? 'signup' : 'login')
      }}
    >
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
        <SubmitButton
          action="login"
          activeAction={activeAction}
          label="Log in"
          className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-[#ff6333] text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        />
        <SubmitButton
          action="signup"
          activeAction={activeAction}
          label="Sign up"
          className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
        />
      </div>
    </form>
  )
}
