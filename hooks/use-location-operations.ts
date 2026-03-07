"use client";

import { API_ENDPOINTS } from "@/constants";
import { Location } from "@/types";
import { useState } from "react";

interface UseLocationOperationsReturn {
  createLocation: (data: CreateLocationData) => Promise<Location | null>;
  updateLocation: (
    id: string,
    data: UpdateLocationData
  ) => Promise<Location | null>;
  deleteLocation: (id: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

interface CreateLocationData {
  title: string;
  address: string;
  description?: string;
  timezone: string;
  logo?: string;
  lat?: number;
  lon?: number;
}

interface UpdateLocationData {
  title?: string;
  address?: string;
  description?: string;
  timezone?: string;
  logo?: string;
  lat?: number;
  lon?: number;
}

export function useLocationOperations(): UseLocationOperationsReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createLocation = async (
    data: CreateLocationData
  ): Promise<Location | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS.LOCATIONS.BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error creating location");
      }

      return result.data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error creating location";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateLocation = async (
    id: string,
    data: UpdateLocationData
  ): Promise<Location | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS.LOCATIONS.BY_ID(id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error updating location");
      }

      return result.data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error updating location";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteLocation = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS.LOCATIONS.BY_ID(id), {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error deleting location");
      }

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error deleting location";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createLocation,
    updateLocation,
    deleteLocation,
    loading,
    error,
  };
}
