"use client";

import { useCallback, useEffect, useState } from "react";

import { API_ENDPOINTS } from "@/constants";
import type { UserBooking } from "@/types";
import { UserRole } from "@/lib/prisma-browser";
import { useUser } from "@/contexts/user-context";

export function useUserBookings() {
  const { prismaUser, isAuthenticated } = useUser();
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isTherapist = prismaUser?.role?.includes(UserRole.Therapist) ?? false;
  const isAdmin = prismaUser?.role?.includes(UserRole.Admin) ?? false;
  const isFrontDesk = prismaUser?.role?.includes(UserRole.FrontDesk) ?? false;
  const frontDeskManagesAllTherapists = isFrontDesk && !prismaUser?.managedByTherapistId;
  const canManageAppointments = isTherapist || isAdmin || isFrontDesk;
  const canViewCompanyBookings = isTherapist || isAdmin || frontDeskManagesAllTherapists;
  const managedTherapistId = isTherapist
    ? prismaUser?.id ?? null
    : isFrontDesk
      ? prismaUser?.managedByTherapistId ?? null
      : null;

  const fetchBookings = useCallback(async () => {
    if (!isAuthenticated || !prismaUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const scope = canViewCompanyBookings
        ? "company"
        : canManageAppointments
          ? "managed"
          : "self";
      const response = await fetch(
        `${API_ENDPOINTS.BOOKINGS.BASE}?scope=${scope}`,
        {
        cache: "no-store",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBookings(data.data || []);
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
  }, [canManageAppointments, canViewCompanyBookings, isAuthenticated, prismaUser]);

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
    canViewCompanyBookings,
    currentUserId: prismaUser?.id ?? null,
    managedTherapistId,
    frontDeskManagesAllTherapists,
    isAdmin,
    isTherapist,
    isFrontDesk,
    refetch: fetchBookings,
    updateBookingInState,
  };
}
