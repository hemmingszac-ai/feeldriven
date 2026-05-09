'use client'

import type { ReactNode } from 'react'
import { SHOUT_OUT_CONFETTI_EVENT } from './shout-out-confetti'

type ShoutOutFormProps = {
  action: (formData: FormData) => void | Promise<void>
  children: ReactNode
}

export function ShoutOutForm({ action, children }: ShoutOutFormProps) {
  return (
    <form
      action={action}
      className="grid gap-3"
      onSubmit={(event) => {
        const form = event.currentTarget

        if (!form.checkValidity()) {
          return
        }

        window.dispatchEvent(new Event(SHOUT_OUT_CONFETTI_EVENT))
        window.setTimeout(() => form.reset(), 0)
      }}
    >
      {children}
    </form>
  )
}
