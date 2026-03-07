import { DaysOfWeek } from "@/lib/prisma-browser";

// Interfaz para crear nuevas horas de negocio
export interface CreateBusinessHoursData {
  dayOfWeek: DaysOfWeek;
  locationId: string;
  isActive?: boolean;
}

// Interfaz para actualizar horas de negocio existentes
export interface UpdateBusinessHoursData {
  dayOfWeek?: DaysOfWeek;
  isActive?: boolean;
}

// Interfaz para crear nuevos slots de tiempo
export interface CreateTimeSlotData {
  startTime: string; // Formato HH:MM
  endTime: string; // Formato HH:MM
  businessHoursId: string;
  isActive?: boolean;
}

// Interfaz para actualizar slots de tiempo existentes
export interface UpdateTimeSlotData {
  startTime?: string; // Formato HH:MM
  endTime?: string; // Formato HH:MM
  isActive?: boolean;
}
