"use client";

import { UserRole } from "@/lib/prisma-browser";
import { useEffect } from "react";

import { useRouter } from "@/i18n/navigation";
import { useUser } from "@/contexts/user-context";

interface RoleRestrictedProps {
  allowedRoles: UserRole[];
  redirectTo?: "/bookings" | "/dashboard" | "/profile" | "/company" | "/account" | "/auth/login";
  children: React.ReactNode;
}

export function RoleRestricted({
  allowedRoles,
  redirectTo = "/bookings",
  children,
}: RoleRestrictedProps) {
  const router = useRouter();
  const { loading, prismaUser } = useUser();

  const isAllowed =
    prismaUser?.role?.some((role) => allowedRoles.includes(role)) ?? false;

  useEffect(() => {
    if (!loading && prismaUser && !isAllowed) {
      // @ts-expect-error - authenticated route targets are validated by app routes
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
