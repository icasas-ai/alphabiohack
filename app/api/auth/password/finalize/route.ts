import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const { prismaUser } = await getCurrentUser();

    if (!prismaUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: prismaUser.id },
      data: {
        mustChangePassword: false,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({
      user: updatedUser,
    });
  } catch (error) {
    console.error("Failed to finalize password update:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
