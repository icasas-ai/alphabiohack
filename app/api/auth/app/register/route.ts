import { NextRequest, NextResponse } from "next/server";
import { CompanyMembershipRole, UserRole } from "@/lib/prisma-client";

import { createAppSession, hashPassword } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  isValidEmailInput,
  isValidPhoneInput,
  normalizeEmailInput,
  normalizePhoneInput,
  normalizeWhitespace,
} from "@/lib/validation/form-fields";
import { isPublicSiteUnavailableError } from "@/services/company.service";
import { getPublicCompany } from "@/services";

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstname = "", lastname = "", phone = "" } =
      await request.json();
    const normalizedEmail = normalizeEmailInput(email);
    const normalizedFirstname = normalizeWhitespace(firstname);
    const normalizedLastname = normalizeWhitespace(lastname);
    const normalizedPhone = normalizePhoneInput(phone);

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

    if (normalizedPhone && !isValidPhoneInput(normalizedPhone)) {
      return NextResponse.json(
        { error: "Please enter a valid phone number" },
        { status: 400 },
      );
    }

    const publicCompany = await getPublicCompany();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        telefono: true,
        passwordHash: true,
        role: true,
        companyMemberships: {
          where: {
            companyId: publicCompany.id,
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (existing) {
      if (existing.passwordHash) {
        return NextResponse.json(
          { error: "User already exists" },
          { status: 409 },
        );
      }

      const nextRole = existing.role.includes(UserRole.Patient)
        ? existing.role
        : [...existing.role, UserRole.Patient];

      const user = await prisma.user.update({
        where: { id: existing.id },
        data: {
          firstname: normalizedFirstname || existing.firstname,
          lastname: normalizedLastname || existing.lastname,
          telefono: existing.telefono || normalizedPhone || null,
          passwordHash: hashPassword(password.trim()),
          mustChangePassword: false,
          role: nextRole,
          companyMemberships:
            existing.companyMemberships.length === 0
              ? {
                  create: {
                    companyId: publicCompany.id,
                    role: CompanyMembershipRole.Patient,
                  },
                }
              : undefined,
        },
      });

      await createAppSession(user.id);

      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
        },
      });
    }

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        firstname: normalizedFirstname,
        lastname: normalizedLastname,
        telefono: normalizedPhone || null,
        role: [UserRole.Patient],
        passwordHash: hashPassword(password.trim()),
        companyMemberships: {
          create: {
            companyId: publicCompany.id,
            role: CompanyMembershipRole.Patient,
          },
        },
      },
    });

    await createAppSession(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    if (isPublicSiteUnavailableError(error)) {
      return NextResponse.json(
        { error: "Public site unavailable" },
        { status: 503 },
      );
    }

    console.error("App-managed registration failed:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
