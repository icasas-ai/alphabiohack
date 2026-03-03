"use client";

import { useCallback, useEffect, useState } from "react";

import { API_ENDPOINTS } from "@/constants";
import type { UserBooking } from "@/types";
import { UserRole } from "@prisma/client";
import { useUser } from "@/contexts/user-context";

export function useUserBookings() {
  const { prismaUser, isAuthenticated } = useUser();
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canManageAppointments =
    prismaUser?.role?.includes(UserRole.Therapist) ||
    prismaUser?.role?.includes(UserRole.Admin) ||
    prismaUser?.role?.includes(UserRole.FrontDesk) ||
    false;

  const fetchBookings = useCallback(async () => {
    if (!isAuthenticated || !prismaUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const apiEndpoint = canManageAppointments
        ? API_ENDPOINTS.THERAPISTS.BOOKINGS
        : API_ENDPOINTS.USER.BOOKINGS;

      const response = await fetch(apiEndpoint, {
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
        setError(null);
      } else {
        setError("Error al cargar las citas");
        setBookings([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [canManageAppointments, isAuthenticated, prismaUser]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const updateBookingInState = useCallback((bookingId: string, status: string) => {
    setBookings((current) =>
      current.map((booking) =>
        booking.id === bookingId ? { ...booking, status } : booking
      )
    );
  }, []);

  return {
    bookings,
    loading,
    error,
    canManageAppointments,
    refetch: fetchBookings,
    updateBookingInState,
  };
}
