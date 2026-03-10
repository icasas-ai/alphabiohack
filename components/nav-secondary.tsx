"use client"

import * as React from "react"
import { LucideIcon } from "lucide-react"
import { usePathname } from "@/i18n/navigation"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const pathname = usePathname()

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              {(() => {
                const isHashLink = item.url.startsWith("#")
                const isPublicView = item.url === "/"

                return (
              <SidebarMenuButton
                asChild
                isActive={
                  !isHashLink &&
                  !isPublicView &&
                  (pathname === item.url || pathname.startsWith(`${item.url}/`))
                }
                className="data-[active=true]:bg-sidebar-primary/12 data-[active=true]:text-sidebar-primary data-[active=true]:font-medium"
              >
                {isHashLink ? (
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                ) : isPublicView ? (
                  <a href={item.url} target="_blank" rel="noreferrer noopener">
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                ) : (
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                )}
              </SidebarMenuButton>
                )
              })()}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
