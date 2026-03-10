import { UserRole } from "@/lib/prisma-client";

import {
  findCompanyWithSelect,
  findLocationsWithSelect,
  findUserByIdWithSelect,
} from "@/repositories";
import {
  PublicSiteUnavailableError,
  getPublicCompany,
  getPublicTherapistForCompany,
} from "@/services/company.service";

export const publicProfileSelect = {
  id: true,
  email: true,
  role: true,
  firstname: true,
  lastname: true,
  avatar: true,
  telefono: true,
  informacionPublica: true,
  especialidad: true,
  summary: true,
  facebook: true,
  instagram: true,
  linkedin: true,
  twitter: true,
  tiktok: true,
  youtube: true,
  website: true,
} as const;

export const publicCompanySelect = {
  id: true,
  slug: true,
  name: true,
  logo: true,
  headerLogo: true,
  publicEmail: true,
  publicPhone: true,
  publicDescription: true,
  publicSummary: true,
  publicSpecialty: true,
  landingPageConfig: true,
  defaultTimezone: true,
  weekdaysHours: true,
  saturdayHours: true,
  sundayHours: true,
  facebook: true,
  instagram: true,
  linkedin: true,
  twitter: true,
  tiktok: true,
  youtube: true,
  website: true,
  publicTherapistId: true,
} as const;

export async function getPublicCompanyProfile() {
  const company = await getPublicCompany();
  return findCompanyWithSelect(company.id, publicCompanySelect);
}

export async function getPublicCompanyLocations() {
  const company = await getPublicCompany();

  return findLocationsWithSelect(
    {
      companyId: company.id,
    },
    {
      id: true,
      title: true,
    },
    {
      title: "asc",
    },
  );
}

export async function getPublicProfile() {
  const company = await getPublicCompany();

  if (!company.publicTherapistId) {
    throw new PublicSiteUnavailableError(
      "missing_public_therapist",
      `Configured public company "${company.slug}" is missing publicTherapistId.`,
    );
  }

  const publicTherapist = await getPublicTherapistForCompany(
    company.id,
    company.publicTherapistId,
  );

  if (!publicTherapist || !publicTherapist.role?.includes?.(UserRole.Therapist)) {
    throw new PublicSiteUnavailableError(
      "invalid_public_therapist",
      `Configured public therapist "${company.publicTherapistId}" is invalid for company "${company.slug}".`,
    );
  }

  return findUserByIdWithSelect(publicTherapist.id, publicProfileSelect);
}
