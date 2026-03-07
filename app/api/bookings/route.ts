import {
  createBooking,
  getAllBookings,
  getBookingsByDate,
  getBookingsByDateRange,
  getBookingsByEmail,
  getBookingsByLocation,
  getBookingsByName,
  getBookingsByPatient,
  getBookingsByPhone,
  getBookingsByTherapist,
  getBookingsByTherapistAndDate,
  getBookingsByType,
  getPendingBookings,
  getRecentBookings,
  isAvailabilitySlotBookable,
  resolveManagedTherapistIdForUser,
} from "@/services";
import { NextRequest, NextResponse } from "next/server";
import {
  buildPatientInviteArtifacts,
  buildTherapistInviteArtifacts,
} from "@/services/calendar.service";
import { errorResponse, successResponse } from "@/services/api-errors.service";
import {
  sendPatientInviteEmail,
  sendTherapistInviteEmail,
} from "@/services/email.service";

import { BookingType } from "@/lib/prisma-client";
import { getCurrentUser } from "@/lib/auth/session";
import { canOperateAppointments } from "@/lib/auth/authorization";
import { getServerLanguage } from "@/services/i18n.service";
import { getTimeZoneOrDefault } from "@/services/config.service";
import { prisma } from "@/lib/prisma";
import {
  isValidEmailInput,
  isValidPhoneInput,
  normalizeEmailInput,
  normalizePhoneInput,
  normalizeWhitespace,
} from "@/lib/validation/form-fields";

function getBookingDurationMinutes(
  booking: { bookedDurationMinutes?: number | null; service?: { duration?: number | null } | null },
  fallbackServiceDuration?: number | null,
) {
  return (
    booking.bookedDurationMinutes ??
    booking.service?.duration ??
    fallbackServiceDuration ??
    60
  );
}

// GET /api/bookings - Obtener citas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope");
    const patientId = searchParams.get("patientId");
    const therapistId = searchParams.get("therapistId");
    const locationId = searchParams.get("locationId");
    const bookingType = searchParams.get("bookingType");
    const email = searchParams.get("email");
    const phone = searchParams.get("phone");
    const firstname = searchParams.get("firstname");
    const lastname = searchParams.get("lastname");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const date = searchParams.get("date");
    const recent = searchParams.get("recent");
    const pending = searchParams.get("pending");
    const limit = searchParams.get("limit");

    let bookings;

    if (scope === "self" || scope === "managed") {
      const { prismaUser } = await getCurrentUser();
      if (!prismaUser) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 },
        );
      }

      if (scope === "self") {
        bookings = await getBookingsByEmail(prismaUser.email);
        return NextResponse.json(successResponse(bookings));
      }

      if (!canOperateAppointments(prismaUser)) {
        return NextResponse.json(
          { success: false, error: "Forbidden" },
          { status: 403 },
        );
      }

      const managedTherapistId = await resolveManagedTherapistIdForUser(prismaUser);
      if (!managedTherapistId) {
        return NextResponse.json(
          { success: false, error: "No therapist is configured for this operator" },
          { status: 409 },
        );
      }

      bookings = await getBookingsByTherapist(managedTherapistId);
      return NextResponse.json(successResponse(bookings));
    }

    if (patientId) {
      bookings = await getBookingsByPatient(patientId);
    } else if (therapistId && date) {
      bookings = await getBookingsByTherapistAndDate(
        therapistId,
        new Date(date)
      );
    } else if (therapistId) {
      bookings = await getBookingsByTherapist(therapistId);
    } else if (locationId) {
      bookings = await getBookingsByLocation(locationId);
    } else if (bookingType) {
      bookings = await getBookingsByType(bookingType as BookingType);
    } else if (email) {
      bookings = await getBookingsByEmail(email);
    } else if (phone) {
      bookings = await getBookingsByPhone(phone);
    } else if (firstname && lastname) {
      bookings = await getBookingsByName(firstname, lastname);
    } else if (startDate && endDate) {
      bookings = await getBookingsByDateRange(
        new Date(startDate),
        new Date(endDate)
      );
    } else if (date) {
      bookings = await getBookingsByDate(new Date(date));
    } else if (recent === "true") {
      const limitNum = limit ? parseInt(limit) : 10;
      bookings = await getRecentBookings(limitNum);
    } else if (pending === "true") {
      bookings = await getPendingBookings();
    } else {
      bookings = await getAllBookings();
    }

    return NextResponse.json(successResponse(bookings));
  } catch (error) {
    console.error("Error getting bookings:", error);
    const { body, status } = errorResponse("internal_error", null, 500);
    return NextResponse.json(body, { status });
  }
}

// POST /api/bookings - Crear cita
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const language = await getServerLanguage();
    const normalizedFirstname = normalizeWhitespace(body.firstname);
    const normalizedLastname = normalizeWhitespace(body.lastname);
    const normalizedEmail = normalizeEmailInput(body.email);
    const normalizedPhone = normalizePhoneInput(body.phone);
    const parsedBookingSchedule = new Date(body.bookingSchedule);

    if (
      !body.bookingType ||
      !body.locationId ||
      !normalizedFirstname ||
      !normalizedLastname ||
      !normalizedPhone ||
      !normalizedEmail ||
      !body.bookingSchedule ||
      Number.isNaN(parsedBookingSchedule.getTime())
    ) {
      const { body: err, status } = errorResponse(
        "validation.required",
        language,
        400
      );
      return NextResponse.json(err, { status });
    }

    if (!isValidEmailInput(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    if (!isValidPhoneInput(normalizedPhone)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid phone number." },
        { status: 400 },
      );
    }

    body.firstname = normalizedFirstname;
    body.lastname = normalizedLastname;
    body.email = normalizedEmail;
    body.phone = normalizedPhone;
    body.bookingNotes =
      typeof body.bookingNotes === "string" ? body.bookingNotes.trim() || undefined : undefined;
    body.bookingSchedule = parsedBookingSchedule;

    if (body.therapistId) {
      const availability = await isAvailabilitySlotBookable({
        therapistId: body.therapistId,
        locationId: body.locationId,
        bookingSchedule: parsedBookingSchedule,
      });

      if (!availability.isAvailable) {
        const { body: err, status } = errorResponse(
          "conflict.slot_unavailable",
          language,
          409
        );
        return NextResponse.json(err, { status });
      }

      body.bookedDurationMinutes =
        availability.sessionDurationMinutes ?? body.bookedDurationMinutes;
      body.bookingSchedule = availability.bookingSchedule ?? parsedBookingSchedule;
    }

    const booking = await createBooking(body);
    // envío de invitación (terapeuta y paciente)
    try {
      const language = await getServerLanguage();
      const start = booking.bookingSchedule;
      const serviceId = (booking as { serviceId?: string }).serviceId;
      let fallbackServiceDuration = booking.service?.duration as
        | number
        | undefined;
      if (!fallbackServiceDuration && serviceId) {
        const svc = await prisma.service.findUnique({
          where: { id: serviceId },
          select: { duration: true },
        });
        fallbackServiceDuration = svc?.duration;
      }
      const durationMin = getBookingDurationMinutes(
        booking,
        fallbackServiceDuration,
      );
      const end = new Date(start.getTime() + durationMin * 60000);
      const locationAddress = booking.location?.address ?? "";
      const timeZone = getTimeZoneOrDefault(
        booking.location?.timezone || undefined
      );
      const patientName = `${booking.firstname} ${booking.lastname}`.trim();
      const therapistEmail = booking.therapist?.email;
      const therapistName =
        booking.therapist?.firstname && booking.therapist?.lastname
          ? `${booking.therapist.firstname} ${booking.therapist.lastname}`
          : booking.therapist?.firstname || "Terapeuta";

      const inviteTasks: Promise<unknown>[] = [];

      if (therapistEmail) {
        const { icsContent, reactProps, subject, icsFilename } =
          buildTherapistInviteArtifacts({
            patientName,
            patientEmail: booking.email,
            therapistName,
            locationAddress,
            bookingNumber: booking.bookingNumber,
            notes: booking.bookingNotes || undefined,
            start,
            end,
            language,
            bookingId: booking.id,
            attendeeEmail: therapistEmail,
            timeZone,
          });
        inviteTasks.push(
          sendTherapistInviteEmail({
            to: therapistEmail,
            subject,
            reactProps,
            icsContent,
            filename: icsFilename,
          }),
        );
      }

      if (booking.email) {
        const { icsContent, reactProps, subject, icsFilename } = buildPatientInviteArtifacts(
          {
            therapistName,
            patientName,
            patientEmail: booking.email,
            locationAddress,
            bookingNumber: booking.bookingNumber,
            notes: booking.bookingNotes || undefined,
            start,
            end,
            language,
            bookingId: booking.id,
            attendeeEmail: booking.email,
            timeZone,
          }
        );
        inviteTasks.push(
          sendPatientInviteEmail({
            to: booking.email,
            subject,
            reactProps,
            icsContent,
            filename: icsFilename,
          }),
        );
      }

      if (inviteTasks.length) {
        await Promise.allSettled(inviteTasks);
      }
    } catch (e) {
      console.error("Error sending invite email:", e);
    }
    return NextResponse.json(
      successResponse(booking, "bookings.create.success"),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating booking:", error);
    const { body, status } = errorResponse("internal_error", null, 500);
    return NextResponse.json(body, { status });
  }
}
