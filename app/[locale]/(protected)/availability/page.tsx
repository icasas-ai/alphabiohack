"use client";

import { AvailabilityPage } from "@/components/availability";
import { RoleRestricted } from "@/components/auth/role-restricted";
import { UserRole } from "@/lib/prisma-browser";
import { useTranslations } from "next-intl";

export default function Page() {
  const t = useTranslations("Availability");

  return (
    <RoleRestricted allowedRoles={[UserRole.Therapist, UserRole.Admin]}>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("manageAvailability")}</p>
        </div>
        <div className="w-full flex flex-col gap-4">
          <AvailabilityPage />
        </div>
      </div>
    </RoleRestricted>
  );
}
