export const runtime = "nodejs";

import { randomBytes } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { PersonnelInviteEmail } from "@/emails/personnel-invite";
import {
  buildPersonnelWhere,
  getManagerDisplayName,
  getMemberRoleKey,
  getPersonnelManagementContext,
  getStaffRoleFromMembershipRole,
  isStaffRole,
  listAssignableTherapistsForContext,
} from "@/lib/personnel-management";
import { hashPassword } from "@/lib/auth/session";
import { CompanyMembershipRole, UserRole } from "@/lib/prisma-client";
import { prisma } from "@/lib/prisma";
import {
  isValidEmailInput,
  isValidPhoneInput,
  normalizeEmailInput,
  normalizePhoneInput,
  normalizeWhitespace,
} from "@/lib/validation/form-fields";
import { sendEmail } from "@/services/email.service";

function generateTemporaryPassword() {
  return randomBytes(12)
    .toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 12);
}

export async function GET() {
  const context = await getPersonnelManagementContext();
  if (!context.companyId || !context.prismaUser) {
    return NextResponse.json({ error: context.error }, { status: context.status });
  }

  const [rows, therapists] = await Promise.all([
    prisma.user.findMany({
      where: buildPersonnelWhere(context),
      orderBy: [{ firstname: "asc" }, { lastname: "asc" }],
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        telefono: true,
        mustChangePassword: true,
        createdAt: true,
        updatedAt: true,
        managedByTherapistId: true,
        managedByTherapist: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
          },
        },
        companyMemberships: {
          where: {
            companyId: context.companyId,
            role: {
              in: context.visibleMembershipRoles,
            },
          },
          select: {
            role: true,
          },
        },
      },
    }),
    listAssignableTherapistsForContext(context),
  ]);

  const personnel = rows
    .map((row) => {
      const membershipRole = row.companyMemberships[0]?.role ?? CompanyMembershipRole.FrontDesk;
      const managedByTherapistName = row.managedByTherapist
        ? `${row.managedByTherapist.firstname} ${row.managedByTherapist.lastname}`.trim()
        : null;

      return {
        id: row.id,
        firstname: row.firstname,
        lastname: row.lastname,
        email: row.email,
        telefono: row.telefono,
        mustChangePassword: row.mustChangePassword,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        staffRole: getStaffRoleFromMembershipRole(membershipRole),
        managedByTherapistId: row.managedByTherapistId,
        managedByTherapistName,
      };
    })
    .sort((left, right) => {
      if (left.staffRole !== right.staffRole) {
        return left.staffRole === UserRole.Therapist ? -1 : 1;
      }

      const firstNameCompare = left.firstname.localeCompare(right.firstname);
      if (firstNameCompare !== 0) {
        return firstNameCompare;
      }

      return left.lastname.localeCompare(right.lastname);
    });

  return NextResponse.json({
    personnel,
    therapists: therapists.map((therapist) => ({
      id: therapist.id,
      firstname: therapist.firstname,
      lastname: therapist.lastname,
      email: therapist.email,
    })),
    capabilities: {
      canManageCompanyTeam: context.canManageCompanyTeam,
      canManageTherapists: context.canManageTherapists,
      managedTherapistId: context.managedTherapistId,
    },
  });
}

export async function POST(request: NextRequest) {
  const context = await getPersonnelManagementContext();
  if (!context.companyId || !context.prismaUser) {
    return NextResponse.json({ error: context.error }, { status: context.status });
  }

  try {
    const { firstname, lastname, email, telefono, staffRole, managedByTherapistId } =
      await request.json();
    const normalizedFirstname = normalizeWhitespace(firstname);
    const normalizedLastname = normalizeWhitespace(lastname);
    const normalizedEmail = normalizeEmailInput(email);
    const normalizedPhone = normalizePhoneInput(telefono);
    const normalizedManagedByTherapistId = normalizeWhitespace(managedByTherapistId);

    if (!normalizedFirstname || !normalizedLastname || !normalizedEmail) {
      return NextResponse.json(
        { error: "First name, last name, and email are required." },
        { status: 400 },
      );
    }

    if (!isStaffRole(staffRole)) {
      return NextResponse.json(
        { error: "Select a valid team role." },
        { status: 400 },
      );
    }

    if (staffRole === UserRole.Therapist && !context.canManageTherapists) {
      return NextResponse.json(
        { error: "Only the company owner can add therapists from this screen." },
        { status: 403 },
      );
    }

    if (!isValidEmailInput(normalizedEmail)) {
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

    let nextManagedByTherapistId: string | null = null;
    if (staffRole === UserRole.FrontDesk) {
      nextManagedByTherapistId = context.canManageCompanyTeam
        ? normalizedManagedByTherapistId || null
        : context.managedTherapistId;

      if (nextManagedByTherapistId) {
        const assignableTherapists = await listAssignableTherapistsForContext(context);
        const isValidTherapist = assignableTherapists.some(
          (therapist) => therapist.id === nextManagedByTherapistId,
        );

        if (!isValidTherapist) {
          return NextResponse.json(
            { error: "Select a valid therapist for this front desk account." },
            { status: 400 },
          );
        }
      }
    }

    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = hashPassword(temporaryPassword);
    const membershipRole =
      staffRole === UserRole.Therapist
        ? CompanyMembershipRole.Therapist
        : CompanyMembershipRole.FrontDesk;

    const user = await prisma.user.create({
      data: {
        firstname: normalizedFirstname,
        lastname: normalizedLastname,
        email: normalizedEmail,
        telefono: normalizedPhone || null,
        role: [staffRole],
        passwordHash,
        mustChangePassword: true,
        managedByTherapistId: nextManagedByTherapistId,
        companyMemberships: {
          create: {
            companyId: context.companyId,
            role: membershipRole,
          },
        },
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        telefono: true,
        mustChangePassword: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const loginUrl = new URL("/auth/login", request.url).toString();

    await sendEmail({
      context: "personnel.invite",
      to: normalizedEmail,
      subject: "Your MyAlphaPulse team access",
      react: PersonnelInviteEmail({
        recipientName: user.firstname,
        managerName: getManagerDisplayName(context.prismaUser),
        memberRole: getMemberRoleKey(staffRole),
        temporaryPassword,
        loginUrl,
        language: "en",
      }),
    });

    return NextResponse.json({ personnel: user }, { status: 201 });
  } catch (error) {
    console.error("Error creating personnel:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
