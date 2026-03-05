import { dateKeyInTZ, formatBookingToLocalStrings, resolveTimeZone } from "./timezone";

import { format } from "date-fns";

export interface BookingData {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  bookingSchedule: string;
  status: string;
  location: {
    id?: string;
    title: string;
    timezone?: string;
  };
  specialty?: {
    id: string;
    name: string;
  };
  service?: {
    id: string;
    description: string;
    cost: number;
    duration: number;
  };
  bookingNotes?: string;
  bookingLocalDate?: string;
  bookingLocalTime?: string;
  bookingTimeZone?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  displayTime?: string;
  dateKey?: string;
  locationId?: string;
  type: "appointment" | "task" | "event";
  status?: "pending" | "confirmed" | "inprogress" | "completed" | "cancelled" | "noshow";
  color?: string;
  // Datos adicionales para appointments
  patientName?: string;
  patientEmail?: string;
  patientPhone?: string;
  location?: string;
  specialty?: string;
  service?: string;
  duration?: number;
  notes?: string;
}

export function normalizeBookingStatus(status?: string): CalendarEvent["status"] {
  switch ((status || "").toLowerCase()) {
    case "pending":
      return "pending";
    case "confirmed":
      return "confirmed";
    case "inprogress":
      return "inprogress";
    case "completed":
      return "completed";
    case "cancelled":
      return "cancelled";
    case "noshow":
      return "noshow";
    default:
      return undefined;
  }
}

export function convertBookingsToEvents(
  bookings: BookingData[]
): CalendarEvent[] {
  return bookings.map((booking) => {
    const patientName = `${booking.firstname} ${booking.lastname}`;
    const eventTime = new Date(booking.bookingSchedule);
    const officeTimeZone = resolveTimeZone(
      booking.bookingTimeZone || booking.location?.timezone
    );
    const localStrings = formatBookingToLocalStrings(eventTime, officeTimeZone);
    const timeString =
      booking.bookingLocalTime ||
      eventTime.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: officeTimeZone,
      });

    // Usar el nombre completo del paciente + hora como título
    const eventTitle = `${patientName} - ${timeString}`;

    return {
      id: booking.id,
      title: eventTitle,
      time: booking.bookingSchedule,
      displayTime: timeString,
      dateKey: booking.bookingLocalDate || localStrings.dateString,
      locationId: booking.location?.id,
      type: "appointment" as const,
      status: normalizeBookingStatus(booking.status),
      patientName,
      patientEmail: booking.email,
      patientPhone: booking.phone,
      location: booking.location.title,
      specialty: booking.specialty?.name,
      service: booking.service?.description,
      duration: booking.service?.duration,
      notes: booking.bookingNotes,
    };
  });
}

export function getEventsForDate(
  events: CalendarEvent[],
  date: Date
): CalendarEvent[] {
  const dateKey = format(date, "yyyy-MM-dd");
  return events.filter((event) => {
    const eventDate = event.dateKey || dateKeyInTZ(new Date(event.time));
    return eventDate === dateKey;
  });
}

export function getEventsForMonth(
  events: CalendarEvent[],
  date: Date
): CalendarEvent[] {
  const monthKey = format(date, "yyyy-MM");
  return events.filter((event) => {
    const eventMonth =
      event.dateKey?.slice(0, 7) || format(new Date(event.time), "yyyy-MM");
    return eventMonth === monthKey;
  });
}
