export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { UpcomingAppointmentsEmail } from "@/emails/upcoming-appointments";
import { isPublicSiteUnavailableError } from "@/services/company.service";
import { getServerLanguage } from "@/services/i18n.service";
import { getPublicCompanyProfile } from "@/services/public-profile.service";
import { getUpcomingBookingsByEmailForCompany } from "@/services/booking.service";
import { sendEmail } from "@/services/email.service";
import {
  isValidEmailInput,
  normalizeEmailInput,
} from "@/lib/validation/form-fields";

type RequestBody = {
  email?: string;
};

export async function POST(request: Request) {
  const language = await getServerLanguage();

  try {
    const body = (await request.json()) as RequestBody;
    const email = normalizeEmailInput(body.email);

    if (!email || !isValidEmailInput(email)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const company = await getPublicCompanyProfile();

    if (!company) {
      return NextResponse.json(
        { success: false, error: "Company not found." },
        { status: 404 },
      );
    }

    const appointments = await getUpcomingBookingsByEmailForCompany(email, company.id);
    const formattedAppointments = appointments.map((appointment) => ({
      bookingNumber: appointment.bookingNumber,
      bookingType: appointment.bookingType,
      bookingSchedule: appointment.bookingSchedule,
      bookingTimeZone: appointment.bookingTimeZone,
      locationTitle: appointment.location?.title,
      serviceDescription: appointment.service?.description,
      specialtyName: appointment.specialty?.name,
      therapistName:
        appointment.therapist?.firstname && appointment.therapist?.lastname
          ? `${appointment.therapist.firstname} ${appointment.therapist.lastname}`
          : appointment.therapist?.firstname || null,
      notes: appointment.bookingNotes,
    }));

    const subject =
      language === "es"
        ? `Resumen de tus proximas citas - ${company.name}`
        : `Your upcoming appointments - ${company.name}`;

    await sendEmail({
      context: "public.appointments_summary",
      to: email,
      subject,
      react: UpcomingAppointmentsEmail({
        companyName: company.name,
        email,
        companyDescription: company.publicDescription || company.publicSummary,
        companyEmail: company.publicEmail,
        companyPhone: company.publicPhone,
        companyWebsite: company.website,
        appointments: formattedAppointments,
        language,
      }),
      replyTo:
        company.publicEmail && isValidEmailInput(company.publicEmail)
          ? company.publicEmail
          : undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (isPublicSiteUnavailableError(error)) {
      return NextResponse.json(
        { success: false, error: "Public site unavailable" },
        { status: 503 },
      );
    }

    console.error("Error emailing upcoming appointments:", error);
    return NextResponse.json(
      { success: false, error: "Unable to send the appointments summary right now." },
      { status: 500 },
    );
  }
}
