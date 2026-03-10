import {
  activeFeatureFlags,
  canSelectMultipleServices,
  getEnabledAppointmentTypes,
  getSetting,
  isAppointmentTypeEnabled,
  isFeatureEnabled,
  shouldShowPrices,
  type FeatureFlags,
} from "@/lib/config/features";
import { BookingType } from "@/lib/prisma-browser";
import { useMemo } from "react";

/**
 * Hook para manejar Feature Flags
 *
 * Proporciona acceso fácil a las configuraciones de feature flags
 * con memoización para optimizar el rendimiento
 */
export function useFeatureFlags() {
  return useMemo(
    () => ({
      // Configuración completa
      flags: activeFeatureFlags,

      // Tipos de citas habilitados
      enabledAppointmentTypes: getEnabledAppointmentTypes(),

      // Verificar si un tipo de cita está habilitado
      isAppointmentTypeEnabled: (type: BookingType) =>
        isAppointmentTypeEnabled(type),

      // Verificar si una funcionalidad está habilitada
      isFeatureEnabled: (feature: keyof FeatureFlags["features"]) =>
        isFeatureEnabled(feature),

      // Obtener configuración específica
      getSetting: <K extends keyof FeatureFlags["settings"]>(setting: K) =>
        getSetting(setting),

      // Métodos de conveniencia
      canBookOnline: () => isFeatureEnabled("onlineBooking"),
      canBookByPhone: () => isFeatureEnabled("phoneBooking"),
      canBookHomeVisits: () => isFeatureEnabled("homeVisits"),
      canBookVideoCalls: () => isFeatureEnabled("videoCalls"),
      canBookClinicVisits: () => isFeatureEnabled("clinicVisits"),

      canSelectMultipleServices: () => canSelectMultipleServices(),
      shouldShowPrices: () => shouldShowPrices(),

      // Configuraciones de tiempo
      maxAdvanceDays: getSetting("maxAdvanceBookingDays"),
      minAdvanceHours: getSetting("minAdvanceBookingHours"),
      allowSameDay: getSetting("allowSameDayBooking"),
      requirePhoneVerification: getSetting("requirePhoneVerification"),
    }),
    []
  );
}

/**
 * Hook específico para tipos de citas
 */
export function useAppointmentTypes() {
  const { enabledAppointmentTypes, isAppointmentTypeEnabled } =
    useFeatureFlags();

  return useMemo(
    () => ({
      enabled: enabledAppointmentTypes,
      isEnabled: isAppointmentTypeEnabled,
      count: enabledAppointmentTypes.length,
      hasMultiple: enabledAppointmentTypes.length > 1,
    }),
    [enabledAppointmentTypes, isAppointmentTypeEnabled]
  );
}

/**
 * Hook para configuraciones de booking
 */
export function useBookingSettings() {
  const {
    maxAdvanceDays,
    minAdvanceHours,
    allowSameDay,
    requirePhoneVerification,
  } = useFeatureFlags();

  return useMemo(
    () => ({
      maxAdvanceDays,
      minAdvanceHours,
      allowSameDay,
      requirePhoneVerification,

      // Métodos de conveniencia
      canBookToday: () => allowSameDay,
      canBookTomorrow: () => minAdvanceHours <= 24,
      getMaxBookingDate: () => {
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + maxAdvanceDays);
        return maxDate;
      },
      getMinBookingDate: () => {
        const minDate = new Date();
        minDate.setHours(minDate.getHours() + minAdvanceHours);
        return minDate;
      },
    }),
    [maxAdvanceDays, minAdvanceHours, allowSameDay, requirePhoneVerification]
  );
}

export function useAppointmentFlags() {
  const { canSelectMultipleServices, shouldShowPrices } = useFeatureFlags();

  return useMemo(
    () => ({
      canSelectMultipleServices,
      shouldShowPrices,
    }),
    [canSelectMultipleServices, shouldShowPrices]
  );
}
