'use client'

import { Megaphone } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PostShoutOutButton() {
  return (
    <Button
      type="submit"
      className="w-fit md:col-start-2 md:row-start-2 md:w-full"
    >
      <Megaphone className="size-4" />
      Post shout-out
    </Button>
  )
}
