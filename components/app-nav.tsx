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
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

type NavItem = {
  id: string
  href: string
  label: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  managerOnly?: boolean
}
const navItems: NavItem[] = [
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
    label: 'Organization',
    icon: UsersRound,
  },
  {
    id: 'team-builder',
    href: '/team-builder',
    label: 'Team Builder',
    icon: BriefcaseBusiness,
    managerOnly: true,
  },
] as const

type AppNavProps = {
  userRole?: string | null
}

export function AppNav({ userRole }: AppNavProps) {
  const pathname = usePathname()
  const isManager = userRole === 'Team Manager'

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu className="gap-1.5">
          {navItems
            .filter((item) => !item.managerOnly || isManager)
            .map((item) => {
              const Icon = item.icon
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`)

              return (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={isActive}
                    tooltip={item.label}
                  >
                    <Icon className="size-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
