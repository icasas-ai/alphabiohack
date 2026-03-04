export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { CompanyMembershipRole, UserRole } from "@prisma/client";
import { randomBytes, randomUUID } from "node:crypto";

import { PersonnelInviteEmail } from "@/emails/personnel-invite";
import { getCurrentUser, hashPassword } from "@/lib/auth/session";
import { canManagePersonnel } from "@/lib/auth/authorization";
import { hasSupabaseAuth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/services/email.service";
import { getPrimaryCompanyIdForUser, resolveManagedTherapistIdForUser } from "@/services";

function generateTemporaryPassword() {
  return randomBytes(12)
    .toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 12);
}

async function getPersonnelContext() {
  const { prismaUser } = await getCurrentUser();
  if (!prismaUser) {
    return { prismaUser: null, therapistId: null, error: "Unauthorized", status: 401 as const };
  }

  if (!canManagePersonnel(prismaUser)) {
    return { prismaUser, therapistId: null, error: "Forbidden", status: 403 as const };
  }

  const therapistId = await resolveManagedTherapistIdForUser(prismaUser);
  if (!therapistId) {
    return {
      prismaUser,
      therapistId: null,
      error: "No therapist is configured for this account.",
      status: 409 as const,
    };
  }

  return { prismaUser, therapistId, error: null, status: 200 as const };
}

export async function GET() {
  const context = await getPersonnelContext();
  if (!context.therapistId) {
    return NextResponse.json({ error: context.error }, { status: context.status });
  }

  const personnel = await prisma.user.findMany({
    where: {
      managedByTherapistId: context.therapistId,
      role: {
        has: UserRole.FrontDesk,
      },
    },
    orderBy: [{ firstname: "asc" }, { lastname: "asc" }],
    select: {
      id: true,
      firstname: true,
      lastname: true,
      email: true,
      telefono: true,
      role: true,
      mustChangePassword: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ personnel });
}

export async function POST(request: NextRequest) {
  if (hasSupabaseAuth) {
    return NextResponse.json(
      { error: "Personnel invitations are only supported when local auth is enabled." },
      { status: 409 },
    );
  }

  const context = await getPersonnelContext();
  if (!context.therapistId || !context.prismaUser) {
    return NextResponse.json({ error: context.error }, { status: context.status });
  }

  try {
    const companyId = await getPrimaryCompanyIdForUser(context.prismaUser.id);
    if (!companyId) {
      return NextResponse.json(
        { error: "No company is configured for this therapist." },
        { status: 409 },
      );
    }

    const { firstname, lastname, email, telefono } = await request.json();

    if (!firstname || !lastname || !email) {
      return NextResponse.json(
        { error: "First name, last name, and email are required." },
        { status: 400 },
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A user with this email already exists." },
        { status: 409 },
      );
    }

    const temporaryPassword = generateTemporaryPassword();
    const user = await prisma.user.create({
      data: {
        firstname: String(firstname).trim(),
        lastname: String(lastname).trim(),
        email: normalizedEmail,
        telefono: telefono ? String(telefono).trim() : null,
        supabaseId: `local-frontdesk-${randomUUID()}`,
        role: [UserRole.FrontDesk],
        passwordHash: hashPassword(temporaryPassword),
        mustChangePassword: true,
        managedByTherapistId: context.therapistId,
        companyMemberships: {
          create: {
            companyId,
            role: CompanyMembershipRole.FrontDesk,
          },
        },
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        telefono: true,
        role: true,
        mustChangePassword: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const therapistName =
      `${context.prismaUser.firstname} ${context.prismaUser.lastname}`.trim() || context.prismaUser.email;
    const loginUrl = new URL("/auth/login", request.url).toString();

    await sendEmail({
      to: normalizedEmail,
      subject: `Your AlphaBioHack staff access`,
      react: PersonnelInviteEmail({
        recipientName: user.firstname,
        therapistName,
        temporaryPassword,
        loginUrl,
        language: "en",
      }),
    });

    return NextResponse.json({ personnel: user }, { status: 201 });
  } catch (error) {
    console.error("Error creating personnel:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
