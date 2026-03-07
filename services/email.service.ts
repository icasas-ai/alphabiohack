import { render } from "@react-email/render";

import { getResend } from "@/lib/resend";
import {
  getDefaultEmailConfig,
  getEmailProvider,
  getSmtpConfig,
} from "@/services/config.service";

export interface SendEmailArgs {
  from?: string;
  to: string | string[] | ReadonlyArray<string>;
  subject: string;
  react: React.ReactElement;
  attachments?: Array<{ filename: string; content: string; mimeType?: string }>;
  bcc?: string | string[] | ReadonlyArray<string>;
  replyTo?: string;
}

function normalizeList(
  v: string | string[] | ReadonlyArray<string> | undefined,
): string | string[] | undefined {
  if (v === undefined) return undefined;
  if (typeof v === "string") return v;
  return Array.from(v);
}

export async function sendEmail({
  from,
  to,
  subject,
  react,
  attachments,
  bcc,
  replyTo,
}: SendEmailArgs) {
  const defaults = getDefaultEmailConfig();
  const normalizedTo = normalizeList(to)!;
  const normalizedBcc = normalizeList(bcc);
  const resolvedFrom = from || defaults.from;
  const resolvedReplyTo = replyTo || defaults.replyTo;

  if (getEmailProvider() === "smtp") {
    const { host, port, secure, user, pass } = getSmtpConfig();

    if (!host || !port) {
      throw new Error("SMTP_HOST and SMTP_PORT are required when EMAIL_PROVIDER=smtp");
    }

    const nodemailer = await import("nodemailer");
    const transport = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
    });
    const html = await render(react);

    return transport.sendMail({
      from: resolvedFrom,
      to: normalizedTo,
      bcc: normalizedBcc ?? normalizeList(defaults.bcc),
      replyTo: resolvedReplyTo,
      subject,
      html,
      attachments: attachments?.map(({ filename, content, mimeType }) => ({
        filename,
        content,
        contentType: mimeType,
      })),
    });
  }

  const resend = getResend();
  return resend.emails.send({
    from: resolvedFrom,
    to: normalizedTo,
    bcc: normalizedBcc ?? normalizeList(defaults.bcc),
    replyTo: resolvedReplyTo,
    subject,
    react,
    attachments,
  });
}

interface SendTherapistInviteArgs {
  to: string | string[];
  subject: string;
  reactProps: React.ReactElement;
  icsContent: string;
  filename?: string;
}

export async function sendTherapistInviteEmail({
  to,
  subject,
  reactProps,
  icsContent,
  filename,
}: SendTherapistInviteArgs) {
  return sendEmail({
    to,
    subject,
    react: reactProps,
    attachments: [{ filename: filename || "appointment.ics", content: icsContent }],
  });
}

interface SendPatientInviteArgs {
  to: string | string[];
  subject: string;
  reactProps: React.ReactElement;
  icsContent: string;
  filename?: string;
}

export async function sendPatientInviteEmail({
  to,
  subject,
  reactProps,
  icsContent,
  filename,
}: SendPatientInviteArgs) {
  return sendEmail({
    to,
    subject,
    react: reactProps,
    attachments: [{ filename: filename || "appointment.ics", content: icsContent }],
  });
}
