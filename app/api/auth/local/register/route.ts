import { NextRequest, NextResponse } from "next/server";
import { CompanyMembershipRole, UserRole } from "@prisma/client";

import { createLocalSession, hashPassword } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getPublicCompany } from "@/services";

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

    const publicCompany = await getPublicCompany();
    const user = await prisma.user.create({
      data: {
        email,
        supabaseId: `local-${crypto.randomUUID()}`,
        firstname,
        lastname,
        role: [UserRole.Patient],
        passwordHash: hashPassword(password),
        companyMemberships: publicCompany
          ? {
              create: {
                companyId: publicCompany.id,
                role: CompanyMembershipRole.Patient,
              },
            }
          : undefined,
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
