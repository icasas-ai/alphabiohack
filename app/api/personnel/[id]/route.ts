export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@/lib/prisma-client";

import { canManagePersonnel } from "@/lib/auth/authorization";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  isValidEmailInput,
  isValidPhoneInput,
  normalizeEmailInput,
  normalizePhoneInput,
  normalizeWhitespace,
} from "@/lib/validation/form-fields";
import { resolveManagedTherapistIdForUser } from "@/services";

async function getAccess(personnelId: string) {
  const { prismaUser } = await getCurrentUser();
  if (!prismaUser) {
    return { prismaUser: null, personnel: null, error: "Unauthorized", status: 401 as const };
  }

  if (!canManagePersonnel(prismaUser)) {
    return { prismaUser, personnel: null, error: "Forbidden", status: 403 as const };
  }

  const therapistId = await resolveManagedTherapistIdForUser(prismaUser);
  if (!therapistId) {
    return { prismaUser, personnel: null, error: "No therapist is configured for this account.", status: 409 as const };
  }

  const personnel = await prisma.user.findFirst({
    where: {
      id: personnelId,
      managedByTherapistId: therapistId,
      role: { has: UserRole.FrontDesk },
    },
  });

  if (!personnel) {
    return { prismaUser, personnel: null, error: "Personnel record not found.", status: 404 as const };
  }

  return { prismaUser, personnel, error: null, status: 200 as const };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const access = await getAccess(id);
  if (!access.personnel) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  try {
    const { firstname, lastname, email, telefono } = await request.json();
    const normalizedFirstname = normalizeWhitespace(firstname);
    const normalizedLastname = normalizeWhitespace(lastname);
    const nextEmail = normalizeEmailInput(email);
    const normalizedPhone = normalizePhoneInput(telefono);

    if (!normalizedFirstname || !normalizedLastname || !nextEmail) {
      return NextResponse.json(
        { error: "First name, last name, and email are required." },
        { status: 400 },
      );
    }

    if (!isValidEmailInput(nextEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    if (normalizedPhone && !isValidPhoneInput(normalizedPhone)) {
      return NextResponse.json(
        { error: "Please enter a valid phone number." },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findFirst({
      where: {
        email: nextEmail,
        NOT: { id },
      },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A user with this email already exists." },
        { status: 409 },
      );
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        firstname: normalizedFirstname,
        lastname: normalizedLastname,
        email: nextEmail,
        telefono: normalizedPhone || null,
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

    return NextResponse.json({ personnel: updated });
  } catch (error) {
    console.error("Error updating personnel:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const access = await getAccess(id);
  if (!access.personnel) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting personnel:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
