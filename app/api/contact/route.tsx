export const runtime = "nodejs";

import { errorResponse, successResponse } from "@/services/api-errors.service";

import { ContactEmail } from "@/emails/contact-email";
import { NextResponse } from "next/server";
import { PROFESSIONAL_INFO } from "@/constants";
import { getServerLanguage } from "@/services/i18n.service";
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

    // Configuración del email basada en el idioma
    const emailConfig = {
      es: {
        subject: "Nueva consulta de contacto - MyAlphaPulse",
        from: "MyAlphaPulse <noreply@myalphapulse.com>",
        to: [PROFESSIONAL_INFO.EMAIL], // Email de destino
      },
      en: {
        subject: "New Contact Inquiry - MyAlphaPulse",
        from: "MyAlphaPulse <noreply@myalphapulse.com>",
        to: [PROFESSIONAL_INFO.EMAIL], // Email de destino
      },
    } as const;

    const config = emailConfig[emailLanguage];

    // Enviar email usando servicio genérico
    const data = await sendEmail({
      from: config.from,
      to: config.to,
      subject: config.subject,
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
    console.error("Contact form error:", error);
    const { body, status } = errorResponse("internal_error", language, 500);
    return NextResponse.json(body, { status });
  }
}
