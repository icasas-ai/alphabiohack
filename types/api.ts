// Interfaz para la respuesta de creación de booking
export interface CreateBookingResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// Interfaz para la respuesta de API genérica
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Interfaz para la petición de creación de booking
export interface CreateBookingRequest {
  bookingType: string;
  locationId: string;
  specialtyId?: string;
  serviceId?: string;
  firstname: string;
  lastname: string;
  phone: string;
  email: string;
  givenConsent: boolean;
  therapistId?: string;
  patientId?: string;
  bookingNotes?: string;
  // Opción 1: bookingSchedule como ISO string (flujo antiguo)
  bookingSchedule?: string;
  // Opción 2: selectedDate + selectedTime (flujo nuevo, recomendado)
  selectedDate?: string; // YYYY-MM-DD
  selectedTime?: string; // HH:mm
  status?: string;
}

// Interfaz para horarios de negocio (respuesta de API)
export interface BusinessHours {
  id: string;
  dayOfWeek: string;
  locationId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  timeSlots?: TimeSlotResponse[];
  location?: Location;
}

// Interfaz para slots de tiempo (respuesta de API)
export interface TimeSlotResponse {
  id: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  businessHoursId: string;
  createdAt: Date;
  updatedAt: Date;
  businessHours?: BusinessHours;
}

// Interfaz para ubicaciones (respuesta de API)
export interface Location {
  id: string;
  title: string;
  address: string;
  description?: string;
  logo?: string;
  lat?: number;
  lon?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Interfaz para servicios (respuesta de API)
export interface Service {
  id: string;
  description: string;
  cost: number;
  duration: number;
  specialtyId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interfaz para especialidades (respuesta de API)
export interface Specialty {
  id: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Interfaz para servicios con especialidad (respuesta de API)
export interface ServiceWithSpecialty {
  id: string;
  description: string;
  cost: number;
  duration: number;
}

// Interfaz para especialidades con servicios (respuesta de API)
export interface SpecialtyWithServices {
  id: string;
  name: string;
  description?: string | null;
  services: Service[];
}

// Interfaz para estadísticas de servicios
export interface ServiceStats {
  totalServices: number;
  averageCost: number;
  totalCost: number;
  averageDuration: number;
  cheapestService?: Service;
  mostExpensiveService?: Service;
}

// Interfaz para estadísticas de especialidades
export interface SpecialtyStats {
  totalSpecialties: number;
  totalServices: number;
  averageServicesPerSpecialty: number;
  mostPopularSpecialty?: Specialty;
}

// Interfaz para terapeutas (respuesta de API)
export interface Therapist {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string;
  email: string;
  phone: string;
  specialties: string[];
  bio: string;
  profileImage: string;
  qualifications: string[];
  languages: string[];
  experience: string;
  rating: number;
  totalPatients: number;
  address?: string;
}

// Interfaz para bookings de terapeuta (respuesta de API)
export interface TherapistBooking {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  bookingSchedule: string; // ISO string desde la base de datos
  status: string;
  service: {
    id: string;
    description: string;
    cost: number;
    duration: number;
  };
  specialty: {
    id: string;
    name: string;
  };
  location: {
    id: string;
    title: string;
    address: string;
  };
  patient: {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
  };
  therapist: {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
  };
  bookingNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// Interfaz para bookings de usuario (respuesta de API)
export interface UserBooking {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  bookingSchedule: string;
  status: string;
  location: {
    title: string;
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
  therapist?: {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
  };
  bookingNotes?: string;
  createdAt: string;
  updatedAt: string;
}
