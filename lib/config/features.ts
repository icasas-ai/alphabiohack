import { BookingType } from "@/lib/prisma-browser";

/**
 * Feature Flags Configuration
 *
 * Este archivo controla qué funcionalidades están habilitadas o deshabilitadas
 * en la aplicación. Útil para:
 * - Controlar qué tipos de citas están disponibles
 * - Habilitar/deshabilitar funcionalidades específicas
 * - Testing A/B
 * - Rollouts graduales
 */

export interface FeatureFlags {
  // Tipos de citas disponibles
  appointmentTypes: {
    DirectVisit: boolean;
    VideoCall: boolean;
    PhoneCall: boolean;
    HomeVisit: boolean;
  };

  appointmentServices: {
    multipleServices: boolean;
    showPrices: boolean;
  };

  // Otras funcionalidades
  features: {
    onlineBooking: boolean;
    phoneBooking: boolean;
    homeVisits: boolean;
    videoCalls: boolean;
    clinicVisits: boolean;
    blog: boolean;
    services: boolean;
  };

  // Configuraciones específicas
  settings: {
    maxAdvanceBookingDays: number;
    minAdvanceBookingHours: number;
    allowSameDayBooking: boolean;
    requirePhoneVerification: boolean;
  };

  // Sistema de terapeuta único
  therapist: {
    singleTherapistMode: boolean;
  };
}

/**
 * Configuración de Feature Flags
 *
 * Cambia estos valores para habilitar/deshabilitar funcionalidades
 */
export const featureFlags: FeatureFlags = {
  // Tipos de citas disponibles
  appointmentTypes: {
    DirectVisit: true, // Citas presenciales en clínica
    VideoCall: false, // Citas por video llamada
    PhoneCall: false, // Citas por teléfono
    HomeVisit: false, // Visitas a domicilio (deshabilitado por defecto)
  },

  appointmentServices: {
    multipleServices: false,
    showPrices: false,
  },

  // Funcionalidades específicas
  features: {
    onlineBooking: true,
    phoneBooking: true,
    homeVisits: false, // Visitas a domicilio deshabilitadas
    videoCalls: false,
    clinicVisits: false,
    blog: false,
    services: false,
  },

  // Configuraciones del sistema
  settings: {
    maxAdvanceBookingDays: 30, // Máximo días de anticipación
    minAdvanceBookingHours: 2, // Mínimo horas de anticipación
    allowSameDayBooking: true, // Permitir citas el mismo día
    requirePhoneVerification: false, // Requerir verificación telefónica
  },

  // Sistema de terapeuta único
  therapist: {
    singleTherapistMode: true, // Modo de terapeuta único deshabilitado por defecto
  },
};

/**
 * Obtiene los tipos de citas habilitados
 */
export function getEnabledAppointmentTypes(): BookingType[] {
  return Object.entries(featureFlags.appointmentTypes)
    .filter(([, enabled]) => enabled)
    .map(([type]) => type as BookingType);
}

/**
 * Verifica si un tipo de cita está habilitado
 */
export function isAppointmentTypeEnabled(type: BookingType): boolean {
  return featureFlags.appointmentTypes[
    type as keyof typeof featureFlags.appointmentTypes
  ];
}

/**
 * Verifica si una funcionalidad está habilitada
 */
export function isFeatureEnabled(
  feature: keyof FeatureFlags["features"]
): boolean {
  return featureFlags.features[feature];
}

/**
 * Obtiene una configuración específica
 */
export function getSetting<K extends keyof FeatureFlags["settings"]>(
  setting: K
): FeatureFlags["settings"][K] {
  return featureFlags.settings[setting];
}

/**
 * Verifica si el modo de terapeuta único está habilitado
 */
export function isSingleTherapistModeEnabled(): boolean {
  return featureFlags.therapist.singleTherapistMode;
}

/**
 * Verifica si se pueden seleccionar múltiples servicios
 */
export function canSelectMultipleServices(): boolean {
  return featureFlags.appointmentServices.multipleServices;
}

/**
 * Verifica si se deben mostrar los precios
 */
export function shouldShowPrices(): boolean {
  return featureFlags.appointmentServices.showPrices;
}

/**
 * Configuraciones por ambiente
 *
 * Puedes tener diferentes configuraciones para desarrollo, staging y producción
 */
export const environmentConfigs = {
  development: {
    ...featureFlags,
    appointmentTypes: {
      ...featureFlags.appointmentTypes,
      HomeVisit: true, // Habilitar visitas a domicilio en desarrollo
    },
  },

  staging: {
    ...featureFlags,
    settings: {
      ...featureFlags.settings,
      maxAdvanceBookingDays: 14, // Menos días en staging
    },
  },

  production: featureFlags,
};

/**
 * Obtiene la configuración según el ambiente actual
 */
export function getEnvironmentConfig(): FeatureFlags {
  const env = process.env.NODE_ENV || "development";

  switch (env) {
    case "test":
      return environmentConfigs.staging;
    case "production":
      return environmentConfigs.production;
    default:
      return environmentConfigs.development;
  }
}

// Exportar la configuración activa
export const activeFeatureFlags = getEnvironmentConfig();
