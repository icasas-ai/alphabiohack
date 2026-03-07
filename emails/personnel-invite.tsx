import * as React from "react";

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
}: PersonnelInviteEmailProps) {
  const isSpanish = language === "es";

  const t = {
    title: isSpanish ? "Acceso del personal" : "Staff access",
    greeting: isSpanish ? "Hola" : "Hello",
    intro: isSpanish
      ? `${therapistName} te agregó como miembro del personal para gestionar citas.`
      : `${therapistName} added you as a staff member to manage appointments.`,
    tempPassword: isSpanish ? "Contraseña temporal" : "Temporary password",
    action: isSpanish ? "Iniciar sesión" : "Sign in",
    note: isSpanish
      ? "Usa esta contraseña temporal para entrar y luego actualízala de inmediato."
      : "Use this temporary password to sign in, then update it immediately.",
    footer: isSpanish
      ? "Si no esperabas este acceso, ignora este correo."
      : "If you were not expecting this access, you can ignore this email.",
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto", backgroundColor: "#ffffff" }}>
      <div style={{ backgroundColor: "#1e40af", padding: "24px 20px", borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
        <h1 style={{ color: "#ffffff", margin: 0, fontSize: 20 }}>{t.title}</h1>
      </div>
      <div style={{ padding: "24px 20px" }}>
        <p style={{ margin: "0 0 12px 0", color: "#374151" }}>{t.greeting} {recipientName},</p>
        <p style={{ margin: "0 0 18px 0", color: "#374151" }}>{t.intro}</p>
        <div style={{ border: "1px solid #dbeafe", backgroundColor: "#eff6ff", borderRadius: 8, padding: 16 }}>
          <p style={{ margin: "0 0 8px 0", color: "#1e3a8a", fontWeight: 700 }}>{t.tempPassword}</p>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: "0.08em", color: "#111827" }}>
            {temporaryPassword}
          </p>
        </div>
        <p style={{ margin: "18px 0", color: "#374151" }}>{t.note}</p>
        <a
          href={loginUrl}
          style={{
            display: "inline-block",
            backgroundColor: "#1e40af",
            color: "#ffffff",
            padding: "12px 16px",
            borderRadius: 6,
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          {t.action}
        </a>
      </div>
      <div style={{ backgroundColor: "#f8fafc", padding: 16, textAlign: "center", borderBottomLeftRadius: 8, borderBottomRightRadius: 8, borderTop: "1px solid #e2e8f0" }}>
        <p style={{ color: "#6b7280", fontSize: 12, margin: 0 }}>{t.footer}</p>
      </div>
    </div>
  );
}
