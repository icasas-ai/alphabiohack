import * as React from "react";

import { EmailCard, EmailLayout } from "@/emails/components/email-layout";

interface ContactEmailProps {
  name: string;
  email: string;
  phone?: string;
  services?: string;
  message: string;
  language?: "en" | "es";
}

export function ContactEmail({
  name,
  email,
  phone,
  services,
  message,
  language = "es",
}: Readonly<ContactEmailProps>) {
  const isSpanish = language === "es";

  const translations = {
    es: {
      title: "Nueva Consulta de Contacto",
      intro: "Has recibido una nueva consulta enviada desde el formulario publico.",
      contactInfo: "Informacion de contacto",
      name: "Nombre",
      email: "Correo electronico",
      phone: "Telefono",
      services: "Servicios de interes",
      message: "Mensaje",
      responseTime: "Por favor, responde a esta consulta dentro de 24 horas.",
      footer: "Este mensaje fue enviado desde el formulario de contacto de MyAlphaPulse.",
      timestamp: "Enviado el",
    },
    en: {
      title: "New Contact Inquiry",
      intro: "You received a new inquiry from the public contact form.",
      contactInfo: "Contact information",
      name: "Name",
      email: "Email",
      phone: "Phone",
      services: "Services of interest",
      message: "Message",
      responseTime: "Please respond to this inquiry within 24 hours.",
      footer: "This message was sent from the MyAlphaPulse contact form.",
      timestamp: "Sent on",
    },
  };

  const t = translations[language];
  const currentDate = new Date().toLocaleDateString(isSpanish ? "es-MX" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <EmailLayout
      eyebrow="MyAlphaPulse"
      title={t.title}
      intro={t.intro}
      footer={t.footer}
    >
      <div>
        <div style={{ marginBottom: "20px" }}>
          <EmailCard>
            <h2 style={{ margin: "0 0 14px 0", fontSize: "18px", color: "#0f172a" }}>
              {t.contactInfo}
            </h2>
            <p style={{ margin: 0, fontSize: "14px", color: "#334155", lineHeight: 1.7 }}>
              <strong>{t.name}:</strong> {name}
            </p>
            <p style={{ margin: 0, fontSize: "14px", color: "#334155", lineHeight: 1.7 }}>
              <strong>{t.email}:</strong>{" "}
              <a href={`mailto:${email}`} style={{ color: "#0b5cab", textDecoration: "none" }}>
                {email}
              </a>
            </p>
            {phone ? (
              <p style={{ margin: 0, fontSize: "14px", color: "#334155", lineHeight: 1.7 }}>
                <strong>{t.phone}:</strong> {phone}
              </p>
            ) : null}
            {services ? (
              <p style={{ margin: 0, fontSize: "14px", color: "#334155", lineHeight: 1.7 }}>
                <strong>{t.services}:</strong> {services}
              </p>
            ) : null}
          </EmailCard>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <EmailCard tone="accent">
            <h2 style={{ margin: "0 0 14px 0", fontSize: "18px", color: "#0f172a" }}>
              {t.message}
            </h2>
            <p
              style={{
                margin: 0,
                color: "#334155",
                fontSize: "14px",
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
              }}
            >
              {message}
            </p>
          </EmailCard>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <EmailCard tone="warning">
            <p style={{ margin: 0, color: "#9a3412", fontSize: "14px", fontWeight: 600 }}>
              {t.responseTime}
            </p>
          </EmailCard>
        </div>

        <EmailCard>
          <p style={{ margin: 0, color: "#64748b", fontSize: "13px", fontWeight: 700 }}>
            {t.timestamp}
          </p>
          <p style={{ margin: "8px 0 0 0", fontSize: "14px", color: "#334155" }}>
            {currentDate}
          </p>
        </EmailCard>
      </div>
    </EmailLayout>
  );
}
