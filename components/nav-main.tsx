"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { usePathname } from "@/i18n/navigation"
import { useTranslations } from "next-intl"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const t = useTranslations("Sidebar");
  const pathname = usePathname();

  const routeMatchedItem = useMemo(() => {
    return (
      items.find((item) =>
        pathname === item.url ||
        (item.url !== "#" && pathname.startsWith(`${item.url}/`)) ||
        item.items?.some(
          (subItem) =>
            pathname === subItem.url ||
            pathname.startsWith(`${subItem.url}/`)
        )
      )?.title ?? null
    );
  }, [items, pathname]);

  const [openItem, setOpenItem] = useState<string | null>(routeMatchedItem);

  useEffect(() => {
    setOpenItem(routeMatchedItem);
  }, [routeMatchedItem]);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t("platform")}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const primaryUrl =
            item.url !== "#" ? item.url : item.items?.[0]?.url || "/"
          const itemIsActive =
            pathname === primaryUrl ||
            pathname === item.url ||
            pathname.startsWith(`${primaryUrl}/`) ||
            item.items?.some(
              (subItem) =>
                pathname === subItem.url ||
                pathname.startsWith(`${subItem.url}/`)
            ) ||
            false

          return (
            <Collapsible
              key={item.title}
              asChild
              open={openItem === item.title}
              onOpenChange={(open) => setOpenItem(open ? item.title : null)}
            >
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={itemIsActive}
                  className="data-[active=true]:bg-sidebar-primary/12 data-[active=true]:text-sidebar-primary data-[active=true]:font-medium"
                >
                  <a href={primaryUrl} onClick={() => setOpenItem(item.title)}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="data-[state=open]:rotate-90">
                        <ChevronRight />
                        <span className="sr-only">{t("toggle")}</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => {
                          const subItemIsActive =
                            pathname === subItem.url ||
                            pathname.startsWith(`${subItem.url}/`)

                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={subItemIsActive}
                                className="data-[active=true]:bg-sidebar-primary/10 data-[active=true]:text-sidebar-primary data-[active=true]:font-medium"
                              >
                                <a href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
