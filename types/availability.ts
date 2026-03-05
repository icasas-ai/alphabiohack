import { DaysOfWeek } from "@/lib/prisma-browser";

// Interfaz para un slot de horario individual
export interface TimeSlot {
  id?: string;
  startTime: string; // Formato HH:MM
  endTime: string; // Formato HH:MM
  isActive?: boolean;
  businessHoursId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interfaz para un día de la semana con sus horarios
export interface DaySchedule {
  dayOfWeek: DaysOfWeek;
  isEnabled: boolean;
  timeSlots: TimeSlot[];
  businessHoursId?: string;
}

// Interfaz para la disponibilidad completa de una ubicación
export interface LocationAvailability {
  locationId: string;
  locationName: string;
  days: DaySchedule[];
}

// Interfaz para crear/actualizar disponibilidad de una ubicación
export interface AvailabilityFormData {
  locationId: string;
  days: DaySchedule[];
}

// Interfaz para operaciones de disponibilidad
export interface AvailabilityOperations {
  createTimeSlot: (
    businessHoursId: string,
    timeSlot: TimeSlot
  ) => Promise<void>;
  updateTimeSlot: (timeSlotId: string, timeSlot: TimeSlot) => Promise<void>;
  deleteTimeSlot: (timeSlotId: string) => Promise<void>;
  toggleDayEnabled: (
    locationId: string,
    dayOfWeek: DaysOfWeek,
    enabled: boolean
  ) => Promise<void>;
  updateLocationAvailability: (data: AvailabilityFormData) => Promise<void>;
  loading: boolean;
  error: string | null;
}

// Constantes para días de la semana
export const DAYS_OF_WEEK: { value: DaysOfWeek; label: string }[] = [
  { value: DaysOfWeek.Monday, label: "Lunes" },
  { value: DaysOfWeek.Tuesday, label: "Martes" },
  { value: DaysOfWeek.Wednesday, label: "Miércoles" },
  { value: DaysOfWeek.Thursday, label: "Jueves" },
  { value: DaysOfWeek.Friday, label: "Viernes" },
  { value: DaysOfWeek.Saturday, label: "Sábado" },
  { value: DaysOfWeek.Sunday, label: "Domingo" },
];

// Constantes para horarios predefinidos
export const COMMON_TIME_SLOTS = [
  { startTime: "08:00", endTime: "12:00", label: "Mañana (8:00 - 12:00)" },
  { startTime: "12:00", endTime: "16:00", label: "Tarde (12:00 - 16:00)" },
  { startTime: "16:00", endTime: "20:00", label: "Noche (16:00 - 20:00)" },
  {
    startTime: "09:00",
    endTime: "17:00",
    label: "Horario completo (9:00 - 17:00)",
  },
];

// Utilidades para manejo de tiempo
export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const parseTime = (timeString: string): string => {
  // Convierte formato 12h a 24h
  const match = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return timeString;

  let hour = parseInt(match[1]);
  const minutes = match[2];
  const ampm = match[3].toUpperCase();

  if (ampm === "PM" && hour !== 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;

  return `${hour.toString().padStart(2, "0")}:${minutes}`;
};

export const isValidTimeSlot = (
  startTime: string,
  endTime: string
): boolean => {
  const start = new Date(`2000-01-01T${startTime}:00`);
  const end = new Date(`2000-01-01T${endTime}:00`);
  return start < end;
};

export const getTimeSlotDuration = (
  startTime: string,
  endTime: string
): number => {
  const start = new Date(`2000-01-01T${startTime}:00`);
  const end = new Date(`2000-01-01T${endTime}:00`);
  return (end.getTime() - start.getTime()) / (1000 * 60); // minutos
};
