"use client"

import Image from 'next/image'
import { SidebarMenuButton, useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

type SidebarLogoTriggerProps = {
  className?: string
  mobileFloating?: boolean
}

export function SidebarLogoTrigger({
  className,
  mobileFloating = false,
}: SidebarLogoTriggerProps) {
  const { openMobile, toggleSidebar } = useSidebar()

  if (mobileFloating && openMobile) {
    return null
  }

  return (
    <SidebarMenuButton
      size="lg"
      tooltip="Toggle sidebar"
      onClick={toggleSidebar}
      className={cn(
        mobileFloating && 'fixed left-3 top-3 z-20 w-auto bg-background/90 shadow-sm md:hidden',
        className
      )}
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md">
        <Image
          src="/logos/iconlogo.svg"
          alt=""
          width={32}
          height={28}
          className="h-7 w-8 object-contain"
          priority
        />
      </div>
      {!mobileFloating ? (
        <div className="flex min-w-0 flex-1 items-center group-data-[collapsible=icon]:hidden">
          <Image
            src="/logos/longlogo.svg"
            alt="feeldriven.com"
            width={166}
            height={28}
            className="h-7 w-auto object-contain"
            priority
          />
        </div>
      ) : null}
    </SidebarMenuButton>
  )
}
