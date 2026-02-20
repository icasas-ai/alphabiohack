import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Obtener el primer usuario (datos públicos del negocio)
    const user = await prisma.user.findFirst({
      select: {
        telefono: true,
        informacionPublica: true,
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
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No business information found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching contact info:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
