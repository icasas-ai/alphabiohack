import { formatInTimeZone } from "date-fns-tz";

export const PST_TZ = "America/Los_Angeles";

export function formatInTZ(
  date: Date,
  pattern: string,
  tz: string = PST_TZ
): string {
  return formatInTimeZone(date, tz, pattern);
}

export function dateKeyInTZ(date: Date, tz: string = PST_TZ): string {
  return formatInTimeZone(date, tz, "yyyy-MM-dd");
}

export function timeKeyInTZ(date: Date, tz: string = PST_TZ): string {
  return formatInTimeZone(date, tz, "HH:mm");
}

export function dayOfWeekInTZ(date: Date, tz: string = PST_TZ): string {
  return formatInTimeZone(date, tz, "EEEE");
}

export function combineDateAndTimeToUtc(
  date: Date,
  timeHHmm: string,
  tz: string = PST_TZ
): Date {
  const localDateStr = formatInTimeZone(date, tz, "yyyy-MM-dd");
  const offset = formatInTimeZone(date, tz, "XXX"); // e.g. -08:00 / -07:00
  return new Date(`${localDateStr}T${timeHHmm}:00${offset}`);
}

/**
 * Parsea una fecha YYYY-MM-DD como si fuera una fecha local en la zona horaria especificada
 * y devuelve un objeto Date que representa esa fecha/hora local.
 */
export function parseDateStringInTimeZone(
  dateStr: string, // YYYY-MM-DD
  tz: string = PST_TZ
): Date {
  // Use noon instead of midnight so date-only values stay on the same
  // calendar day even when the viewer's browser is in a different timezone.
  const tempDate = new Date(`${dateStr}T12:00:00Z`);
  const offset = formatInTimeZone(tempDate, tz, "XXX");
  return new Date(`${dateStr}T12:00:00${offset}`);
}

/**
 * Devuelve un objeto con la fecha y la hora formateadas según la zona indicada.
 * Si no se especifica `tz`, se usa por defecto PST.
 */
export function formatBookingToLocalStrings(
  date: Date,
  tz: string = PST_TZ
): { dateString: string; timeString: string } {
  return {
    dateString: formatInTimeZone(date, tz, "yyyy-MM-dd"),
    timeString: formatInTimeZone(date, tz, "HH:mm"),
  };
}

export function getTimeZoneDisplayName(
  tz: string = PST_TZ,
  locale: string = "en-US"
): string {
  try {
    const formatter = new Intl.DateTimeFormat(locale, {
      timeZone: tz,
      timeZoneName: "longGeneric",
    });
    const zonePart = formatter
      .formatToParts(new Date())
      .find((part) => part.type === "timeZoneName")?.value;

    return zonePart || tz;
  } catch {
    return tz;
  }
}

export function formatTimeZoneLabel(
  tz: string = PST_TZ,
  locale: string = "en-US"
): string {
  const displayName = getTimeZoneDisplayName(tz, locale);
  return displayName === tz ? tz : `${displayName} (${tz})`;
}

function parseOffsetToMinutes(offset: string): number {
  if (offset === "Z") return 0;

  const match = offset.match(/^([+-])(\d{2}):(\d{2})$/);
  if (!match) {
    throw new Error(`Invalid timezone offset: ${offset}`);
  }

  const [, sign, hours, minutes] = match;
  const total = Number(hours) * 60 + Number(minutes);
  return sign === "-" ? -total : total;
}

export function getTimeZoneOffsetMinutes(
  date: Date,
  tz: string = PST_TZ,
): number {
  return parseOffsetToMinutes(formatInTimeZone(date, tz, "XXX"));
}

export function getTimeZoneDifferenceHours(
  targetTimeZone: string,
  referenceTimeZone: string,
  date: Date = new Date(),
): number {
  const diffMinutes =
    getTimeZoneOffsetMinutes(date, targetTimeZone) -
    getTimeZoneOffsetMinutes(date, referenceTimeZone);

  return diffMinutes / 60;
}
