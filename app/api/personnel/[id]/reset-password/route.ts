export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@/lib/prisma-client";
import { randomBytes } from "node:crypto";

import { PersonnelInviteEmail } from "@/emails/personnel-invite";
import { canManagePersonnel } from "@/lib/auth/authorization";
import { hasSupabaseAuth } from "@/lib/auth/config";
import { getCurrentUser, hashPassword } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient, hasSupabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/services/email.service";
import { resolveManagedTherapistIdForUser } from "@/services";

function generateTemporaryPassword() {
  return randomBytes(12)
    .toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 12);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { prismaUser } = await getCurrentUser();
    if (!prismaUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!canManagePersonnel(prismaUser)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const therapistId = await resolveManagedTherapistIdForUser(prismaUser);
    if (!therapistId) {
      return NextResponse.json(
        { error: "No therapist is configured for this account." },
        { status: 409 },
      );
    }

    const { id } = await params;
    const personnel = await prisma.user.findFirst({
      where: {
        id,
        managedByTherapistId: therapistId,
        role: { has: UserRole.FrontDesk },
      },
      select: {
        id: true,
        firstname: true,
        email: true,
        supabaseId: true,
      },
    });

    if (!personnel) {
      return NextResponse.json({ error: "Personnel record not found." }, { status: 404 });
    }

    const temporaryPassword = generateTemporaryPassword();
    if (hasSupabaseAuth) {
      if (!hasSupabaseAdmin()) {
        return NextResponse.json(
          {
            error:
              "SUPABASE_SERVICE_ROLE_KEY is required to reset personnel passwords when Supabase auth is enabled.",
          },
          { status: 409 },
        );
      }

      const adminClient = createSupabaseAdminClient();
      const { error: updateAuthError } = await adminClient.auth.admin.updateUserById(
        personnel.supabaseId,
        { password: temporaryPassword },
      );

      if (updateAuthError) {
        return NextResponse.json(
          { error: updateAuthError.message || "Unable to reset Supabase password." },
          { status: 500 },
        );
      }

      await prisma.user.update({
        where: { id: personnel.id },
        data: {
          mustChangePassword: true,
        },
      });
    } else {
      await prisma.user.update({
        where: { id: personnel.id },
        data: {
          passwordHash: hashPassword(temporaryPassword),
          mustChangePassword: true,
        },
      });
    }

    const therapistName =
      `${prismaUser.firstname} ${prismaUser.lastname}`.trim() || prismaUser.email;
    const loginUrl = new URL("/auth/login", request.url).toString();

    await sendEmail({
      to: personnel.email,
      subject: "Your AlphaBioHack temporary password",
      react: PersonnelInviteEmail({
        recipientName: personnel.firstname,
        therapistName,
        temporaryPassword,
        loginUrl,
        language: "en",
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error resetting personnel password:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
