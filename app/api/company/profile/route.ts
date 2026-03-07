import { NextRequest, NextResponse } from "next/server";

import { canOperateAppointments } from "@/lib/auth/authorization";
import { getCurrentUser } from "@/lib/auth/session";
import { isSupportedCompanyTimezone } from "@/lib/constants/supported-timezones";
import { prisma } from "@/lib/prisma";
import {
  isValidEmailInput,
  isValidPhoneInput,
  isValidSlugInput,
  isValidUrlInput,
  normalizeEmailInput,
  normalizePhoneInput,
  normalizeSlugInput,
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
  const { prismaUser } = await getCurrentUser();

  if (!prismaUser) {
    return { prismaUser: null, companyId: null };
  }

  const companyId = await getPrimaryCompanyIdForUser(prismaUser.id);
  return { prismaUser, companyId };
}

export async function GET() {
  try {
    const { prismaUser, companyId } = await getCompanyContext();

    if (!prismaUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!companyId) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: companyProfileSelect,
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...company,
      canEdit: canOperateAppointments(prismaUser),
    });
  } catch (error) {
    console.error("Error fetching company profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { prismaUser, companyId } = await getCompanyContext();

    if (!prismaUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!canOperateAppointments(prismaUser)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!companyId) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const body = await request.json();
    const normalizedName = normalizeWhitespace(body.name);
    const normalizedSlug = normalizeSlugInput(body.slug);
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

    if (!normalizedName || !normalizedSlug || !isValidSlugInput(normalizedSlug)) {
      return NextResponse.json({ error: "Company name and slug are required." }, { status: 400 });
    }

    if (
      body.defaultTimezone &&
      !isSupportedCompanyTimezone(body.defaultTimezone.trim())
    ) {
      return NextResponse.json(
        { error: "Unsupported timezone. Please select a supported US or Canada timezone." },
        { status: 400 },
      );
    }

    if (normalizedPublicEmail && !isValidEmailInput(normalizedPublicEmail)) {
      return NextResponse.json({ error: "Please enter a valid public email address." }, { status: 400 });
    }

    if (normalizedPublicPhone && !isValidPhoneInput(normalizedPublicPhone)) {
      return NextResponse.json({ error: "Please enter a valid public phone number." }, { status: 400 });
    }

    for (const [key, value] of Object.entries(normalizedUrls)) {
      if (value && !isValidUrlInput(value)) {
        return NextResponse.json({ error: `Please enter a valid URL for ${key}.` }, { status: 400 });
      }
    }

    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: {
        name: normalizedName,
        slug: normalizedSlug,
        logo: body.logo?.trim() || null,
        headerLogo: body.headerLogo?.trim() || null,
        publicEmail: normalizedPublicEmail || null,
        publicPhone: normalizedPublicPhone || null,
        publicDescription: body.publicDescription?.trim() || null,
        publicSummary: body.publicSummary?.trim() || null,
        publicSpecialty: normalizeWhitespace(body.publicSpecialty) || null,
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

    return NextResponse.json(updatedCompany);
  } catch (error) {
    console.error("Error updating company profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
