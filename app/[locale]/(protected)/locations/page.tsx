"use client";

import { RoleRestricted } from "@/components/auth/role-restricted";
import LocationsPage from "@/components/pages/LocationsPage";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocations } from "@/hooks";
import { UserRole } from "@prisma/client";

function LocationsContent() {
  const { loading, error } = useLocations();

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[250px] bg-muted" />
          <Skeleton className="h-4 w-[400px] bg-muted" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full bg-muted" />
          <Skeleton className="h-[400px] w-full bg-muted" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="text-center text-red-500">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="gap-4 p-4 pt-0 w-full">
      <div className="w-full flex flex-col gap-4">
        <LocationsPage />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <RoleRestricted allowedRoles={[UserRole.Therapist, UserRole.Admin]}>
      <LocationsContent />
    </RoleRestricted>
  );
}
