import { buildGoogleCalendarUrl, buildICS } from "@/lib/utils/calendar-links";

import { AppointmentInviteEmail } from "@/emails/appointment-invite";
import { PST_TZ } from "@/lib/utils/timezone";

export interface TherapistInvitePayload {
  patientName: string;
  patientEmail: string;
  therapistName: string;
  locationAddress: string;
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
    notes,
    start,
    end,
    language,
    bookingId,
    organizerEmail,
    attendeeEmail,
    timeZone,
  } = payload;

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
      title: `Cita con ${patientName}`,
      description: notes || "",
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
      title: `Cita con ${patientName}`,
      description: notes || "",
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
    notes,
    start,
    end,
    googleCalendarUrl,
    language,
    timeZone,
  });

  const subject = `Nueva cita: ${patientName}`;

  return { googleCalendarUrl, icsContent, reactProps, subject };
}

export interface PatientInvitePayload {
  therapistName: string;
  patientName: string;
  patientEmail: string;
  locationAddress: string;
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
    notes,
    start,
    end,
    language,
    bookingId,
    organizerEmail,
    attendeeEmail,
    timeZone,
  } = payload;

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
      title:
        language === "es" ?
          `Tu cita con ${therapistName}`
        : `Your appointment with ${therapistName}`,
      description: notes || "",
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
      title:
        language === "es" ?
          `Tu cita con ${therapistName}`
        : `Your appointment with ${therapistName}`,
      description: notes || "",
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
    notes,
    start,
    end,
    googleCalendarUrl,
    language,
    timeZone,
  });

  const subject =
    language === "es" ?
      `Confirmación de cita: ${therapistName}`
    : `Appointment confirmation: ${therapistName}`;

  return { googleCalendarUrl, icsContent, reactProps, subject };
}
