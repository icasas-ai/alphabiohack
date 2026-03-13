export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";

import { LocalPasswordResetEmail } from "@/emails/local-password-reset";
import { hashPassword } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  isValidEmailInput,
  normalizeEmailInput,
} from "@/lib/validation/form-fields";
import { sendEmail } from "@/services/email.service";

function generateTemporaryPassword() {
  return randomBytes(12)
    .toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 12);
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    const normalizedEmail = normalizeEmailInput(email);

    if (!normalizedEmail) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 },
      );
    }

    if (!isValidEmailInput(normalizedEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        firstname: true,
        passwordHash: true,
        mustChangePassword: true,
      },
    });

    if (!user) {
      return NextResponse.json({ supported: true }, { status: 200 });
    }

    const temporaryPassword = generateTemporaryPassword();
    const nextPasswordHash = hashPassword(temporaryPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: nextPasswordHash,
        mustChangePassword: true,
      },
    });

    try {
      const loginUrl = new URL("/auth/login", request.url).toString();
      const preferredLocale =
        request.headers.get("accept-language")?.toLowerCase() ?? "en";
      const language = preferredLocale.startsWith("es") ? "es" : "en";

      await sendEmail({
        context: "auth.forgot_password",
        to: user.email,
        subject:
          language === "es"
            ? "Tu contrasena temporal de MyAlphaPulse"
            : "Your MyAlphaPulse temporary password",
        react: LocalPasswordResetEmail({
          recipientName: user.firstname || user.email,
          temporaryPassword,
          loginUrl,
          language,
        }),
      });
    } catch (emailError) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: user.passwordHash,
          mustChangePassword: user.mustChangePassword,
        },
      });

      throw emailError;
    }

    return NextResponse.json({ supported: true }, { status: 200 });
  } catch (error) {
    console.error("App-managed forgot password failed:", error);
    return NextResponse.json(
      { error: "Unable to send the password reset email" },
      { status: 500 },
    );
  }
}
