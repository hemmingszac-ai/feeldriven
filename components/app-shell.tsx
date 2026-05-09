import { LogOut } from 'lucide-react'
import { signout } from '@/app/auth/actions'
import { getNameInitials } from '@/app/lib/profiles'
import { AppNav } from '@/components/app-nav'
import { SidebarLogoTrigger } from '@/components/sidebar-logo-trigger'
import { Button } from '@/components/ui/button'
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
  userRole?: string | null
}

export function AppShell({
  children,
  userEmail,
  userName,
  userRole,
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
            <AppNav userRole={userRole} />
          </SidebarContent>

          <SidebarSeparator />

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" tooltip={userName}>
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-xs font-semibold text-foreground ring-1 ring-primary/20">
                    {getNameInitials(userName)}
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
          <div className="mx-auto w-full max-w-6xl px-4 pt-14 pb-4 md:px-8 md:pt-8 md:pb-5">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
