"use client";

import { useCallback, useEffect, useState } from "react";

import { API_ENDPOINTS } from "@/constants";

interface AvailabilityMonthDay {
  id: string;
  date: string;
  isAvailable: boolean;
  sessionDurationMinutes: number;
  totalSlots: number;
  bookedSlots: number;
  remainingSlots: number;
  hasAvailability: boolean;
  timeRanges: Array<{
    id: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
  }>;
}

interface AvailabilityMonthSummary {
  month: string;
  totalDays: number;
  availableDays: number;
  totalRemainingSlots: number;
  days: AvailabilityMonthDay[];
}

interface AvailabilityDaySlots {
  date: string;
  sessionDurationMinutes: number;
  slots: Array<{
    value: string;
    isAvailable: boolean;
  }>;
}

export function useAvailabilityCalendar(
  therapistId?: string | null,
  locationId?: string | null,
  month?: string,
  date?: string,
) {
  const [monthSummary, setMonthSummary] = useState<AvailabilityMonthSummary | null>(null);
  const [daySlots, setDaySlots] = useState<AvailabilityDaySlots | null>(null);
  const [monthLoading, setMonthLoading] = useState(false);
  const [dayLoading, setDayLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMonthSummary = useCallback(async () => {
    if (!therapistId || !locationId || !month) {
      setMonthSummary(null);
      return null;
    }

    try {
      setMonthLoading(true);
      setError(null);
      const qs = new URLSearchParams({
        therapistId,
        locationId,
        month,
      });
      const response = await fetch(`${API_ENDPOINTS.AVAILABILITY.CALENDAR}?${qs.toString()}`, {
        cache: "no-store",
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Error loading availability");
      }

      setMonthSummary(result.data);
      return result.data as AvailabilityMonthSummary;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading availability");
      setMonthSummary(null);
      return null;
    } finally {
      setMonthLoading(false);
    }
  }, [therapistId, locationId, month]);

  const fetchDaySlots = useCallback(async () => {
    if (!therapistId || !locationId || !date) {
      setDaySlots(null);
      return null;
    }

    try {
      setDayLoading(true);
      setError(null);
      const qs = new URLSearchParams({
        therapistId,
        locationId,
        date,
      });
      const response = await fetch(`${API_ENDPOINTS.AVAILABILITY.CALENDAR}?${qs.toString()}`, {
        cache: "no-store",
      });
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Error loading day slots");
      }

      setDaySlots(result.data);
      return result.data as AvailabilityDaySlots;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading day slots");
      setDaySlots(null);
      return null;
    } finally {
      setDayLoading(false);
    }
  }, [therapistId, locationId, date]);

  useEffect(() => {
    fetchMonthSummary();
  }, [fetchMonthSummary]);

  useEffect(() => {
    fetchDaySlots();
  }, [fetchDaySlots]);

  return {
    monthSummary,
    daySlots,
    loading: monthLoading || dayLoading,
    monthLoading,
    dayLoading,
    error,
    refetchMonthSummary: fetchMonthSummary,
    refetchDaySlots: fetchDaySlots,
  };
}
