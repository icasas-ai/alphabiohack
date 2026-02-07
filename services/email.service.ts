import { getDefaultEmailConfig } from "@/services/config.service";
import { getResend  } from "@/lib/resend";

export interface SendEmailArgs {
  from?: string;
  to: string | string[] | ReadonlyArray<string>;
  subject: string;
  react: React.ReactElement;
  attachments?: Array<{ filename: string; content: string; mimeType?: string }>;
  bcc?: string | string[] | ReadonlyArray<string>;
  replyTo?: string;
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
  const resend = getResend();
  const defaults = getDefaultEmailConfig();
  const normalizeList = (
    v: string | string[] | ReadonlyArray<string> | undefined
  ): string | string[] | undefined => {
    if (v === undefined) return undefined;
    if (typeof v === "string") return v;
    return Array.from(v);
  };
  const normalizedTo = normalizeList(to)!;
  const normalizedBcc = normalizeList(bcc);
  
  return resend.emails.send({
    from: from || defaults.from,
    to: normalizedTo,
    bcc: normalizedBcc ?? normalizeList(defaults.bcc),
    replyTo: replyTo || defaults.replyTo,
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
}

export async function sendTherapistInviteEmail({
  to,
  subject,
  reactProps,
  icsContent,
}: SendTherapistInviteArgs) {
  return sendEmail({
    to,
    subject,
    react: reactProps,
    attachments: [{ filename: "appointment.ics", content: icsContent }],
  });
}

interface SendPatientInviteArgs {
  to: string | string[];
  subject: string;
  reactProps: React.ReactElement;
  icsContent: string;
}

export async function sendPatientInviteEmail({
  to,
  subject,
  reactProps,
  icsContent,
}: SendPatientInviteArgs) {
  return sendEmail({
    to,
    subject,
    react: reactProps,
    attachments: [{ filename: "appointment.ics", content: icsContent }],
  });
}
