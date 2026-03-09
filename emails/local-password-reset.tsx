import * as React from "react";

import { EmailButton, EmailCard, EmailLayout } from "@/emails/components/email-layout";

interface LocalPasswordResetEmailProps {
  recipientName: string;
  temporaryPassword: string;
  loginUrl: string;
  language?: "en" | "es";
}

export function LocalPasswordResetEmail({
  recipientName,
  temporaryPassword,
  loginUrl,
  language = "en",
}: Readonly<LocalPasswordResetEmailProps>) {
  const isSpanish = language === "es";

  const copy = {
    title: isSpanish ? "Restablecimiento de acceso local" : "Local access reset",
    intro: isSpanish
      ? "Se generó una contraseña temporal para tu cuenta local."
      : "A temporary password was generated for your local account.",
    greeting: isSpanish ? "Hola" : "Hello",
    tempPassword: isSpanish ? "Contraseña temporal" : "Temporary password",
    note: isSpanish
      ? "Usa esta contraseña para iniciar sesión y luego actualízala de inmediato."
      : "Use this password to sign in, then update it immediately.",
    action: isSpanish ? "Iniciar sesión" : "Sign in",
    footer: isSpanish
      ? "Si no solicitaste este cambio, puedes ignorar este correo."
      : "If you did not request this change, you can ignore this email.",
  };

  return (
    <EmailLayout
      eyebrow="AlphaBioHack"
      title={copy.title}
      intro={copy.intro}
      footer={copy.footer}
    >
      <div>
        <p style={{ margin: "0 0 20px 0", color: "#334155", fontSize: "15px", lineHeight: 1.7 }}>
          {copy.greeting} {recipientName},
        </p>

        <div style={{ marginBottom: "20px" }}>
          <EmailCard tone="accent">
            <p style={{ margin: "0 0 8px 0", color: "#1e3a8a", fontSize: "13px", fontWeight: 700 }}>
              {copy.tempPassword}
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
              {copy.note}
            </p>
          </EmailCard>
        </div>

        <EmailButton href={loginUrl}>{copy.action}</EmailButton>
      </div>
    </EmailLayout>
  );
}
