import { CompanyMembershipRole, UserRole } from "@/lib/prisma-client";

import {
  findCompanyBySlug,
  findCompanyContextForUser,
  findPrimaryCompanyMembershipForUser,
  findUserByIdWithInclude,
} from "@/repositories";

export type PublicSiteUnavailableCode =
  | "missing_company_slug"
  | "company_not_found"
  | "missing_public_therapist"
  | "invalid_public_therapist";

export class PublicSiteUnavailableError extends Error {
  readonly code: PublicSiteUnavailableCode;

  constructor(code: PublicSiteUnavailableCode, message: string) {
    super(message);
    this.name = "PublicSiteUnavailableError";
    this.code = code;
  }
}

export function isPublicSiteUnavailableError(
  error: unknown,
): error is PublicSiteUnavailableError {
  return (
    error instanceof PublicSiteUnavailableError ||
    (error instanceof Error && error.name === "PublicSiteUnavailableError")
  );
}

function getConfiguredCompanySlug() {
  const slug = process.env.DEFAULT_COMPANY_SLUG?.trim();

  if (!slug) {
    throw new PublicSiteUnavailableError(
      "missing_company_slug",
      "DEFAULT_COMPANY_SLUG is required to resolve the public company.",
    );
  }

  return slug;
}

export async function getPublicCompany() {
  const slug = getConfiguredCompanySlug();
  const company = await findCompanyBySlug(slug);

  if (!company) {
    throw new PublicSiteUnavailableError(
      "company_not_found",
      `Configured public company "${slug}" was not found in the database.`,
    );
  }

  return company;
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
  if (!preferredTherapistId) {
    return null;
  }

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

  return null;
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
