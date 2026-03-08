import { NextRequest, NextResponse } from "next/server";
import { CompanyMembershipRole, UserRole } from "@/lib/prisma-client";

import { createLocalSession, hashPassword } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { isValidEmailInput, normalizeEmailInput, normalizeWhitespace } from "@/lib/validation/form-fields";
import { DEFAULT_SEED_COMPANY } from "@/prisma/seeds/config/default-company";
import { resolveSeedCompanyContent } from "@/prisma/seeds/config/default-company-content";
import { getPublicCompany } from "@/services";

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstname = "", lastname = "" } = await request.json();
    const normalizedEmail = normalizeEmailInput(email);
    const normalizedFirstname = normalizeWhitespace(firstname);
    const normalizedLastname = normalizeWhitespace(lastname);

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

    if (typeof password !== "string" || password.trim().length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 },
      );
    }

    const preferredLocale = request.headers.get("accept-language")?.split(",")[0] ?? "en";
    const defaultCompanyContent = resolveSeedCompanyContent(preferredLocale);

    const publicCompany =
      (await getPublicCompany()) ||
      (await prisma.company.upsert({
        where: { slug: DEFAULT_SEED_COMPANY.slug },
        update: {
          publicDescription: defaultCompanyContent.publicDescription,
          publicSummary: defaultCompanyContent.publicSummary,
          publicSpecialty: defaultCompanyContent.publicSpecialty,
        },
        create: {
          ...DEFAULT_SEED_COMPANY,
          publicDescription: defaultCompanyContent.publicDescription,
          publicSummary: defaultCompanyContent.publicSummary,
          publicSpecialty: defaultCompanyContent.publicSpecialty,
          publicEmail: normalizedEmail,
        },
      }));

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        supabaseId: `local-${crypto.randomUUID()}`,
        firstname: normalizedFirstname,
        lastname: normalizedLastname,
        role: [UserRole.Patient],
        passwordHash: hashPassword(password.trim()),
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
