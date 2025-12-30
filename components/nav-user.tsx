"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useCallback, useMemo } from "react";

import { ChevronsUpDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client";
import { getNavUserConfig } from "@/lib/config/nav-user";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useUser } from "@/contexts/user-context";

// Componente presentacional para el skeleton
function NavUserSkeleton() {
  return (
    <SidebarMenuButton size="lg" className="pointer-events-none">
      <Skeleton className="h-8 w-8 rounded-lg bg-muted" />
      <div className="grid flex-1 text-left text-sm leading-tight">
        <Skeleton className="h-4 w-24 mb-1 bg-muted"/>
        <Skeleton className="h-3 w-32 bg-muted" />
      </div>
        <Skeleton className="ml-auto h-4 w-4 bg-muted" />
    </SidebarMenuButton>
  );
}

// Tipos para el componente presentacional
interface NavUserData {
  firstname: string;
  lastname: string;
  email: string;
  avatar?: string;
}

interface NavUserConfig {
  upgradeItem: {
    icon: React.ComponentType;
    label: string;
    url?: string;
  };
  accountItems: Array<{
    icon: React.ComponentType;
    label: string;
    url?: string;
  }>;
  logoutItem: {
    icon: React.ComponentType;
    label: string;
    action: () => void;
  };
}

interface NavUserPresentationalProps {
  user: NavUserData;
  config: NavUserConfig;
  isMobile: boolean;
}

// Componente presentacional optimizado con useMemo
function NavUserPresentational({ user, config, isMobile, onNavigate }: NavUserPresentationalProps & { onNavigate: (url: string) => void }) {
  const fullName = useMemo(() => `${user.firstname} ${user.lastname}`, [user.firstname, user.lastname]);
  const initials = useMemo(() => `${user.firstname?.charAt(0) ?? ""}${user.lastname?.charAt(0) ?? ""}`, [user.firstname, user.lastname]);
  const avatarAlt = useMemo(() => fullName, [fullName]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={user.avatar ?? ""} alt={avatarAlt} />
            <AvatarFallback className="rounded-lg">CN</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{fullName}</span>
            <span className="truncate text-xs">{user.email}</span>
          </div>
          <ChevronsUpDown className="ml-auto size-4" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        side={isMobile ? "bottom" : "right"}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={user.avatar ?? ""} alt={avatarAlt} />
              <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{fullName}</span>
              <span className="truncate text-xs">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => config.upgradeItem.url && onNavigate(config.upgradeItem.url)}>
            <config.upgradeItem.icon />
            {config.upgradeItem.label}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {config.accountItems.map((item, index) => (
            <DropdownMenuItem 
              key={index}
              onClick={() => item.url && onNavigate(item.url)}
            >
              <item.icon />
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={config.logoutItem.action}>
          <config.logoutItem.icon />
          {config.logoutItem.label}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Componente contenedor que maneja la lógica de negocio
export function NavUser() {
  const { isMobile } = useSidebar()
  const { prismaUser, isAuthenticated, loading } = useUser();
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations("NavUser");

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }, [supabase.auth, router]);

  const handleNavigate = useCallback((url: string) => {
    router.push(url);
  }, [router]);

  // Memoizar la configuración para evitar recreaciones innecesarias
  const navConfig = useMemo(() => getNavUserConfig(t, logout), [t, logout]);

  // Memoizar los datos del usuario para evitar re-renders innecesarios
  const userData = useMemo(() => {
    if (!prismaUser) return null;
    return {
      firstname: prismaUser.firstname || "",
      lastname: prismaUser.lastname || "",
      email: prismaUser.email || "",
      avatar: prismaUser.avatar || undefined,
    };
  }, [prismaUser]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {loading || !isAuthenticated || !userData ? (
          <NavUserSkeleton />
        ) : (
          <NavUserPresentational 
            user={userData} 
            config={{
              ...navConfig,
              logoutItem: {
                ...navConfig.logoutItem,
                action: navConfig.logoutItem.action ?? (() => {})
              }
            }} 
            isMobile={isMobile}
            onNavigate={handleNavigate}
          />
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
