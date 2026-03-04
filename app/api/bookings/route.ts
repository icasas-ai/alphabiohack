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

import { BookingType } from "@prisma/client";
import { getServerLanguage } from "@/services/i18n.service";
import { getTimeZoneOrDefault } from "@/services/config.service";
import { prisma } from "@/lib/prisma";
import { formatBookingToLocalStrings } from "@/lib/utils/timezone";

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
    const parsedBookingSchedule = new Date(body.bookingSchedule);

    if (
      !body.bookingType ||
      !body.locationId ||
      !body.firstname ||
      !body.lastname ||
      !body.phone ||
      !body.email ||
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

    body.bookingSchedule = parsedBookingSchedule;

    if (body.therapistId) {
      const location = await prisma.location.findUnique({
        where: { id: body.locationId },
        select: { timezone: true },
      });
      const { dateString, timeString } = formatBookingToLocalStrings(
        parsedBookingSchedule,
        location?.timezone || "America/Los_Angeles",
      );
      const availability = await isAvailabilitySlotBookable({
        therapistId: body.therapistId,
        locationId: body.locationId,
        date: dateString,
        time: timeString,
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

      if (therapistEmail) {
        const { icsContent, reactProps, subject } =
          buildTherapistInviteArtifacts({
            patientName,
            patientEmail: booking.email,
            therapistName,
            locationAddress,
            notes: booking.bookingNotes || undefined,
            start,
            end,
            language,
            bookingId: booking.id,
            attendeeEmail: therapistEmail,
            timeZone,
          });
        await sendTherapistInviteEmail({
          to: therapistEmail,
          subject,
          reactProps,
          icsContent,
        });
      }

      if (booking.email) {
        const { icsContent, reactProps, subject } = buildPatientInviteArtifacts(
          {
            therapistName,
            patientName,
            patientEmail: booking.email,
            locationAddress,
            notes: booking.bookingNotes || undefined,
            start,
            end,
            language,
            bookingId: booking.id,
            attendeeEmail: booking.email,
            timeZone,
          }
        );
        await sendPatientInviteEmail({
          to: booking.email,
          subject,
          reactProps,
          icsContent,
        });
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
