import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

import { AppSidebar } from "@/components/app-sidebar"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { getCurrentUser } from "@/lib/auth/session"
import { LanguageSelector } from "@/components/common/language-selector"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/common/theme-toggle"
import { redirect } from "next/navigation"

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { prismaUser } = await getCurrentUser();

  if (prismaUser?.mustChangePassword) {
    redirect("/auth/update-password");
  }

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="min-h-[calc(100vh-16px)] overflow-y-auto ">
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 rounded-t-lg bg-background">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb />
            </div>
            <div className="flex items-center gap-2 px-4">
              <ThemeToggle />
              <LanguageSelector />
            </div>
          </header>
          <section className="flex flex-1 flex-col gap-4 p-4 lg:p-8 bg-background">
            { children }
          </section>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
