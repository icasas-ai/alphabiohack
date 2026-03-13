import { appUserSelect } from "@/lib/auth/app-user";
import {
  jsonError,
  jsonSuccess,
  requireAuthenticatedUser,
} from "@/lib/api/route-helpers";
import { prisma } from "@/lib/prisma";
import {
  isValidPhoneInput,
  isValidUrlInput,
  normalizePhoneInput,
  normalizeUrlInput,
  normalizeWhitespace,
} from "@/lib/validation/form-fields";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    const currentUser = await requireAuthenticatedUser();
    if ("response" in currentUser) {
      return currentUser.response;
    }

    return jsonSuccess(currentUser.prismaUser);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return jsonError("Internal server error", 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const currentUser = await requireAuthenticatedUser();
    if ("response" in currentUser) {
      return currentUser.response;
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
      return jsonError("Please enter a valid phone number.", 400);
    }

    for (const [key, value] of Object.entries(normalizedUrls)) {
      if (value && !isValidUrlInput(value)) {
        return jsonError(`Please enter a valid URL for ${key}.`, 400);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: currentUser.prismaUser.id },
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
      select: appUserSelect,
    });

    return jsonSuccess(updatedUser);
  } catch (error) {
    console.error("Error updating user profile:", error);
    return jsonError("Internal server error", 500);
  }
}
