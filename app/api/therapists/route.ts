import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";

import { getUsersByRole } from "@/services";

export async function GET() {
  try {
    const therapists = await getUsersByRole(UserRole.Therapist);

    return NextResponse.json({
      success: true,
      data: therapists.map((therapist) => ({
        id: therapist.id,
        firstName: therapist.firstname,
        lastName: therapist.lastname,
        email: therapist.email,
        profileImage: therapist.avatar || "/images/smiling-doctor.png",
        specialties: therapist.especialidad ? [therapist.especialidad] : [],
        bio: therapist.summary || "Professional",
        rating: 4.8,
      })),
    });
  } catch (error) {
    console.error("Error fetching therapists:", error);
    return NextResponse.json(
      { success: false, error: "Error fetching therapists" },
      { status: 500 },
    );
  }
}
