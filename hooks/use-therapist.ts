"use client";

import { useCallback, useEffect, useState } from "react";

import type { Therapist } from "@/types";

const therapistCache = new Map<string, Therapist>();
const therapistPromiseCache = new Map<string, Promise<Therapist | null>>();

export function useTherapist(therapistId?: string) {
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTherapist = useCallback(async (id: string) => {
    if (therapistCache.has(id)) {
      const cached = therapistCache.get(id) || null;
      setTherapist(cached);
      setError(null);
      return cached;
    }

    if (therapistPromiseCache.has(id)) {
      setLoading(true);
      try {
        const pending = await (therapistPromiseCache.get(id) as Promise<Therapist | null>);
        setTherapist(pending);
        setError(null);
        return pending;
      } finally {
        setLoading(false);
      }
    }

    try {
      setLoading(true);
      setError(null);

      const requestPromise = (async () => {
        const response = await fetch(`/api/therapists/${id}`);
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Error al cargar terapeuta");
        }

        return result.data as Therapist;
      })();
      therapistPromiseCache.set(id, requestPromise);

      const data = await requestPromise;
      therapistCache.set(id, data);
      setTherapist(data);
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      console.error("Error fetching therapist:", err);
      return null;
    } finally {
      therapistPromiseCache.delete(id);
      setLoading(false);
    }
  }, []);

  const fetchTherapistById = useCallback(
    async (id: string): Promise<Therapist | null> => {
      return await fetchTherapist(id);
    },
    [fetchTherapist]
  );

  // Cargar terapeuta automáticamente si se proporciona un ID
  useEffect(() => {
    if (therapistId) {
      fetchTherapist(therapistId);
    }
  }, [therapistId, fetchTherapist]);

  return {
    therapist,
    loading,
    error,
    fetchTherapist,
    fetchTherapistById,
    refetch: () =>
      therapistId ? fetchTherapist(therapistId) : Promise.resolve(null),
  };
}
