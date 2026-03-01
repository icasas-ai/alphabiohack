import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";

import { createLocalSession, hashPassword } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstname = "", lastname = "" } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 },
      );
    }

    const user = await prisma.user.create({
      data: {
        email,
        supabaseId: `local-${crypto.randomUUID()}`,
        firstname,
        lastname,
        role: [UserRole.Patient],
        passwordHash: hashPassword(password),
      },
    });

    await createLocalSession(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Local registration failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
