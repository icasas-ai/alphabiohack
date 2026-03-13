import { NextRequest } from "next/server";

import {
  jsonError,
  jsonSuccess,
  requireAuthenticatedUser,
  requireAuthorizedUser,
} from "@/lib/api/route-helpers";
import { canOperateAppointments } from "@/lib/auth/authorization";
import {
  normalizeLandingPageConfig,
  parseLandingPageConfig,
  serializeLandingPageConfig,
} from "@/lib/company/landing-page-config";
import { isSupportedCompanyTimezone } from "@/lib/constants/supported-timezones";
import { prisma } from "@/lib/prisma";
import {
  isValidEmailInput,
  isValidPhoneInput,
  isValidUrlInput,
  normalizeEmailInput,
  normalizePhoneInput,
  normalizeUrlInput,
  normalizeWhitespace,
} from "@/lib/validation/form-fields";
import { getPrimaryCompanyIdForUser } from "@/services";

const companyProfileSelect = {
  id: true,
  name: true,
  slug: true,
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
} as const;

async function getCompanyContext() {
  const currentUser = await requireAuthenticatedUser();
  if ("response" in currentUser) {
    return { prismaUser: null, companyId: null };
  }

  const companyId = await getPrimaryCompanyIdForUser(currentUser.prismaUser.id);
  return { prismaUser: currentUser.prismaUser, companyId };
}

export async function GET() {
  try {
    const { prismaUser, companyId } = await getCompanyContext();

    if (!prismaUser) {
      return jsonError("Unauthorized", 401);
    }

    if (!companyId) {
      return jsonError("Company not found", 404);
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: companyProfileSelect,
    });

    if (!company) {
      return jsonError("Company not found", 404);
    }

    return jsonSuccess({
      ...company,
      landingPageConfig: parseLandingPageConfig(company.landingPageConfig),
      canEdit: canOperateAppointments(prismaUser),
    });
  } catch (error) {
    console.error("Error fetching company profile:", error);
    return jsonError("Internal server error", 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const currentUser = await requireAuthorizedUser(canOperateAppointments);
    if ("response" in currentUser) {
      return currentUser.response;
    }

    const companyId = await getPrimaryCompanyIdForUser(currentUser.prismaUser.id);
    if (!companyId) {
      return jsonError("Company not found", 404);
    }

    const body = await request.json();
    const normalizedName = normalizeWhitespace(body.name);
    const normalizedPublicEmail = normalizeEmailInput(body.publicEmail);
    const normalizedPublicPhone = normalizePhoneInput(body.publicPhone);
    const normalizedUrls = {
      facebook: normalizeUrlInput(body.facebook),
      instagram: normalizeUrlInput(body.instagram),
      linkedin: normalizeUrlInput(body.linkedin),
      twitter: normalizeUrlInput(body.twitter),
      tiktok: normalizeUrlInput(body.tiktok),
      youtube: normalizeUrlInput(body.youtube),
      website: normalizeUrlInput(body.website),
    };

    if (!normalizedName) {
      return jsonError("Company name is required.", 400);
    }

    if (
      body.defaultTimezone &&
      !isSupportedCompanyTimezone(body.defaultTimezone.trim())
    ) {
      return jsonError(
        "Unsupported timezone. Please select a supported US or Canada timezone.",
        400,
      );
    }

    if (normalizedPublicEmail && !isValidEmailInput(normalizedPublicEmail)) {
      return jsonError("Please enter a valid public email address.", 400);
    }

    if (normalizedPublicPhone && !isValidPhoneInput(normalizedPublicPhone)) {
      return jsonError("Please enter a valid public phone number.", 400);
    }

    for (const [key, value] of Object.entries(normalizedUrls)) {
      if (value && !isValidUrlInput(value)) {
        return jsonError(`Please enter a valid URL for ${key}.`, 400);
      }
    }

    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: {
        name: normalizedName,
        logo: body.logo?.trim() || null,
        headerLogo: body.headerLogo?.trim() || null,
        publicEmail: normalizedPublicEmail || null,
        publicPhone: normalizedPublicPhone || null,
        publicDescription: body.publicDescription?.trim() || null,
        publicSummary: body.publicSummary?.trim() || null,
        publicSpecialty: normalizeWhitespace(body.publicSpecialty) || null,
        landingPageConfig: serializeLandingPageConfig(
          normalizeLandingPageConfig(body.landingPageConfig),
        ),
        defaultTimezone: body.defaultTimezone?.trim() || undefined,
        weekdaysHours: body.weekdaysHours?.trim() || null,
        saturdayHours: body.saturdayHours?.trim() || null,
        sundayHours: body.sundayHours?.trim() || null,
        facebook: normalizedUrls.facebook || null,
        instagram: normalizedUrls.instagram || null,
        linkedin: normalizedUrls.linkedin || null,
        twitter: normalizedUrls.twitter || null,
        tiktok: normalizedUrls.tiktok || null,
        youtube: normalizedUrls.youtube || null,
        website: normalizedUrls.website || null,
      },
      select: companyProfileSelect,
    });

    return jsonSuccess({
      ...updatedCompany,
      landingPageConfig: parseLandingPageConfig(updatedCompany.landingPageConfig),
    });
  } catch (error) {
    console.error("Error updating company profile:", error);
    return jsonError("Internal server error", 500);
  }
}
