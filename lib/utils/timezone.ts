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
  // Crear un objeto temporal en UTC para obtener el offset de la zona
  const tempDate = new Date(`${dateStr}T12:00:00Z`);
  const offset = formatInTimeZone(tempDate, tz, "XXX");
  // Construir la fecha tratando el string como hora local
  return new Date(`${dateStr}T00:00:00${offset}`);
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