import { NextResponse } from "next/server";
import { UserRole } from "@/lib/prisma-client";

import { getCurrentUser } from "@/lib/auth/session";
import { getPrimaryCompanyIdForUser, getPublicCompany, getUsersByRole } from "@/services";
import { isPublicSiteUnavailableError } from "@/services/company.service";

export async function GET() {
  try {
    const { prismaUser } = await getCurrentUser();
    const companyId = prismaUser
      ? await getPrimaryCompanyIdForUser(prismaUser.id)
      : (await getPublicCompany()).id;

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: "Company not found" },
        { status: 404 },
      );
    }

    const therapists = await getUsersByRole(UserRole.Therapist, companyId);

    return NextResponse.json({
      success: true,
      data: therapists.map((therapist) => ({
        id: therapist.id,
        firstName: therapist.firstname,
        lastName: therapist.lastname,
        profileImage: therapist.avatar || "",
        specialties: therapist.especialidad ? [therapist.especialidad] : [],
        bio: therapist.summary || "Professional",
        rating: 4.8,
      })),
    });
  } catch (error) {
    if (isPublicSiteUnavailableError(error)) {
      return NextResponse.json(
        { success: false, error: "Public site unavailable" },
        { status: 503 },
      );
    }

    console.error("Error fetching therapists:", error);
    const message =
      error instanceof Error ? error.message : "Error fetching therapists";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
