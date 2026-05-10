"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BriefcaseBusiness,
  Megaphone,
  UserRound,
  UsersRound,
} from 'lucide-react'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

type NavItem = {
  id: string
  href: string
  label: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const managerItems: NavItem[] = [
  {
    id: 'team-builder',
    href: '/team-builder',
    label: 'Team Builder',
    icon: BriefcaseBusiness,
  },
]

const teamItems: NavItem[] = [
  {
    id: 'profile',
    href: '/profile',
    label: 'Profile',
    icon: UserRound,
  },
  {
    id: 'shout-outs',
    href: '/shout-outs',
    label: 'Shout-outs',
    icon: Megaphone,
  },
  {
    id: 'organization',
    href: '/organization',
    label: 'Organisation',
    icon: UsersRound,
  },
] as const

type AppNavProps = {
  isManager: boolean
}

export function AppNav({ isManager }: AppNavProps) {
  const pathname = usePathname()
  const renderItems = (items: readonly NavItem[]) =>
    items.map((item) => {
      const Icon = item.icon
      const isActive =
        pathname === item.href || pathname.startsWith(`${item.href}/`)

      return (
        <SidebarMenuItem key={item.id}>
          <SidebarMenuButton
            render={<Link href={item.href} />}
            isActive={isActive}
            tooltip={item.label}
            size="lg"
            className="h-14 text-base font-semibold text-sidebar-foreground data-active:bg-white/18 data-active:text-white data-active:shadow-none hover:bg-white/10 hover:text-white group-data-[collapsible=icon]:justify-center [&_svg]:size-5 [&_svg]:text-sidebar-foreground data-active:[&_svg]:text-white"
          >
            <Icon className="size-4" />
            <span className="group-data-[collapsible=icon]:hidden">
              {item.label}
            </span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )
    })

  return (
    <>
      {isManager ? (
        <SidebarGroup>
          <SidebarGroupLabel className="mb-2 h-auto rounded-none border-b border-white/30 px-0 pb-2 text-xs font-semibold tracking-[0.02em] text-white/90">
            Manager tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {renderItems(managerItems)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ) : null}

      <SidebarGroup>
        <SidebarGroupLabel className="mb-2 h-auto rounded-none border-b border-white/30 px-0 pb-2 text-xs font-semibold tracking-[0.02em] text-white/90">
          Team tools
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="gap-1.5">
            {renderItems(teamItems)}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  )
}
