import { NextRequest, NextResponse } from "next/server";

import { canOperateAppointments } from "@/lib/auth/authorization";
import { getCurrentUser } from "@/lib/auth/session";
import { isSupportedCompanyTimezone } from "@/lib/constants/supported-timezones";
import { prisma } from "@/lib/prisma";
import { getPrimaryCompanyIdForUser } from "@/services";

const companyProfileSelect = {
  id: true,
  name: true,
  slug: true,
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
    if (
      body.defaultTimezone &&
      !isSupportedCompanyTimezone(body.defaultTimezone.trim())
    ) {
      return NextResponse.json(
        { error: "Unsupported timezone. Please select a supported US or Canada timezone." },
        { status: 400 },
      );
    }

    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: {
        name: body.name?.trim() || undefined,
        slug: body.slug?.trim() || undefined,
        logo: body.logo?.trim() || undefined,
        publicEmail: body.publicEmail?.trim() || undefined,
        publicPhone: body.publicPhone?.trim() || undefined,
        publicDescription: body.publicDescription?.trim() || undefined,
        publicSummary: body.publicSummary?.trim() || undefined,
        publicSpecialty: body.publicSpecialty?.trim() || undefined,
        defaultTimezone: body.defaultTimezone?.trim() || undefined,
        weekdaysHours: body.weekdaysHours?.trim() || undefined,
        saturdayHours: body.saturdayHours?.trim() || undefined,
        sundayHours: body.sundayHours?.trim() || undefined,
        facebook: body.facebook?.trim() || undefined,
        instagram: body.instagram?.trim() || undefined,
        linkedin: body.linkedin?.trim() || undefined,
        twitter: body.twitter?.trim() || undefined,
        tiktok: body.tiktok?.trim() || undefined,
        youtube: body.youtube?.trim() || undefined,
        website: body.website?.trim() || undefined,
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
