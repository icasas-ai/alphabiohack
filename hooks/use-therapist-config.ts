"use client";

import {
  isSingleTherapistModeEnabled,
} from "@/lib/config/features";

import { DEFAULT_THERAPIST } from "@/constants";

/**
 * Hook para acceder a la configuración del terapeuta
 *
 * Proporciona información sobre el modo de terapeuta único y
 * los datos del terapeuta por defecto cuando está habilitado.
 */
export function useTherapistConfig() {
  const isSingleMode = isSingleTherapistModeEnabled();

  return {
    // Estado del modo de terapeuta único
    isSingleTherapistMode: isSingleMode,

    // El terapeuta resuelto para booking ahora se obtiene desde el perfil público
    // o desde el contexto autenticado, no desde una variable pública de entorno.
    defaultTherapistId: null,

    // Mantener compatibilidad con callers existentes del hook
    hasDefaultTherapist: false,

    // Datos del terapeuta por defecto (solo si está habilitado)
    defaultTherapist: isSingleMode ? DEFAULT_THERAPIST : null,

    // Función para obtener el ID del terapeuta a usar en las citas
    getTherapistIdForBooking: (): string | null => {
      return null; // En modo multi-terapeuta, se selecciona dinámicamente
    },

    // Función para verificar si se debe mostrar selector de terapeuta
    shouldShowTherapistSelector: (): boolean => {
      return !isSingleMode;
    },
  };
}

/**
 * Tipo para los datos del terapeuta por defecto
 */
export type DefaultTherapist = typeof DEFAULT_THERAPIST;
