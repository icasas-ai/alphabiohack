import { CompanyMembershipRole, UserRole } from "@/lib/prisma-client";

import {
  findCompanyById,
  findCompanyBySlug,
  findCompanyContextForUser,
  findFirstCompany,
  findFirstTherapistMembershipForCompany,
  findPrimaryCompanyMembershipForUser,
  findUserByIdWithInclude,
} from "@/repositories";

function getConfiguredCompanyIdentifier() {
  return (
    process.env.NEXT_PUBLIC_DEFAULT_COMPANY_SLUG ||
    process.env.DEFAULT_COMPANY_SLUG ||
    process.env.NEXT_PUBLIC_DEFAULT_COMPANY_ID ||
    process.env.DEFAULT_COMPANY_ID ||
    null
  );
}

export async function getPublicCompany() {
  const configured = getConfiguredCompanyIdentifier()?.trim();

  if (configured) {
    const configuredCompany =
      (await findCompanyBySlug(configured)) ||
      (await findCompanyById(configured));

    if (configuredCompany) {
      return configuredCompany;
    }
  }

  return findFirstCompany();
}

export async function getPrimaryCompanyIdForUser(userId: string) {
  const membership = await findPrimaryCompanyMembershipForUser(userId);
  return membership?.companyId ?? null;
}

export async function getPrimaryCompanyForUser(userId: string) {
  const membership = await findPrimaryCompanyMembershipForUser(userId);
  return membership?.company ?? null;
}

export async function resolveScopedCompanyId(userId?: string | null) {
  if (userId) {
    const companyId = await getPrimaryCompanyIdForUser(userId);
    if (companyId) {
      return companyId;
    }
  }

  const publicCompany = await getPublicCompany();
  return publicCompany?.id ?? null;
}

export async function getCompanyContextForUser(userId: string) {
  return findCompanyContextForUser(userId);
}

export async function getPublicTherapistForCompany(companyId: string, preferredTherapistId?: string | null) {
  if (preferredTherapistId) {
    const configuredTherapist = await findUserByIdWithInclude(preferredTherapistId, {
      companyMemberships: {
        select: {
          companyId: true,
        },
      },
    });

    if (
      configuredTherapist?.role.includes(UserRole.Therapist) &&
      configuredTherapist?.companyMemberships?.some?.((membership) => membership.companyId === companyId)
    ) {
      return configuredTherapist;
    }
  }

  const therapistMembership = await findFirstTherapistMembershipForCompany(companyId);

  return therapistMembership?.user ?? null;
}

type ManagedTherapistUser = {
  id: string;
  role: UserRole[];
  managedByTherapistId?: string | null;
};

export async function resolveManagedTherapistIdForUser(
  user: ManagedTherapistUser | null | undefined,
) {
  if (!user) return null;

  if (user.role.includes(UserRole.Therapist)) {
    return user.id;
  }

  if (user.role.includes(UserRole.FrontDesk)) {
    return user.managedByTherapistId ?? null;
  }

  if (user.role.includes(UserRole.Admin)) {
    const company = await getPrimaryCompanyForUser(user.id);
    if (!company) {
      return null;
    }

    const therapist = await getPublicTherapistForCompany(
      company.id,
      company.publicTherapistId,
    );

    return therapist?.id ?? null;
  }

  return null;
}
