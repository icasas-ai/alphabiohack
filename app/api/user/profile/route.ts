import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userProfile = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    });

    console.log("GET /api/user/profile: User data:", userProfile);

    if (!userProfile) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { firstname, lastname, avatar, telefono, informacionPublica, especialidad, summary, weekdaysHours, saturdayHours, sundayHours, facebook, instagram, linkedin, twitter, tiktok, youtube, website } = body;

    const updatedUser = await prisma.user.update({
      where: { supabaseId: user.id },
      data: {
        firstname: firstname || undefined,
        lastname: lastname || undefined,
        avatar: avatar || undefined,
        telefono: telefono || undefined,
        informacionPublica: informacionPublica || undefined,
        especialidad: especialidad || undefined,
        summary: summary || undefined,
        weekdaysHours: weekdaysHours || undefined,
        saturdayHours: saturdayHours || undefined,
        sundayHours: sundayHours || undefined,
        facebook: facebook || undefined,
        instagram: instagram || undefined,
        linkedin: linkedin || undefined,
        twitter: twitter || undefined,
        tiktok: tiktok || undefined,
        youtube: youtube || undefined,
        website: website || undefined,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
