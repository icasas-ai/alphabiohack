"use client";

import type { CreateBookingRequest, CreateBookingResponse } from "@/types";
import { useCallback, useState } from "react";

import { API_ENDPOINTS } from "@/constants";
import { BookingFormData } from "@/contexts";
import { buildCreateBookingRequestFromWizard } from "@/lib/utils/booking-request";

async function getLocationTimezone(locationId: string) {
  const response = await fetch(API_ENDPOINTS.LOCATIONS.BY_ID(locationId), {
    cache: "no-store",
  });
  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.errorCode || "internal_error");
  }

  const timezone = result?.data?.location?.timezone || result?.data?.timezone;
  if (!timezone || !String(timezone).trim()) {
    throw new Error("validation.location_timezone_required");
  }

  return timezone as string;
}

export function useCreateBooking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // El hook no muestra toasts; el caller decide UI/UX

  const createBooking = useCallback(
    async (formData: BookingFormData): Promise<CreateBookingResponse> => {
      try {
        setLoading(true);
        setError(null);

        const timezone = await getLocationTimezone(formData.locationId!);
        const requestData: CreateBookingRequest =
          buildCreateBookingRequestFromWizard(formData, timezone);

        const res = await fetch(API_ENDPOINTS.BOOKINGS.BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData),
        });
        const json = await res.json();
        if (!res.ok) {
          const errorCode: string | undefined = json?.errorCode;
          return {
            success: false,
            error: errorCode || "internal_error",
          } as CreateBookingResponse;
        }
        return json as CreateBookingResponse;
      } catch (err) {
        console.error("Error creating booking:", err);
        const code =
          (err as { errorCode?: string })?.errorCode ||
          (err instanceof Error ? err.message : undefined) ||
          "internal_error";
        setError(code);
        return { success: false, error: code } as CreateBookingResponse;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    createBooking,
    loading,
    error,
  };
}
