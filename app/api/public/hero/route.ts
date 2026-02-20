import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Obtener el primer usuario (datos públicos del negocio)
    const user = await prisma.user.findFirst({
      select: {
        firstname: true,
        lastname: true,
        especialidad: true,
        summary: true,
        avatar: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No user information found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching hero info:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
