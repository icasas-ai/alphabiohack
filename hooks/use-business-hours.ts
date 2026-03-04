"use client";

import { useCallback, useEffect, useState } from "react";

import { API_ENDPOINTS } from "@/constants";
import type { BusinessHours } from "@/types";

export function useBusinessHours(locationId: string) {
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinessHours = useCallback(async (targetLocationId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(API_ENDPOINTS.BUSINESS_HOURS.BY_LOCATION(targetLocationId), {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Error al cargar horarios de negocio");
      }

      // Asegurar que siempre sea un array
      const data = Array.isArray(result.data)
        ? result.data
        : result.data
        ? [result.data]
        : [];

      setBusinessHours(data);
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBusinessHoursByLocation = useCallback(
    async (locationId: string): Promise<BusinessHours[]> => {
      try {
        setLoading(true);
        setError(null);

        const url = API_ENDPOINTS.BUSINESS_HOURS.BY_LOCATION(locationId);
        const response = await fetch(url, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });
        const result = await response.json();

        if (!result.success) {
          throw new Error(
            result.error || "Error al cargar horarios de negocio"
          );
        }

        // Asegurar que siempre sea un array
        const data = Array.isArray(result.data)
          ? result.data
          : result.data
          ? [result.data]
          : [];

        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        setError(errorMessage);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getBusinessHoursForDay = useCallback(
    (dayOfWeek: string): BusinessHours | undefined => {
      return businessHours.find((bh) => bh.dayOfWeek === dayOfWeek);
    },
    [businessHours]
  );

  const isLocationOpen = useCallback(
    (dayOfWeek: string): boolean => {
      const hours = getBusinessHoursForDay(dayOfWeek);
      return !!hours;
    },
    [getBusinessHoursForDay]
  );

  // Cargar horarios automáticamente cuando cambie la ubicación
  useEffect(() => {
    fetchBusinessHours(locationId);
  }, [locationId, fetchBusinessHours]);

  const refetch = useCallback(() => {
    return fetchBusinessHours(locationId);
  }, [locationId, fetchBusinessHours]);

  return {
    businessHours,
    loading,
    error,
    fetchBusinessHours,
    fetchBusinessHoursByLocation,
    getBusinessHoursForDay,
    isLocationOpen,
    refetch,
  };
}
