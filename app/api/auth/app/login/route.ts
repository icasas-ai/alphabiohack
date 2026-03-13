import { NextRequest, NextResponse } from "next/server";

import { createAppSession, verifyPassword } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  isValidEmailInput,
  normalizeEmailInput,
} from "@/lib/validation/form-fields";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const normalizedEmail = normalizeEmailInput(email);

    if (!normalizedEmail || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    if (!isValidEmailInput(normalizedEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user?.passwordHash || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    await createAppSession(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    });
  } catch (error) {
    console.error("App-managed login failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
