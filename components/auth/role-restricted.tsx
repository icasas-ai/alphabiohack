"use client";

import { UserRole } from "@prisma/client";
import { useEffect } from "react";

import { useRouter } from "@/i18n/navigation";
import { useUser } from "@/contexts/user-context";

interface RoleRestrictedProps {
  allowedRoles: UserRole[];
  redirectTo?: "/appointments" | "/dashboard" | "/profile" | "/auth/login";
  children: React.ReactNode;
}

export function RoleRestricted({
  allowedRoles,
  redirectTo = "/appointments",
  children,
}: RoleRestrictedProps) {
  const router = useRouter();
  const { loading, prismaUser } = useUser();

  const isAllowed =
    prismaUser?.role?.some((role) => allowedRoles.includes(role)) ?? false;

  useEffect(() => {
    if (!loading && prismaUser && !isAllowed) {
      router.push(redirectTo);
    }
  }, [isAllowed, loading, prismaUser, redirectTo, router]);

  if (loading || !prismaUser) {
    return null;
  }

  if (!isAllowed) {
    return null;
  }

  return <>{children}</>;
}
