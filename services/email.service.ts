import { render } from "@react-email/render";

import { getResend } from "@/lib/resend";
import {
  getDefaultEmailConfig,
  getEmailProvider,
  getSmtpConfig,
} from "@/services/config.service";

export interface SendEmailArgs {
  context?: string;
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

function normalizeRecipients(
  v: string | string[] | ReadonlyArray<string> | undefined,
): string[] {
  if (!v) return [];
  if (typeof v === "string") return [v];
  return Array.from(v);
}

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return error;
}

export async function sendEmail({
  context,
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
  const provider = getEmailProvider();
  const logBase = {
    context: context || "email.send",
    provider,
    from: resolvedFrom,
    to: normalizeRecipients(normalizedTo),
    bccCount: normalizeRecipients(normalizedBcc ?? defaults.bcc).length,
    replyTo: resolvedReplyTo,
    subject,
    attachmentCount: attachments?.length ?? 0,
  };

  console.info("[email] send:start", logBase);

  try {
    if (provider === "smtp") {
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
      const result = await transport.sendMail({
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

      console.info("[email] send:success", {
        ...logBase,
        messageId: result.messageId,
        accepted: result.accepted,
        rejected: result.rejected,
      });

      return result;
    }

    const resend = getResend();
    const result = await resend.emails.send({
      from: resolvedFrom,
      to: normalizedTo,
      bcc: normalizedBcc ?? normalizeList(defaults.bcc),
      replyTo: resolvedReplyTo,
      subject,
      react,
      attachments,
    });

    if (result.error) {
      console.error("[email] send:provider_error", {
        ...logBase,
        error: result.error,
      });
      throw new Error(`Resend email send failed: ${result.error.message}`);
    }

    console.info("[email] send:success", {
      ...logBase,
      providerMessageId: result.data?.id,
    });

    return result;
  } catch (error) {
    console.error("[email] send:failed", {
      ...logBase,
      error: serializeError(error),
    });
    throw error;
  }
}

interface SendTherapistInviteArgs {
  context?: string;
  to: string | string[];
  subject: string;
  reactProps: React.ReactElement;
  icsContent: string;
  filename?: string;
}

export async function sendTherapistInviteEmail({
  context,
  to,
  subject,
  reactProps,
  icsContent,
  filename,
}: SendTherapistInviteArgs) {
  return sendEmail({
    context,
    to,
    subject,
    react: reactProps,
    attachments: [{ filename: filename || "appointment.ics", content: icsContent }],
  });
}

interface SendPatientInviteArgs {
  context?: string;
  to: string | string[];
  subject: string;
  reactProps: React.ReactElement;
  icsContent: string;
  filename?: string;
}

export async function sendPatientInviteEmail({
  context,
  to,
  subject,
  reactProps,
  icsContent,
  filename,
}: SendPatientInviteArgs) {
  return sendEmail({
    context,
    to,
    subject,
    react: reactProps,
    attachments: [{ filename: filename || "appointment.ics", content: icsContent }],
  });
}
