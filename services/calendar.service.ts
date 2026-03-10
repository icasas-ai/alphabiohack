import { buildGoogleCalendarUrl, buildICS } from "@/lib/utils/calendar-links";

import { AppointmentInviteEmail } from "@/emails/appointment-invite";

export interface TherapistInvitePayload {
  patientName: string;
  patientEmail: string;
  therapistName: string;
  locationAddress: string;
  bookingNumber: string;
  notes?: string;
  start: Date;
  end: Date;
  language: "es" | "en";
  bookingId: string;
  organizerEmail?: string;
  attendeeEmail: string;
  timeZone: string;
}

export function buildTherapistInviteArtifacts(payload: TherapistInvitePayload) {
  const {
    patientName,
    patientEmail,
    therapistName,
    locationAddress,
    bookingNumber,
    notes,
    start,
    end,
    language,
    bookingId,
    organizerEmail,
    attendeeEmail,
    timeZone,
  } = payload;
  const bookingNumberLine =
    language === "es" ?
      `Codigo de cita: ${bookingNumber}`
    : `Booking number: ${bookingNumber}`;
  const description = [bookingNumberLine, notes].filter(Boolean).join("\n\n");
  const title =
    language === "es" ?
      `Cita con ${patientName} (${bookingNumber})`
    : `Appointment with ${patientName} (${bookingNumber})`;

  // Google Calendar URL necesita HH:mm en la zona horaria correcta
  const startHHmm = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).format(start);
  const endHHmm = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).format(end);
  const googleCalendarUrl = buildGoogleCalendarUrl(
    {
      title,
      description,
      location: locationAddress,
      date: start,
      startTimeHHmm: startHHmm,
      endTimeHHmm: endHHmm,
    },
    timeZone
  );

  const icsContent = buildICS(
    {
      uid: `booking-${bookingId}@booking-saas`,
      organizerEmail:
        organizerEmail ||
        process.env.BOOKING_FROM_EMAIL ||
        "no-reply@booking-saas.com",
      attendeeEmail,
      title,
      description,
      location: locationAddress,
      date: start,
      startTimeHHmm: startHHmm,
      endTimeHHmm: endHHmm,
    },
    timeZone
  );

  const reactProps = AppointmentInviteEmail({
    patientName,
    patientEmail,
    therapistName,
    locationAddress,
    bookingNumber,
    notes,
    start,
    end,
    googleCalendarUrl,
    language,
    timeZone,
  });

  const subject =
    language === "es" ?
      `Nueva cita ${bookingNumber}: ${patientName}`
    : `New appointment ${bookingNumber}: ${patientName}`;
  const icsFilename = `appointment-${bookingNumber}.ics`;

  return { googleCalendarUrl, icsContent, reactProps, subject, icsFilename };
}

export interface PatientInvitePayload {
  therapistName: string;
  patientName: string;
  patientEmail: string;
  locationAddress: string;
  bookingNumber: string;
  notes?: string;
  start: Date;
  end: Date;
  language: "es" | "en";
  bookingId: string;
  organizerEmail?: string;
  attendeeEmail: string; // paciente
  timeZone: string;
}

export function buildPatientInviteArtifacts(payload: PatientInvitePayload) {
  const {
    therapistName,
    patientName,
    patientEmail,
    locationAddress,
    bookingNumber,
    notes,
    start,
    end,
    language,
    bookingId,
    organizerEmail,
    attendeeEmail,
    timeZone,
  } = payload;
  const bookingNumberLine =
    language === "es" ?
      `Codigo de cita: ${bookingNumber}`
    : `Booking number: ${bookingNumber}`;
  const description = [bookingNumberLine, notes].filter(Boolean).join("\n\n");
  const title =
    language === "es" ?
      `Tu cita con ${therapistName} (${bookingNumber})`
    : `Your appointment with ${therapistName} (${bookingNumber})`;

  const startHHmm = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).format(start);
  const endHHmm = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).format(end);

  const googleCalendarUrl = buildGoogleCalendarUrl(
    {
      title,
      description,
      location: locationAddress,
      date: start,
      startTimeHHmm: startHHmm,
      endTimeHHmm: endHHmm,
    },
    timeZone
  );

  const icsContent = buildICS(
    {
      uid: `booking-${bookingId}@booking-saas`,
      organizerEmail:
        organizerEmail ||
        process.env.BOOKING_FROM_EMAIL ||
        "no-reply@booking-saas.com",
      attendeeEmail,
      title,
      description,
      location: locationAddress,
      date: start,
      startTimeHHmm: startHHmm,
      endTimeHHmm: endHHmm,
    },
    timeZone
  );

  const reactProps = AppointmentInviteEmail({
    patientName,
    patientEmail,
    therapistName,
    locationAddress,
    bookingNumber,
    notes,
    start,
    end,
    googleCalendarUrl,
    language,
    timeZone,
  });

  const subject =
    language === "es" ?
      `Confirmacion de cita ${bookingNumber}: ${therapistName}`
    : `Appointment confirmation ${bookingNumber}: ${therapistName}`;
  const icsFilename = `appointment-${bookingNumber}.ics`;

  return { googleCalendarUrl, icsContent, reactProps, subject, icsFilename };
}
