import {
  BookingFormData,
  checkTimeSlotAvailability,
  createBooking,
  createBookingFromForm,
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
import { combineDateAndTimeToUtc, parseDateStringInTimeZone } from "@/lib/utils/timezone";
import { prisma } from "@/lib/prisma";

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

    // Detectar si viene del formulario del wizard
    const isFromWizard =
      body.appointmentType &&
      body.selectedDate &&
      body.selectedTime &&
      body.basicInfo;

    if (isFromWizard) {
      // Usar la función específica para el wizard con tipo seguro
      const booking = await createBookingFromForm(body as BookingFormData);
      // enviar invitaciones (terapeuta y paciente)
      try {
        const language = await getServerLanguage();
        const start = booking.bookingSchedule;
        const serviceId = (booking as { serviceId?: string }).serviceId;
        // Determinar duración del servicio de forma robusta
        let durationMin = booking.service?.duration as number | undefined;
        if (!durationMin && serviceId) {
          const svc = await prisma.service.findUnique({
            where: { id: serviceId },
            select: { duration: true },
          });
          durationMin = svc?.duration;
        }
        // Fallback adicional: intentar leer del body del wizard
        if (
          !durationMin &&
          Array.isArray(
            (body as unknown as { selectedServiceIds?: string[] })
              ?.selectedServiceIds
          ) &&
          (body as unknown as { selectedServiceIds?: string[] })
            .selectedServiceIds?.[0]
        ) {
          const svc = await prisma.service.findUnique({
            where: {
              id: (body as unknown as { selectedServiceIds: string[] })
                .selectedServiceIds[0],
            },
            select: { duration: true },
          });
          durationMin = svc?.duration;
        }
        durationMin = durationMin ?? 60;
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
            : booking.therapist?.firstname || "Profesional";

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
          const { icsContent, reactProps, subject } =
            buildPatientInviteArtifacts({
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
            });
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
    }

    // Validaciones básicas para datos directos (flujo no-wizard)
    const language = await getServerLanguage();
    
    // Detectar si es flujo alterno (con selectedDate/selectedTime)
    const isAlternateFlow = body.selectedDate && body.selectedTime;
    
    if (isAlternateFlow) {
      // Convertir selectedDate + selectedTime a bookingSchedule usando zona horaria de la ubicación
      try {
        const location = await prisma.location.findUnique({
          where: { id: body.locationId },
          select: { timezone: true },
        });
        const tz = location?.timezone ?? "America/Los_Angeles";
        
        // Parsear selectedDate como fecha local en la zona horaria correcta
        const selectedDate = parseDateStringInTimeZone(body.selectedDate, tz);
        const bookingSchedule = combineDateAndTimeToUtc(selectedDate, body.selectedTime, tz);
        body.bookingSchedule = bookingSchedule;
      } catch (error) {
        console.error("Error processing date/time:", error);
        const { body: err, status } = errorResponse("internal_error", language, 500);
        return NextResponse.json(err, { status });
      }
    }
    
    if (
      !body.bookingType ||
      !body.locationId ||
      !body.firstname ||
      !body.lastname ||
      !body.phone ||
      !body.email ||
      !body.bookingSchedule
    ) {
      const { body: err, status } = errorResponse(
        "validation.required",
        language,
        400
      );
      return NextResponse.json(err, { status });
    }

    // Verificar disponibilidad del terapeuta si se proporciona
    if (body.therapistId) {
      // Parsear fecha: si viene sin offset, asumir PST (-08:00). Si ya trae Z u offset, usar tal cual.
      let bookingSchedulePST = new Date(body.bookingSchedule);
      if (isNaN(bookingSchedulePST.getTime())) {
        const hasOffset = /[Zz]|[+-]\d{2}:\d{2}$/.test(body.bookingSchedule);
        bookingSchedulePST = new Date(
          body.bookingSchedule + (hasOffset ? "" : "-08:00")
        );
      }

      const availability = await checkTimeSlotAvailability(
        body.therapistId,
        bookingSchedulePST
      );

      if (!availability.isAvailable) {
        const { body: err, status } = errorResponse(
          "conflict.slot_unavailable",
          language,
          409
        );
        return NextResponse.json(err, { status });
      }
    }

    const booking = await createBooking(body);
    // envío de invitación (terapeuta y paciente)
    try {
      const language = await getServerLanguage();
      const start = booking.bookingSchedule;
      const serviceId = (booking as { serviceId?: string }).serviceId;
      // Determinar duración de forma robusta
      let durationMin = booking.service?.duration as number | undefined;
      if (!durationMin && serviceId) {
        const svc = await prisma.service.findUnique({
          where: { id: serviceId },
          select: { duration: true },
        });
        durationMin = svc?.duration;
      }
      durationMin = durationMin ?? 60;
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
