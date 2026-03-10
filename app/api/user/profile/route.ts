import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  isValidPhoneInput,
  isValidUrlInput,
  normalizePhoneInput,
  normalizeUrlInput,
  normalizeWhitespace,
} from "@/lib/validation/form-fields";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const { prismaUser } = await getCurrentUser();
    if (!prismaUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userProfile = await prisma.user.findUnique({
      where: { id: prismaUser.id },
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
    const { prismaUser } = await getCurrentUser();
    if (!prismaUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      firstname,
      lastname,
      avatar,
      telefono,
      informacionPublica,
      especialidad,
      summary,
      facebook,
      instagram,
      linkedin,
      twitter,
      tiktok,
      youtube,
      website,
    } = body;

    const normalizedPhone = normalizePhoneInput(telefono);
    const normalizedUrls = {
      facebook: normalizeUrlInput(facebook),
      instagram: normalizeUrlInput(instagram),
      linkedin: normalizeUrlInput(linkedin),
      twitter: normalizeUrlInput(twitter),
      tiktok: normalizeUrlInput(tiktok),
      youtube: normalizeUrlInput(youtube),
      website: normalizeUrlInput(website),
    };

    if (normalizedPhone && !isValidPhoneInput(normalizedPhone)) {
      return NextResponse.json(
        { error: "Please enter a valid phone number." },
        { status: 400 }
      );
    }

    for (const [key, value] of Object.entries(normalizedUrls)) {
      if (value && !isValidUrlInput(value)) {
        return NextResponse.json(
          { error: `Please enter a valid URL for ${key}.` },
          { status: 400 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: prismaUser.id },
      data: {
        firstname: normalizeWhitespace(firstname) || undefined,
        lastname: normalizeWhitespace(lastname) || undefined,
        avatar: avatar || null,
        telefono: normalizedPhone || null,
        informacionPublica: normalizeWhitespace(informacionPublica) || null,
        especialidad: normalizeWhitespace(especialidad) || null,
        summary: typeof summary === "string" ? summary.trim() || null : null,
        facebook: normalizedUrls.facebook || null,
        instagram: normalizedUrls.instagram || null,
        linkedin: normalizedUrls.linkedin || null,
        twitter: normalizedUrls.twitter || null,
        tiktok: normalizedUrls.tiktok || null,
        youtube: normalizedUrls.youtube || null,
        website: normalizedUrls.website || null,
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
