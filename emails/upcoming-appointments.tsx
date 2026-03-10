import * as React from "react";

import { EmailCard, EmailLayout } from "@/emails/components/email-layout";

type AppLanguage = "en" | "es";

interface AppointmentSummaryItem {
  bookingNumber: string;
  bookingType: string;
  bookingSchedule: Date | string;
  bookingTimeZone?: string | null;
  locationTitle?: string | null;
  serviceDescription?: string | null;
  specialtyName?: string | null;
  therapistName?: string | null;
  notes?: string | null;
}

interface UpcomingAppointmentsEmailProps {
  companyName: string;
  email: string;
  companyDescription?: string | null;
  companyEmail?: string | null;
  companyPhone?: string | null;
  companyWebsite?: string | null;
  appointments: AppointmentSummaryItem[];
  language?: AppLanguage;
}

function formatAppointmentDateTime(
  value: Date | string,
  language: AppLanguage,
  timeZone?: string | null,
) {
  const locale = language === "es" ? "es-MX" : "en-US";
  const date = value instanceof Date ? value : new Date(value);

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: timeZone || undefined,
  }).format(date);
}

function translateBookingType(type: string, language: AppLanguage) {
  const translations = {
    es: {
      DirectVisit: "Visita presencial",
      VideoCall: "Videollamada",
      PhoneCall: "Llamada telefonica",
      HomeVisit: "Visita a domicilio",
    },
    en: {
      DirectVisit: "In-person visit",
      VideoCall: "Video call",
      PhoneCall: "Phone call",
      HomeVisit: "Home visit",
    },
  } as const;

  return translations[language][type as keyof (typeof translations)[typeof language]] || type;
}

export function UpcomingAppointmentsEmail({
  companyName,
  email,
  companyDescription,
  companyEmail,
  companyPhone,
  companyWebsite,
  appointments,
  language = "en",
}: Readonly<UpcomingAppointmentsEmailProps>) {
  const isSpanish = language === "es";
  const t = {
    title: isSpanish ? "Resumen de tus proximas citas" : "Your upcoming appointments",
    intro: isSpanish
      ? "Te compartimos un resumen de las proximas sesiones asociadas a este correo."
      : "Here is a summary of the upcoming appointments associated with this email address.",
    noAppointments: isSpanish
      ? "No encontramos citas proximas para este correo en este momento."
      : "We could not find any upcoming appointments for this email right now.",
    requestedFor: isSpanish ? "Correo consultado" : "Requested for",
    bookingNumber: isSpanish ? "Codigo" : "Booking code",
    type: isSpanish ? "Tipo" : "Type",
    location: isSpanish ? "Ubicacion" : "Location",
    therapist: isSpanish ? "Terapeuta" : "Therapist",
    dateTime: isSpanish ? "Fecha y hora" : "Date and time",
    notes: isSpanish ? "Notas" : "Notes",
    clinicInfoTitle: isSpanish ? "Descripcion y contacto" : "Description and contact",
    clinicEmail: isSpanish ? "Correo" : "Email",
    clinicPhone: isSpanish ? "Telefono" : "Phone",
    clinicWebsite: isSpanish ? "Sitio web" : "Website",
    help: isSpanish
      ? "Si necesitas confirmar algo o hacer cambios, responde a este correo o comunicate con el consultorio."
      : "If you need to confirm anything or make changes, reply to this email or contact the practice directly.",
    footer: isSpanish
      ? "Este mensaje fue solicitado desde el sitio publico."
      : "This message was requested from the public website.",
  };

  return (
    <EmailLayout
      eyebrow={companyName}
      title={t.title}
      intro={t.intro}
      footer={t.footer}
    >
      <div>
        <div style={{ marginBottom: "20px" }}>
          <EmailCard>
            <p style={{ margin: 0, color: "#64748b", fontSize: "13px", fontWeight: 700 }}>
              {t.requestedFor}
            </p>
            <p style={{ margin: "8px 0 0 0", fontSize: "16px", fontWeight: 600 }}>{email}</p>
          </EmailCard>
        </div>

        {appointments.length ? (
          appointments.map((appointment, index) => (
            <div
              key={appointment.bookingNumber}
              style={{ marginTop: index === 0 ? 0 : "16px" }}
            >
              <EmailCard tone="accent">
                <div style={{ marginBottom: "14px" }}>
                  <p style={{ margin: 0, color: "#0f172a", fontSize: "18px", fontWeight: 700 }}>
                    {appointment.serviceDescription ||
                      appointment.specialtyName ||
                      translateBookingType(appointment.bookingType, language)}
                  </p>
                  <p style={{ margin: "6px 0 0 0", color: "#475569", fontSize: "14px" }}>
                    {t.dateTime}:{" "}
                    {formatAppointmentDateTime(
                      appointment.bookingSchedule,
                      language,
                      appointment.bookingTimeZone,
                    )}
                  </p>
                </div>

                <div>
                  <p style={{ margin: 0, fontSize: "14px", color: "#334155", lineHeight: 1.7 }}>
                    <strong>{t.bookingNumber}:</strong> {appointment.bookingNumber}
                  </p>
                  <p style={{ margin: 0, fontSize: "14px", color: "#334155", lineHeight: 1.7 }}>
                    <strong>{t.type}:</strong>{" "}
                    {translateBookingType(appointment.bookingType, language)}
                  </p>
                  {appointment.locationTitle ? (
                    <p
                      style={{ margin: 0, fontSize: "14px", color: "#334155", lineHeight: 1.7 }}
                    >
                      <strong>{t.location}:</strong> {appointment.locationTitle}
                    </p>
                  ) : null}
                  {appointment.therapistName ? (
                    <p
                      style={{ margin: 0, fontSize: "14px", color: "#334155", lineHeight: 1.7 }}
                    >
                      <strong>{t.therapist}:</strong> {appointment.therapistName}
                    </p>
                  ) : null}
                  {appointment.notes ? (
                    <p
                      style={{ margin: 0, fontSize: "14px", color: "#334155", lineHeight: 1.7 }}
                    >
                      <strong>{t.notes}:</strong> {appointment.notes}
                    </p>
                  ) : null}
                </div>
              </EmailCard>
            </div>
          ))
        ) : (
          <EmailCard tone="muted" dashed>
            <div
              style={{
                fontSize: "15px",
                lineHeight: 1.7,
                color: "#475569",
              }}
            >
              {t.noAppointments}
            </div>
          </EmailCard>
        )}

        <div style={{ marginTop: "20px" }}>
          <EmailCard>
            <h2 style={{ margin: "0 0 14px 0", fontSize: "18px", color: "#0f172a" }}>
              {t.clinicInfoTitle}
            </h2>
            {companyDescription ? (
              <p
                style={{
                  margin: "0 0 14px 0",
                  fontSize: "14px",
                  lineHeight: 1.7,
                  color: "#475569",
                }}
              >
                {companyDescription}
              </p>
            ) : null}
            <div>
              {companyEmail ? (
                <p style={{ margin: 0, fontSize: "14px", color: "#334155", lineHeight: 1.7 }}>
                  <strong>{t.clinicEmail}:</strong>{" "}
                  <a
                    href={`mailto:${companyEmail}`}
                    style={{ color: "#0b5cab", textDecoration: "none" }}
                  >
                    {companyEmail}
                  </a>
                </p>
              ) : null}
              {companyPhone ? (
                <p style={{ margin: 0, fontSize: "14px", color: "#334155", lineHeight: 1.7 }}>
                  <strong>{t.clinicPhone}:</strong> {companyPhone}
                </p>
              ) : null}
              {companyWebsite ? (
                <p style={{ margin: 0, fontSize: "14px", color: "#334155", lineHeight: 1.7 }}>
                  <strong>{t.clinicWebsite}:</strong>{" "}
                  <a
                    href={companyWebsite}
                    style={{ color: "#0b5cab", textDecoration: "none" }}
                  >
                    {companyWebsite}
                  </a>
                </p>
              ) : null}
            </div>

            <p
              style={{
                margin: "16px 0 0 0",
                fontSize: "14px",
                lineHeight: 1.7,
                color: "#475569",
              }}
            >
              {t.help}
            </p>
          </EmailCard>
        </div>
      </div>
    </EmailLayout>
  );
}
