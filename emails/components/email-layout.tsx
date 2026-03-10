import * as React from "react";

interface EmailLayoutProps {
  eyebrow?: string;
  title: string;
  intro?: string;
  footer: string;
  children: React.ReactNode;
}

interface EmailCardProps {
  children: React.ReactNode;
  tone?: "default" | "accent" | "muted" | "warning";
  dashed?: boolean;
}

interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
}

const surfaceStyles = {
  page: {
    fontFamily: "Arial, sans-serif",
    maxWidth: "680px",
    margin: "0 auto",
    backgroundColor: "#f8fafc",
    color: "#0f172a",
  } satisfies React.CSSProperties,
  header: {
    background:
      "linear-gradient(135deg, rgba(8,28,49,0.96) 0%, rgba(17,114,184,0.86) 100%)",
    padding: "32px 28px",
    borderTopLeftRadius: "16px",
    borderTopRightRadius: "16px",
  } satisfies React.CSSProperties,
  eyebrow: {
    margin: "0 0 10px 0",
    color: "rgba(255,255,255,0.78)",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  } satisfies React.CSSProperties,
  title: {
    margin: 0,
    color: "#ffffff",
    fontSize: "28px",
    lineHeight: 1.2,
  } satisfies React.CSSProperties,
  intro: {
    margin: "14px 0 0 0",
    color: "rgba(255,255,255,0.82)",
    fontSize: "15px",
    lineHeight: 1.7,
  } satisfies React.CSSProperties,
  content: {
    padding: "28px",
  } satisfies React.CSSProperties,
  footer: {
    padding: "0 28px 28px 28px",
    color: "#64748b",
    fontSize: "12px",
    lineHeight: 1.6,
  } satisfies React.CSSProperties,
};

export function EmailLayout({
  eyebrow,
  title,
  intro,
  footer,
  children,
}: Readonly<EmailLayoutProps>) {
  return (
    <div style={surfaceStyles.page}>
      <div style={surfaceStyles.header}>
        {eyebrow ? <p style={surfaceStyles.eyebrow}>{eyebrow}</p> : null}
        <h1 style={surfaceStyles.title}>{title}</h1>
        {intro ? <p style={surfaceStyles.intro}>{intro}</p> : null}
      </div>

      <div style={surfaceStyles.content}>{children}</div>

      <div style={surfaceStyles.footer}>{footer}</div>
    </div>
  );
}

export function EmailCard({
  children,
  tone = "default",
  dashed = false,
}: Readonly<EmailCardProps>) {
  const themes = {
    default: {
      backgroundColor: "#ffffff",
      borderColor: "#e2e8f0",
    },
    accent: {
      backgroundColor: "#eff6ff",
      borderColor: "#dbeafe",
    },
    muted: {
      backgroundColor: "#ffffff",
      borderColor: "#cbd5e1",
    },
    warning: {
      backgroundColor: "#fff7ed",
      borderColor: "#fdba74",
    },
  } as const;

  const theme = themes[tone];

  return (
    <div
      style={{
        backgroundColor: theme.backgroundColor,
        border: `1px ${dashed ? "dashed" : "solid"} ${theme.borderColor}`,
        borderRadius: "16px",
        padding: "22px 20px",
      }}
    >
      {children}
    </div>
  );
}

export function EmailButton({ href, children }: Readonly<EmailButtonProps>) {
  return (
    <a
      href={href}
      style={{
        display: "inline-block",
        background: "#0b5cab",
        color: "#ffffff",
        padding: "12px 18px",
        borderRadius: "999px",
        textDecoration: "none",
        fontSize: "14px",
        fontWeight: 700,
      }}
    >
      {children}
    </a>
  );
}
