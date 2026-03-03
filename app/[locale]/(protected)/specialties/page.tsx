"use client";

import { UserRole } from "@prisma/client";

import { RoleRestricted } from "@/components/auth/role-restricted";
import { SpecialtiesPage } from '@/components/specialties/specialties-page';
import { SpecialtiesProvider } from '@/contexts/specialties-context';

export default function Specialties() {
  return (
    <RoleRestricted allowedRoles={[UserRole.Therapist, UserRole.Admin]}>
      <SpecialtiesProvider>
        <SpecialtiesPage />
      </SpecialtiesProvider>
    </RoleRestricted>
  );
}
