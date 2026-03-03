import { NextResponse } from "next/server";
import { getPublicProfile } from "@/services/public-profile.service";

export async function GET() {
  try {
    const user = await getPublicProfile();

    if (!user) {
      return NextResponse.json(
        { error: "No user information found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      firstname: user.firstname,
      lastname: user.lastname,
      especialidad: user.especialidad,
      summary: user.summary,
      avatar: user.avatar,
    });
  } catch (error) {
    console.error("Error fetching hero info:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
