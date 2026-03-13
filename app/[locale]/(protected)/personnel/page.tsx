"use client";

import { UserRole } from "@/lib/prisma-browser";

import { PersonnelPage } from "@/components/personnel/personnel-page";
import { RoleRestricted } from "@/components/auth/role-restricted";

export default function Page() {
  return (
    <RoleRestricted allowedRoles={[UserRole.Admin]}>
      <PersonnelPage />
    </RoleRestricted>
  );
}
