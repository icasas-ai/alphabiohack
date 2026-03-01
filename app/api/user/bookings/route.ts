import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { prismaUser } = await getCurrentUser();
    if (!prismaUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!prismaUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Obtener las citas del usuario por email
    const bookings = await prisma.booking.findMany({
      where: {
        email: prismaUser.email,
      },
      include: {
        location: {
          select: {
            title: true,
          },
        },
        specialty: {
          select: {
            id: true,
            name: true,
          },
        },
        service: {
          select: {
            id: true,
            description: true,
            cost: true,
            duration: true,
          },
        },
        therapist: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
          },
        },
      },
      orderBy: {
        bookingSchedule: "desc",
      },
    });

    return NextResponse.json({
      bookings,
    });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
