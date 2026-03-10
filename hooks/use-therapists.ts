"use client";

import { useCallback, useEffect, useState } from "react";

import { API_ENDPOINTS } from "@/constants";
import type { Therapist } from "@/types";

interface UseTherapistsOptions {
  enabled?: boolean;
}

export function useTherapists(options: UseTherapistsOptions = {}) {
  const { enabled = true } = options;
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTherapists = useCallback(async () => {
    if (!enabled) {
      setTherapists([]);
      setError(null);
      setLoading(false);
      return [];
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(API_ENDPOINTS.THERAPISTS.BASE, {
        cache: "no-store",
      });
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Error loading therapists");
      }

      setTherapists(result.data || []);
      return result.data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading therapists");
      setTherapists([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchTherapists();
  }, [fetchTherapists]);

  return {
    therapists,
    loading,
    error,
    refetch: fetchTherapists,
  };
}
