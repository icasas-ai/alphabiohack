import { resolveTimeZone } from "@/lib/utils/timezone";

export interface EmailConfig {
  from: string;
  bcc?: string | string[];
  replyTo?: string;
}

export type EmailProvider = "resend" | "smtp";

export function getDefaultEmailConfig(): EmailConfig {
  return {
    from:
      process.env.BOOKING_FROM_EMAIL ||
      "MyAlphaPulse <noreply@myalphapulse.com>",
    bcc: process.env.BOOKING_EMAIL_BCC,
    replyTo: process.env.BOOKING_REPLY_TO,
  };
}

export function getEmailProvider(): EmailProvider {
  return process.env.EMAIL_PROVIDER === "smtp" ? "smtp" : "resend";
}

export function getSmtpConfig() {
  return {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  };
}

export function getTimeZoneOrDefault(locationTz?: string): string {
  return resolveTimeZone(locationTz);
}
