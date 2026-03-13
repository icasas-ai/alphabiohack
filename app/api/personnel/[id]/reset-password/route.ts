export const runtime = "nodejs";

import { randomBytes } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { PersonnelInviteEmail } from "@/emails/personnel-invite";
import {
  buildPersonnelWhere,
  getManagerDisplayName,
  getPersonnelManagementContext,
} from "@/lib/personnel-management";
import { hashPassword } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/services/email.service";

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
    const context = await getPersonnelManagementContext();
    if (!context.companyId || !context.prismaUser) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const { id } = await params;
    const personnel = await prisma.user.findFirst({
      where: buildPersonnelWhere(context, id),
      select: {
        id: true,
        firstname: true,
        email: true,
      },
    });

    if (!personnel) {
      return NextResponse.json({ error: "Team member not found." }, { status: 404 });
    }

    const temporaryPassword = generateTemporaryPassword();
    await prisma.user.update({
      where: { id: personnel.id },
      data: {
        passwordHash: hashPassword(temporaryPassword),
        mustChangePassword: true,
      },
    });

    const loginUrl = new URL("/auth/login", request.url).toString();

    await sendEmail({
      context: "personnel.reset_password",
      to: personnel.email,
      subject: "Your MyAlphaPulse temporary password",
      react: PersonnelInviteEmail({
        recipientName: personnel.firstname,
        managerName: getManagerDisplayName(context.prismaUser),
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
