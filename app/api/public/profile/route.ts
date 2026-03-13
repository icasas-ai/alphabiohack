import { NextResponse } from "next/server";

import { isPublicSiteUnavailableError } from "@/services/company.service";
import { getPublicProfile } from "@/services/public-profile.service";

export async function GET() {
  try {
    const profile = await getPublicProfile();

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "No public therapist found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: profile.id,
        firstName: profile.firstname,
        lastName: profile.lastname,
        phone: profile.telefono || "",
        specialties: profile.especialidad ? [profile.especialidad] : ["Alphabiotics"],
        bio: profile.summary || profile.informacionPublica || "Experienced professional.",
        profileImage: profile.avatar || "",
        qualifications: ["Licensed professional"],
        languages: ["English", "Spanish"],
        experience: "5+ years",
        rating: 4.8,
        totalPatients: 0,
        address: "",
        email: profile.email,
      },
    });
  } catch (error) {
    if (isPublicSiteUnavailableError(error)) {
      return NextResponse.json(
        { success: false, error: "Public site unavailable" },
        { status: 503 },
      );
    }

    console.error("Error fetching public therapist profile:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
