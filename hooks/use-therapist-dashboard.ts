"use client";

import { useEffect, useState } from "react";
import { readJsonResponse } from "@/lib/utils/read-json-response";

interface TherapistDashboardData {
  kpis: {
    totalPatients: number;
    patientsToday: number;
    appointmentsToday: number;
    hoursToday: number;
  };
  kpisRange?: {
    appointments?: { value: number; deltaPercent: number };
    patients?: { value: number; deltaPercent: number };
  };
  range?: { from: string; to: string };
  timeZone?: string;
  appointments: Array<{
    id: string;
    bookingSchedule?: string;
    date: string;
    time: string;
    timeZone?: string;
    name: string;
    service?: string;
    location?: string;
  }>;
  upcoming: {
    id: string;
    bookingSchedule?: string;
    date: string;
    time: string;
    timeZone?: string;
    name: string;
    service?: string;
    location?: string;
  } | null;
  recentPatients: Array<{
    id: string;
    name: string;
    lastAppointment?: string | null;
    code?: string;
  }>;
  weeklyOverview?: Array<{ day: string; value: number }>;
  series?: {
    appointmentsDaily: Array<{ date: string; value: number }>;
    pendingDaily: Array<{ date: string; value: number }>;
    completedDaily: Array<{ date: string; value: number }>;
  };
  statusCounts?: Record<string, number>;
  invoices: Array<Record<string, unknown>>;
}

type RangeKey = "last7" | "today" | "thisWeek" | "last30" | "all";

export function useTherapistDashboard(opts?: { range?: RangeKey }) {
  const [data, setData] = useState<TherapistDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const range = opts?.range ?? "last7";

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const qs = new URLSearchParams();
        qs.set("range", range);
        const url = `/api/dashboard/therapist${
          qs.toString() ? `?${qs.toString()}` : ""
        }`;
        const res = await fetch(url);
        const json = await readJsonResponse<{
          success?: boolean;
          error?: string;
          data?: TherapistDashboardData;
        }>(res);

        if (!res.ok || !json?.success || !json.data) {
          throw new Error(json?.error || "Failed");
        }

        setData(json.data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [range]);

  return { data, loading, error };
}
