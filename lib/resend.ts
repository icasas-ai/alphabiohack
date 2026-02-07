import { Resend } from "resend";
// Ensure bundler resolves optional peer for Resend's dynamic import
import "@react-email/render";

export function getResend() {
  return new Resend(process.env.RESEND_API_KEY!);
}
