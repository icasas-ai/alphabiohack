export const runtime = "nodejs";

import { errorResponse, successResponse } from "@/services/api-errors.service";

import { ContactEmail } from "@/emails/contact-email";
import { NextResponse } from "next/server";
import { isPublicSiteUnavailableError } from "@/services/company.service";
import { getDefaultEmailConfig } from "@/services/config.service";
import { getServerLanguage } from "@/services/i18n.service";
import { getPublicCompanyProfile } from "@/services/public-profile.service";
import {
  isValidEmailInput,
  isValidPhoneInput,
  normalizeEmailInput,
  normalizePhoneInput,
  normalizeWhitespace,
} from "@/lib/validation/form-fields";
import { sendEmail } from "@/services/email.service";

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  services?: string;
  message: string;
}

function extractEmailAddress(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  const match = trimmed.match(/<([^>]+)>/);
  const candidate = match?.[1] ?? trimmed;
  return isValidEmailInput(candidate) ? candidate : undefined;
}

export async function POST(request: Request) {
  const language = await getServerLanguage();

  try {
    const body: ContactFormData = await request.json();
    const name = normalizeWhitespace(body.name);
    const email = normalizeEmailInput(body.email);
    const phone = normalizePhoneInput(body.phone);
    const services = normalizeWhitespace(body.services);
    const message = typeof body.message === "string" ? body.message.trim() : "";

    // Validaciones básicas
    if (!name || !email || !message) {
      const { body, status } = errorResponse(
        "validation.required",
        language,
        400
      );
      return NextResponse.json(body, { status });
    }

    // Validar formato de email
    if (!isValidEmailInput(email)) {
      const { body, status } = errorResponse(
        "validation.invalidEmail",
        language,
        400
      );
      return NextResponse.json(body, { status });
    }

    if (phone && !isValidPhoneInput(phone)) {
      const { body, status } = errorResponse(
        "validation.invalidPhone",
        language,
        400
      );
      return NextResponse.json(body, { status });
    }

    // Determinar el idioma del email
    const emailLanguage = language;
    const company = await getPublicCompanyProfile();
    const emailDefaults = getDefaultEmailConfig();
    const destinationEmail =
      extractEmailAddress(company?.publicEmail || undefined) ||
      extractEmailAddress(emailDefaults.replyTo) ||
      extractEmailAddress(emailDefaults.from);

    if (!destinationEmail) {
      throw new Error(
        "Contact email destination is not configured. Set company publicEmail, BOOKING_REPLY_TO, or BOOKING_FROM_EMAIL.",
      );
    }

    const companyName = company?.name || "AlphaBioHack";
    const subject =
      emailLanguage === "es"
        ? `Nueva consulta de contacto - ${companyName}`
        : `New contact inquiry - ${companyName}`;

    // Enviar email usando servicio genérico
    const data = await sendEmail({
      to: [destinationEmail],
      subject,
      replyTo: email,
      react: ContactEmail({
        name,
        email,
        phone,
        services,
        message,
        language: emailLanguage,
      }),
    });

    return NextResponse.json(successResponse(data, "contact.submit.success"));
  } catch (error) {
    if (isPublicSiteUnavailableError(error)) {
      return NextResponse.json(
        { error: "Public site unavailable" },
        { status: 503 },
      );
    }

    console.error("Contact form error:", error);
    const { body, status } = errorResponse("internal_error", language, 500);
    return NextResponse.json(body, { status });
  }
}
