import { canManagePersonnel } from "@/lib/auth/authorization";
import { getCurrentUser } from "@/lib/auth/session";
import { CompanyMembershipRole, UserRole } from "@/lib/prisma-client";
import { prisma } from "@/lib/prisma";
import { getCompanyContextForUser, resolveManagedTherapistIdForUser } from "@/services";

type CurrentUserResult = Awaited<ReturnType<typeof getCurrentUser>>;
type CurrentPrismaUser = NonNullable<CurrentUserResult["prismaUser"]>;

export type StaffRoleValue = typeof UserRole.Therapist | typeof UserRole.FrontDesk;

type PersonnelManagementErrorContext = {
  prismaUser: CurrentPrismaUser | null;
  companyId: null;
  managedTherapistId: null;
  canManageCompanyTeam: false;
  canManageTherapists: false;
  visibleMembershipRoles: CompanyMembershipRole[];
  error: string;
  status: 401 | 403 | 409;
};

type PersonnelManagementReadyContext = {
  prismaUser: CurrentPrismaUser;
  companyId: string;
  managedTherapistId: string | null;
  canManageCompanyTeam: boolean;
  canManageTherapists: boolean;
  visibleMembershipRoles: CompanyMembershipRole[];
  error: null;
  status: 200;
};

export type PersonnelManagementContext =
  | PersonnelManagementErrorContext
  | PersonnelManagementReadyContext;

const FRONT_DESK_MEMBERSHIP_ROLES = [CompanyMembershipRole.FrontDesk];
const TEAM_MEMBERSHIP_ROLES = [CompanyMembershipRole.Therapist, CompanyMembershipRole.FrontDesk];
const ASSIGNABLE_THERAPIST_MEMBERSHIP_ROLES = [
  CompanyMembershipRole.Owner,
  CompanyMembershipRole.Therapist,
];

export function isStaffRole(value: unknown): value is StaffRoleValue {
  return value === UserRole.Therapist || value === UserRole.FrontDesk;
}

export function getStaffRoleFromMembershipRole(
  membershipRole: CompanyMembershipRole | null | undefined,
): StaffRoleValue {
  return membershipRole === CompanyMembershipRole.Therapist
    ? UserRole.Therapist
    : UserRole.FrontDesk;
}

export function getMemberRoleKey(role: StaffRoleValue): "therapist" | "frontDesk" {
  return role === UserRole.Therapist ? "therapist" : "frontDesk";
}

export function getManagerDisplayName(
  user: Pick<CurrentPrismaUser, "firstname" | "lastname" | "email">,
) {
  const fullname = `${user.firstname} ${user.lastname}`.trim();
  return fullname || user.email;
}

export async function getPersonnelManagementContext(): Promise<PersonnelManagementContext> {
  const { prismaUser } = await getCurrentUser();
  if (!prismaUser) {
    return {
      prismaUser: null,
      companyId: null,
      managedTherapistId: null,
      canManageCompanyTeam: false,
      canManageTherapists: false,
      visibleMembershipRoles: [...FRONT_DESK_MEMBERSHIP_ROLES],
      error: "Unauthorized",
      status: 401,
    };
  }

  if (!canManagePersonnel(prismaUser)) {
    return {
      prismaUser,
      companyId: null,
      managedTherapistId: null,
      canManageCompanyTeam: false,
      canManageTherapists: false,
      visibleMembershipRoles: [...FRONT_DESK_MEMBERSHIP_ROLES],
      error: "Forbidden",
      status: 403,
    };
  }

  const companyContext = await getCompanyContextForUser(prismaUser.id);
  if (!companyContext?.companyId) {
    return {
      prismaUser,
      companyId: null,
      managedTherapistId: null,
      canManageCompanyTeam: false,
      canManageTherapists: false,
      visibleMembershipRoles: [...FRONT_DESK_MEMBERSHIP_ROLES],
      error: "No company is configured for this account.",
      status: 409,
    };
  }

  const canManageCompanyTeam = prismaUser.role.includes(UserRole.Admin);
  const canManageTherapists =
    canManageCompanyTeam && companyContext.role === CompanyMembershipRole.Owner;
  const managedTherapistId = await resolveManagedTherapistIdForUser(prismaUser);

  if (!canManageCompanyTeam && !managedTherapistId) {
    return {
      prismaUser,
      companyId: null,
      managedTherapistId: null,
      canManageCompanyTeam: false,
      canManageTherapists: false,
      visibleMembershipRoles: [...FRONT_DESK_MEMBERSHIP_ROLES],
      error: "No therapist is configured for this account.",
      status: 409,
    };
  }

  return {
    prismaUser,
    companyId: companyContext.companyId,
    managedTherapistId,
    canManageCompanyTeam,
    canManageTherapists,
    visibleMembershipRoles: canManageTherapists
      ? [...TEAM_MEMBERSHIP_ROLES]
      : [...FRONT_DESK_MEMBERSHIP_ROLES],
    error: null,
    status: 200,
  };
}

export async function listAssignableTherapistsForContext(
  context: PersonnelManagementReadyContext,
) {
  if (context.canManageCompanyTeam) {
    return prisma.user.findMany({
      where: {
        role: { has: UserRole.Therapist },
        companyMemberships: {
          some: {
            companyId: context.companyId,
            role: {
              in: ASSIGNABLE_THERAPIST_MEMBERSHIP_ROLES,
            },
          },
        },
      },
      orderBy: [{ firstname: "asc" }, { lastname: "asc" }],
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
      },
    });
  }

  if (!context.managedTherapistId) {
    return [];
  }

  return prisma.user.findMany({
    where: {
      id: context.managedTherapistId,
      role: { has: UserRole.Therapist },
    },
    select: {
      id: true,
      firstname: true,
      lastname: true,
      email: true,
    },
  });
}

export function buildPersonnelWhere(
  context: PersonnelManagementReadyContext,
  personnelId?: string,
) {
  const baseWhere = context.canManageCompanyTeam
    ? {
        companyMemberships: {
          some: {
            companyId: context.companyId,
            role: {
              in: context.visibleMembershipRoles,
            },
          },
        },
      }
    : {
        managedByTherapistId: context.managedTherapistId,
        companyMemberships: {
          some: {
            companyId: context.companyId,
            role: CompanyMembershipRole.FrontDesk,
          },
        },
      };

  return {
    ...(personnelId ? { id: personnelId } : {}),
    ...baseWhere,
  };
}
