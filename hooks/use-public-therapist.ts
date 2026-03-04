"use client";

import { useCallback, useEffect, useState } from "react";

import type { Therapist } from "@/types";

export function usePublicTherapist() {
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPublicTherapist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/public/profile", {
        cache: "no-store",
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(result?.error || "Unable to load public therapist");
      }

      setTherapist(result.data);
      return result.data as Therapist;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load public therapist";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPublicTherapist();
  }, [fetchPublicTherapist]);

  return {
    therapist,
    loading,
    error,
    refetch: fetchPublicTherapist,
  };
}
