import { PST_TZ, combineDateAndTimeToUtc, formatInTZ } from "@/lib/utils/timezone";

export type CalendarEventInput = {
  title: string;
  description?: string;
  location?: string;
  // Inicio/fin en PST base (fecha seleccionada y HH:mm)
  date: Date;
  startTimeHHmm: string;
  endTimeHHmm: string;
};

function toUtcCalendarStamp(date: Date): string {
  // yyyymmddThhmmssZ
  const pad = (n: number) => n.toString().padStart(2, "0");
  const yyyy = date.getUTCFullYear();
  const MM = pad(date.getUTCMonth() + 1);
  const dd = pad(date.getUTCDate());
  const hh = pad(date.getUTCHours());
  const mm = pad(date.getUTCMinutes());
  const ss = pad(date.getUTCSeconds());
  return `${yyyy}${MM}${dd}T${hh}${mm}${ss}Z`;
}

function formatLocalForGoogle(date: Date, tz: string): string {
  // Returns local date/time in the given tz as: yyyyMMddTHHmmss (no Z)
  return formatInTZ(date, "yyyyMMdd'T'HHmmss", tz);
}

export function buildGoogleCalendarUrl(
  input: CalendarEventInput,
  tz: string = PST_TZ
): string {
  const startUtc = combineDateAndTimeToUtc(input.date, input.startTimeHHmm, tz);
  const endUtc = combineDateAndTimeToUtc(input.date, input.endTimeHHmm, tz);
  const dates = `${formatLocalForGoogle(startUtc, tz)}/${formatLocalForGoogle(endUtc, tz)}`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: input.title,
    dates,
    details: input.description || "",
    location: input.location || "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}&ctz=${encodeURIComponent(tz)}`; //for g calendar
}

function escapeICSValue(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export function buildICS(
  input: CalendarEventInput & {
    uid: string;
    organizerEmail: string;
    attendeeEmail?: string;
  },
  tz: string = PST_TZ
): string {
  const startUtc = combineDateAndTimeToUtc(input.date, input.startTimeHHmm, tz);
  const endUtc = combineDateAndTimeToUtc(input.date, input.endTimeHHmm, tz);
  const dtstamp = toUtcCalendarStamp(new Date());
  const dtstart = formatLocalForGoogle(startUtc, tz);
  const dtend = formatLocalForGoogle(endUtc, tz);
  const organizer = `ORGANIZER;CN=Location:mailto:${input.organizerEmail}`;
  const attendee =
    input.attendeeEmail ?
      `\nATTENDEE;RSVP=TRUE;CN=Professional;ROLE=REQ-PARTICIPANT:mailto:${input.attendeeEmail}`
    : "";
  const desc = escapeICSValue(input.description || "");
  const loc = escapeICSValue((input.location || "").replace(/\n/g, " "));
  const summary = escapeICSValue(input.title);
  return [
    "BEGIN:VCALENDAR",
    "PRODID:-//booking-saas//EN",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    `X-WR-TIMEZONE:${tz}`,
    "BEGIN:VEVENT",
    `UID:${input.uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;TZID=${tz}:${dtstart}`,
    `DTEND;TZID=${tz}:${dtend}`,
    organizer,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${desc}`,
    `LOCATION:${loc}`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "TRANSP:OPAQUE",
    attendee,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
