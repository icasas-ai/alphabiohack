"use client";

import { useCallback, useEffect, useState } from "react";

import type { Service } from "@/types";

const servicesCache = new Map<string, Service[]>();
const servicesPromiseCache = new Map<string, Promise<Service[]>>();
const serviceByIdCache = new Map<string, Service>();

export function useServices(specialtyId?: string) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async (specialtyId?: string, force = false) => {
    const cacheKey = specialtyId || "__all__";

    if (!force && servicesCache.has(cacheKey)) {
      const cached = servicesCache.get(cacheKey) || [];
      setServices(cached);
      setError(null);
      return cached;
    }

    if (!force && servicesPromiseCache.has(cacheKey)) {
      setLoading(true);
      try {
        const pending = await (servicesPromiseCache.get(cacheKey) as Promise<Service[]>);
        setServices(pending);
        setError(null);
        return pending;
      } finally {
        setLoading(false);
      }
    }

    try {
      setLoading(true);
      setError(null);

      const url = specialtyId
        ? `/api/services?specialtyId=${specialtyId}`
        : "/api/services";

      const requestPromise = (async () => {
        const response = await fetch(url);
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Error al cargar servicios");
        }

        return result.data as Service[];
      })();
      servicesPromiseCache.set(cacheKey, requestPromise);

      const data = await requestPromise;
      servicesCache.set(cacheKey, data);
      data.forEach((service) => serviceByIdCache.set(service.id, service));
      setServices(data);
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      console.error("Error fetching services:", err);
      return [];
    } finally {
      servicesPromiseCache.delete(cacheKey);
      setLoading(false);
    }
  }, []);

  const fetchServiceById = useCallback(
    async (id: string): Promise<Service | null> => {
      try {
        setLoading(true);
        setError(null);

        if (serviceByIdCache.has(id)) {
          return serviceByIdCache.get(id) || null;
        }

        const response = await fetch(`/api/services/${id}`);
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Error al cargar servicio");
        }

        const service = result.data as Service;
        serviceByIdCache.set(service.id, service);
        return service;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        setError(errorMessage);
        console.error("Error fetching service by id:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const searchServices = useCallback(
    async (query: string): Promise<Service[]> => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/services?search=${encodeURIComponent(query)}`
        );
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Error al buscar servicios");
        }

        return result.data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        setError(errorMessage);
        console.error("Error searching services:", err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Cargar servicios automáticamente cuando cambie la especialidad
  useEffect(() => {
    if (specialtyId) {
      fetchServices(specialtyId);
    } else {
      fetchServices();
    }
  }, [specialtyId, fetchServices]);

  return {
    services,
    loading,
    error,
    fetchServices,
    fetchServiceById,
    searchServices,
    refetch: () => fetchServices(specialtyId, true),
  };
}
