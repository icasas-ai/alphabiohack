import { User, UserRole } from "@prisma/client";

type RoleUser = Pick<User, "id" | "role">;

export function hasRole(user: RoleUser | null | undefined, role: UserRole) {
  return Boolean(user?.role.includes(role));
}

export function canAccessAvailability(user: RoleUser | null | undefined) {
  return hasRole(user, UserRole.Admin) || hasRole(user, UserRole.Therapist);
}

export function canManageTherapistData(
  user: RoleUser | null | undefined,
  therapistId: string,
) {
  if (!user) return false;
  return hasRole(user, UserRole.Admin) || user.id === therapistId;
}
