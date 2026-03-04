import { NextResponse } from "next/server";

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
        profileImage: profile.avatar || "/images/smiling-doctor.png",
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
    console.error("Error fetching public therapist profile:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
