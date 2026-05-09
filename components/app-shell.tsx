import { LogOut } from 'lucide-react'
import { signout } from '@/app/auth/actions'
import { getNameInitials } from '@/app/lib/profiles'
import { AppNav } from '@/components/app-nav'
import { SidebarLogoTrigger } from '@/components/sidebar-logo-trigger'
import {
  DropdownMenu,
  DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
  children: React.ReactNode
  userEmail?: string | null
  userName: string
  isManager: boolean
}

export function AppShell({
  children,
  userEmail,
  userName,
  isManager,
}: AppShellProps) {
  return (
    <TooltipProvider>
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
            <AppNav isManager={isManager} />
          </SidebarContent>

          <SidebarSeparator />

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<SidebarMenuButton size="lg" tooltip={userName} />}
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-semibold text-primary ring-1 ring-white/40">
                      {getNameInitials(userName)}
                    </div>
                    <div className="grid min-w-0 flex-1 text-left leading-tight">
                      <span className="truncate font-medium">{userName}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {userEmail}
                      </span>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    side="top"
                    className="min-w-56"
                  >
                    <form action={signout}>
                      <DropdownMenuItem
                        nativeButton
                        variant="destructive"
                        render={<button type="submit" className="w-full" />}
                      >
                        <LogOut className="size-4" />
                        <span>Sign out</span>
                      </DropdownMenuItem>
                    </form>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <SidebarInset>
          <SidebarLogoTrigger mobileFloating />
          <div className="mx-auto w-full max-w-6xl px-4 pt-14 pb-4 md:px-8 md:pt-8 md:pb-5">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
