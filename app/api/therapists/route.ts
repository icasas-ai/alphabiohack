import { NextResponse } from "next/server";
import { UserRole } from "@/lib/prisma-client";

import { getPublicCompany, getUsersByRole } from "@/services";
import { isPublicSiteUnavailableError } from "@/services/company.service";

export async function GET() {
  try {
    const company = await getPublicCompany();
    const therapists = await getUsersByRole(UserRole.Therapist, company.id);

    return NextResponse.json({
      success: true,
      data: therapists.map((therapist) => ({
        id: therapist.id,
        firstName: therapist.firstname,
        lastName: therapist.lastname,
        profileImage: therapist.avatar || "/images/smiling-doctor.png",
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
