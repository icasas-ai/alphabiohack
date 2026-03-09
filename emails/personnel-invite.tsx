import * as React from "react";

import { EmailButton, EmailCard, EmailLayout } from "@/emails/components/email-layout";

interface PersonnelInviteEmailProps {
  recipientName: string;
  therapistName: string;
  temporaryPassword: string;
  loginUrl: string;
  language?: "en" | "es";
}

export function PersonnelInviteEmail({
  recipientName,
  therapistName,
  temporaryPassword,
  loginUrl,
  language = "en",
}: Readonly<PersonnelInviteEmailProps>) {
  const isSpanish = language === "es";

  const t = {
    title: isSpanish ? "Acceso del personal" : "Staff access",
    intro: isSpanish
      ? `${therapistName} te agregó como miembro del personal para gestionar citas.`
      : `${therapistName} added you as a staff member to manage appointments.`,
    greeting: isSpanish ? "Hola" : "Hello",
    tempPassword: isSpanish ? "Contraseña temporal" : "Temporary password",
    note: isSpanish
      ? "Usa esta contraseña temporal para entrar y luego actualízala de inmediato."
      : "Use this temporary password to sign in, then update it immediately.",
    action: isSpanish ? "Iniciar sesión" : "Sign in",
    footer: isSpanish
      ? "Si no esperabas este acceso, puedes ignorar este correo."
      : "If you were not expecting this access, you can ignore this email.",
  };

  return (
    <EmailLayout
      eyebrow="AlphaBioHack"
      title={t.title}
      intro={t.intro}
      footer={t.footer}
    >
      <div>
        <p style={{ margin: "0 0 20px 0", color: "#334155", fontSize: "15px", lineHeight: 1.7 }}>
          {t.greeting} {recipientName},
        </p>

        <div style={{ marginBottom: "20px" }}>
          <EmailCard tone="accent">
            <p style={{ margin: "0 0 8px 0", color: "#1e3a8a", fontSize: "13px", fontWeight: 700 }}>
              {t.tempPassword}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "22px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "#111827",
              }}
            >
              {temporaryPassword}
            </p>
          </EmailCard>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <EmailCard>
            <p style={{ margin: 0, color: "#475569", fontSize: "14px", lineHeight: 1.7 }}>
              {t.note}
            </p>
          </EmailCard>
        </div>

        <EmailButton href={loginUrl}>{t.action}</EmailButton>
      </div>
    </EmailLayout>
  );
}
