import { BookingStatus, BookingType } from "@prisma/client";

// Interfaz para crear una nueva cita
export interface CreateBookingData {
  bookingType: BookingType;
  locationId: string;
  specialtyId?: string;
  serviceId?: string;
  bookedDurationMinutes?: number;
  firstname: string;
  lastname: string;
  phone: string;
  email: string;
  givenConsent: boolean;
  therapistId?: string;
  patientId?: string;
  bookingNotes?: string;
  bookingSchedule: Date; // Fecha y hora de la cita
  status?: BookingStatus;
}

// Interfaz para actualizar una cita existente
export interface UpdateBookingData {
  bookingType?: BookingType;
  locationId?: string;
  specialtyId?: string;
  serviceId?: string;
  bookedDurationMinutes?: number;
  firstname?: string;
  lastname?: string;
  phone?: string;
  email?: string;
  givenConsent?: boolean;
  therapistId?: string;
  patientId?: string;
  bookingNotes?: string;
  bookingSchedule?: Date; // Fecha y hora de la cita
  status?: BookingStatus;
}

// Interfaz para los datos del formulario del wizard
export interface BookingFormData {
  appointmentType: BookingType;
  locationId: string | null;
  specialtyId: string | null;
  selectedServiceIds: string[];
  selectedDate: Date | null;
  selectedTime: string;
  therapistId: string | null;
  sessionDurationMinutes?: number | null;
  basicInfo: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    givenConsent: boolean;
    bookingNotes: string;
  };
  status: BookingStatus;
  patientId?: string;
}
