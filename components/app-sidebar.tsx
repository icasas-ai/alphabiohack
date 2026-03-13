"use client"

import * as React from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import Image from "next/image"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { SITE_DATA } from "@/constants"
import { getSidebarConfig, type SidebarRoleMode } from "@/lib/config/sidebar";
import { useUser } from "@/contexts/user-context";
import { UserRole } from "@/lib/prisma-browser";
import { useTranslations } from "next-intl"

function useSidebarRoleMode(): SidebarRoleMode {
  const { prismaUser } = useUser();
  const roles = prismaUser?.role ?? [];

  if (roles.includes(UserRole.Admin)) {
    return "admin";
  }

  if (roles.includes(UserRole.Therapist)) {
    return "therapist";
  }

  if (roles.includes(UserRole.FrontDesk)) {
    return "frontDesk";
  }

  return "patient";
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations("Sidebar");
  const roleMode = useSidebarRoleMode();

  // Función para generar la data del sidebar basada en el rol del usuario
  const data = getSidebarConfig(t, roleMode);

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-secondary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image src={SITE_DATA.logo} alt={SITE_DATA.name} width={32} height={32} />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{SITE_DATA.name}</span>
                  <span className="truncate text-xs">{SITE_DATA.description}</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
