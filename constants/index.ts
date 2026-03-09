export const CONTACT_INFO = { // this is the footer information;
  EMAIL: "icasas@tenmacontrol.com",
  PHONE: "+16194682741",
  WEBSITE: "https://www.myalphapulse.com",
  ADDRESS: "3556 Beech Street, San Francisco, California, CA 94109",
  BRAND_NAME: "TENMA CONTROL",
  SOCIAL_MEDIA: {
    FACEBOOK: "https://www.facebook.com/doccure",
    TWITTER: "https://www.twitter.com/doccure",
    LINKEDIN: "https://www.linkedin.com/doccure",
    INSTAGRAM: "https://www.instagram.com/doccure",
  },
  TERMS_AND_CONDITIONS: "https://www.doccure.com/terms-and-conditions",
  PRIVACY_POLICY: "https://www.doccure.com/privacy-policy",
};

export const SITE_DATA = {
  name: "Alphabiohack",
  logo: "/images/favicon.png",
  description: "By MyAlphaPulse",
  email: "icasas@tenmacontrol.com",
  phone: "+16194682741",
};

export const PLATFORM_INFO = {
  BRAND_NAME: "MyAlphaPulse",
  LOGO: "/images/logo.png",
};

export const PROFESSIONAL_INFO = {
  BRAND_NAME: "Alphabiohack",
  EMAIL: "alphabiohack@gmail.com",
  PHONE: "+19158675506",
  ADDRESS:
    "10000 N 31st Ave Phoenix, AZ 85051 United States Building C - Suite 126",
  SOCIAL_MEDIA: {
    FACEBOOK: "https://www.facebook.com/alphabiohack",
    TWITTER: "https://www.twitter.com/alphabiohack",
    LINKEDIN: "https://www.linkedin.com/company/alphabiohack",
    INSTAGRAM: "https://www.instagram.com/alphabiohack",
  },
};
/**
 * Configuración del terapeuta por defecto
 *
 * Esta constante define los datos del terapeuta que se usará cuando
 * el sistema esté configurado en modo de terapeuta único.
 *
 * Para habilitar el modo de terapeuta único:
 * 1. Cambiar `singleTherapistMode: true` en lib/config/features.ts
 * 2. Configurar el `defaultTherapistId` con el ID real del terapeuta
 * 3. Actualizar los datos aquí con la información real del terapeuta
 */
export const DEFAULT_THERAPIST = {
  id: "cmfd14syi0002c9kohiinmuc1", // Cambiar por el ID real del terapeuta
  firstName: "Dr. Juan",
  lastName: "Pérez",
  email: "dr.juan.perez@tenmacontrol.com",
  phone: "+16194682741",
  specialties: ["Psicología", "Terapia Cognitivo-Conductual"],
  bio: "Psicólogo clínico con más de 10 años de experiencia en terapia cognitivo-conductual y tratamiento de ansiedad y depresión.",
  profileImage: "/images/smiling-doctor.png",
  qualifications: [
    "Licenciatura en Psicología",
    "Maestría en Terapia Cognitivo-Conductual",
    "Certificación en Terapia de Parejas",
  ],
  languages: ["Español", "Inglés"],
  experience: "10+ años",
  rating: 4.9,
  totalPatients: 500,
};

/**
 * Endpoints de la API
 *
 * Centraliza todas las rutas de la API para evitar magic strings
 * y facilitar el mantenimiento
 */
export const API_ENDPOINTS = {
  // Autenticación y usuarios
  USER: {
    BASE: "/api/user",
  },

  // Ubicaciones
  LOCATIONS: {
    BASE: "/api/locations",
    BY_ID: (id: string) => `/api/locations/${id}`,
    SEARCH: (query: string) =>
      `/api/locations?search=${encodeURIComponent(query)}`,
    NEARBY: (lat: number, lon: number, radius: number = 10) =>
      `/api/locations?lat=${lat}&lon=${lon}&radius=${radius}`,
  },

  // Terapeutas
  THERAPISTS: {
    BASE: "/api/therapists",
    BY_ID: (id: string) => `/api/therapists/${id}`,
  },

  AVAILABILITY: {
    PERIODS: "/api/availability/periods",
    PERIOD_BY_ID: (id: string) => `/api/availability/periods/${id}`,
    DAY_BY_ID: (id: string) => `/api/availability/days/${id}`,
    CALENDAR: "/api/availability/calendar",
    RESTORE_EXCLUDED_DATE: (periodId: string) => `/api/availability/periods/${periodId}`,
  },

  // Citas/Bookings
  BOOKINGS: {
    BASE: "/api/bookings",
    STATS: "/api/bookings/stats",
    BY_ID: (id: string) => `/api/bookings/${id}`,
  },

  // Servicios y especialidades
  SERVICES: {
    BASE: "/api/services",
    BY_ID: (id: string) => `/api/services/${id}`,
    BY_SPECIALTY: (specialtyId: string) =>
      `/api/services?specialtyId=${specialtyId}`,
    STATS: "/api/services/stats",
  },

  SPECIALTIES: {
    BASE: "/api/specialties",
    BY_ID: (id: string) => `/api/specialties/${id}`,
    WITH_SERVICES: "/api/specialties?withServices=true",
    SERVICES: (id: string) => `/api/specialties/${id}/services`,
  },
} as const;
