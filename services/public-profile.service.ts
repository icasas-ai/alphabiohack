import { UserRole } from "@prisma/client";

import { getDefaultTherapistId } from "@/lib/config/features";
import {
  findCompanyWithSelect,
  findFirstTherapistWithSelect,
  findFirstUserWithSelect,
  findLocationsWithSelect,
  findUserByIdWithSelect,
} from "@/repositories";
import { getPublicCompany, getPublicTherapistForCompany } from "@/services/company.service";

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
} as const;

export const publicCompanySelect = {
  id: true,
  slug: true,
  name: true,
  logo: true,
  publicEmail: true,
  publicPhone: true,
  publicDescription: true,
  publicSummary: true,
  publicSpecialty: true,
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

  if (!company) {
    return null;
  }

  return findCompanyWithSelect(company.id, publicCompanySelect);
}

export async function getPublicCompanyLocations() {
  const company = await getPublicCompany();
  if (!company) return [];

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
  const defaultTherapistId = getDefaultTherapistId();

  if (company) {
    const publicTherapist = await getPublicTherapistForCompany(
      company.id,
      company.publicTherapistId || defaultTherapistId,
    );

    if (publicTherapist && publicTherapist.role?.includes?.(UserRole.Therapist)) {
      return findUserByIdWithSelect(publicTherapist.id, publicProfileSelect);
    }
  }

  if (defaultTherapistId) {
    const configuredTherapist = await findUserByIdWithSelect(
      defaultTherapistId,
      publicProfileSelect,
    );

    if (configuredTherapist?.role?.includes?.(UserRole.Therapist) ?? false) {
      return configuredTherapist;
    }
  }

  const firstTherapist = await findFirstTherapistWithSelect(publicProfileSelect);

  if (firstTherapist) {
    return firstTherapist;
  }

  return findFirstUserWithSelect(publicProfileSelect);
}
