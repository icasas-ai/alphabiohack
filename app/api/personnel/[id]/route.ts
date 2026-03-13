export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import {
  buildPersonnelWhere,
  getPersonnelManagementContext,
  getStaffRoleFromMembershipRole,
  isStaffRole,
  listAssignableTherapistsForContext,
} from "@/lib/personnel-management";
import { Prisma, UserRole } from "@/lib/prisma-client";
import { prisma } from "@/lib/prisma";
import {
  isValidEmailInput,
  isValidPhoneInput,
  normalizeEmailInput,
  normalizePhoneInput,
  normalizeWhitespace,
} from "@/lib/validation/form-fields";

async function getAccess(personnelId: string) {
  const context = await getPersonnelManagementContext();
  if (!context.companyId || !context.prismaUser) {
    return { context, personnel: null, staffRole: null, error: context.error, status: context.status };
  }

  const personnel = await prisma.user.findFirst({
    where: buildPersonnelWhere(context, personnelId),
    select: {
      id: true,
      managedByTherapistId: true,
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
      _count: {
        select: {
          managedPersonnel: true,
        },
      },
    },
  });

  if (!personnel) {
    return {
      context,
      personnel: null,
      staffRole: null,
      error: "Team member not found.",
      status: 404 as const,
    };
  }

  const membershipRole = personnel.companyMemberships[0]?.role;
  if (!membershipRole) {
    return {
      context,
      personnel: null,
      staffRole: null,
      error: "Team member not found.",
      status: 404 as const,
    };
  }

  return {
    context,
    personnel,
    staffRole: getStaffRoleFromMembershipRole(membershipRole),
    error: null,
    status: 200 as const,
  };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const access = await getAccess(id);
  if (!access.personnel || !access.context.companyId) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  try {
    const { firstname, lastname, email, telefono, staffRole, managedByTherapistId } =
      await request.json();
    const normalizedFirstname = normalizeWhitespace(firstname);
    const normalizedLastname = normalizeWhitespace(lastname);
    const nextEmail = normalizeEmailInput(email);
    const normalizedPhone = normalizePhoneInput(telefono);
    const normalizedManagedByTherapistId = normalizeWhitespace(managedByTherapistId);

    if (!normalizedFirstname || !normalizedLastname || !nextEmail) {
      return NextResponse.json(
        { error: "First name, last name, and email are required." },
        { status: 400 },
      );
    }

    if (staffRole && (!isStaffRole(staffRole) || staffRole !== access.staffRole)) {
      return NextResponse.json(
        { error: "Team roles cannot be changed from this screen." },
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

    let nextManagedByTherapistId: string | null = null;
    if (access.staffRole === UserRole.FrontDesk) {
      nextManagedByTherapistId = access.context.canManageCompanyTeam
        ? normalizedManagedByTherapistId || null
        : access.context.managedTherapistId;

      if (nextManagedByTherapistId) {
        const assignableTherapists = await listAssignableTherapistsForContext(access.context);
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

    const updated = await prisma.user.update({
      where: { id },
      data: {
        firstname: normalizedFirstname,
        lastname: normalizedLastname,
        email: nextEmail,
        telefono: normalizedPhone || null,
        managedByTherapistId:
          access.staffRole === UserRole.FrontDesk ? nextManagedByTherapistId : null,
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

  if (
    access.staffRole === UserRole.Therapist &&
    access.personnel._count.managedPersonnel > 0
  ) {
    return NextResponse.json(
      {
        error:
          "Reassign or remove this therapist's front desk team before deleting the account.",
      },
      { status: 409 },
    );
  }

  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === "P2003" || error.code === "P2014")
    ) {
      return NextResponse.json(
        {
          error:
            "This team member still has related records and cannot be deleted yet.",
        },
        { status: 409 },
      );
    }

    console.error("Error deleting personnel:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
