import { User, UserRole } from "@prisma/client";

type RoleUser = Pick<User, "id" | "role" | "managedByTherapistId">;

export function hasRole(user: RoleUser | null | undefined, role: UserRole) {
  return Boolean(user?.role.includes(role));
}

export function canAccessAvailability(user: RoleUser | null | undefined) {
  return hasRole(user, UserRole.Admin) || hasRole(user, UserRole.Therapist);
}

export function canOperateAppointments(user: RoleUser | null | undefined) {
  return (
    hasRole(user, UserRole.Admin) ||
    hasRole(user, UserRole.Therapist) ||
    hasRole(user, UserRole.FrontDesk)
  );
}

export function canManagePersonnel(user: RoleUser | null | undefined) {
  return hasRole(user, UserRole.Admin) || hasRole(user, UserRole.Therapist);
}

export function getManagedTherapistId(user: RoleUser | null | undefined) {
  if (!user) return null;
  if (hasRole(user, UserRole.Therapist)) return user.id;
  if (hasRole(user, UserRole.FrontDesk)) {
    return user.managedByTherapistId ?? null;
  }
  return null;
}

export function canManageTherapistData(
  user: RoleUser | null | undefined,
  therapistId: string,
) {
  if (!user) return false;
  return hasRole(user, UserRole.Admin) || user.id === therapistId;
}

export function canManageBookingAsOperator(
  user: RoleUser | null | undefined,
  therapistId: string | null | undefined,
) {
  if (!user || !therapistId) return false;
  if (hasRole(user, UserRole.Admin)) return true;
  if (hasRole(user, UserRole.Therapist)) return user.id === therapistId;
  if (hasRole(user, UserRole.FrontDesk)) {
    return getManagedTherapistId(user) === therapistId;
  }
  return false;
}
