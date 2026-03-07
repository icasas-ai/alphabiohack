import { NextRequest, NextResponse } from "next/server";

import { hashPassword, getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { prismaUser } = await getCurrentUser();

    if (!prismaUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { password } = await request.json();

    if (typeof password !== "string" || password.trim().length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 },
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: prismaUser.id },
      data: {
        passwordHash: hashPassword(password.trim()),
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
    console.error("Local password update failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
