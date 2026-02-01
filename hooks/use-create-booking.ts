"use client";

import type { CreateBookingRequest, CreateBookingResponse } from "@/types";
import { useCallback, useState } from "react";

import { API_ENDPOINTS } from "@/constants";
import { BookingFormData } from "@/contexts";

export function useCreateBooking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // El hook no muestra toasts; el caller decide UI/UX

  const createBooking = useCallback(
    async (formData: BookingFormData): Promise<CreateBookingResponse> => {
      try {
        setLoading(true);
        setError(null);

        // El backend hará la conversión correcta usando la zona horaria de la ubicación
        // Solo enviar fecha y hora como strings
        const requestData: CreateBookingRequest = {
          bookingType: formData.appointmentType,
          locationId: formData.locationId!,
          specialtyId: formData.specialtyId || undefined,
          serviceId: formData.selectedServiceIds?.[0] || undefined,
          firstname: formData.basicInfo.firstName,
          lastname: formData.basicInfo.lastName,
          phone: formData.basicInfo.phone,
          email: formData.basicInfo.email,
          givenConsent: formData.basicInfo.givenConsent,
          therapistId: formData.therapistId || undefined,
          bookingNotes: formData.basicInfo.bookingNotes || undefined,
          selectedDate: formData.selectedDate!.toISOString().split('T')[0], // YYYY-MM-DD
          selectedTime: formData.selectedTime, // HH:mm
          status: formData.status,
        };

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
          (err as { errorCode?: string })?.errorCode || "internal_error";
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
