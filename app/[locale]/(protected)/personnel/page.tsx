"use client";

import { UserRole } from "@prisma/client";

import { PersonnelPage } from "@/components/personnel/personnel-page";
import { RoleRestricted } from "@/components/auth/role-restricted";

export default function Page() {
  return (
    <RoleRestricted allowedRoles={[UserRole.Therapist, UserRole.Admin]}>
      <PersonnelPage />
    </RoleRestricted>
  );
}
