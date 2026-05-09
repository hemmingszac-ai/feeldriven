import Link from 'next/link'
import { BarChart3, LogOut, Megaphone, UserRound, UsersRound } from 'lucide-react'
import { signout } from '@/app/auth/actions'
import { SidebarLogoTrigger } from '@/components/sidebar-logo-trigger'
import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator
} from '@/components/ui/sidebar'

type AppShellProps = {
  active: 'dashboard' | 'profile' | 'shout-outs' | 'team'
  children: React.ReactNode
  userEmail?: string | null
  userName: string
}

const navItems = [
  {
    id: 'dashboard',
    href: '/dashboard',
    label: 'Dashboard',
    icon: BarChart3,
  },
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
    id: 'team',
    href: '/team',
    label: 'Team',
    icon: UsersRound,
  },
] as const

export function AppShell({
  active,
  children,
  userEmail,
  userName,
}: AppShellProps) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarLogoTrigger />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon

                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        render={<Link href={item.href} />}
                        isActive={active === item.id}
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
        </SidebarContent>

        <SidebarSeparator />

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" tooltip={userName}>
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-xs font-semibold text-foreground ring-1 ring-primary/20">
                  {userName
                    .split(' ')
                    .map((part) => part[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div className="grid min-w-0 flex-1 text-left leading-tight">
                  <span className="truncate font-medium">{userName}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {userEmail}
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          <form>
            <Button
              formAction={signout}
              type="submit"
              variant="outline"
              className="w-full justify-start group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:px-0"
            >
              <LogOut className="size-4" />
              <span className="group-data-[collapsible=icon]:hidden">
                Sign out
              </span>
            </Button>
          </form>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <SidebarLogoTrigger mobileFloating />
        <div className="mx-auto w-full max-w-6xl px-4 py-6 pt-14 md:px-8 md:py-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
