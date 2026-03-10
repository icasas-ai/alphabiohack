"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { getTimeZoneDifferenceHours } from "@/lib/utils/timezone";

type Namespace = "Booking" | "Bookings";

interface TimeZoneDifferenceNoteProps {
  officeTimeZone: string;
  date?: Date | null;
  namespace: Namespace;
  className?: string;
}

function formatHours(hours: number): string {
  const rounded = Math.round(hours * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function TimeZoneDifferenceNote({
  officeTimeZone,
  date,
  namespace,
  className = "text-xs text-muted-foreground",
}: TimeZoneDifferenceNoteProps) {
  const t = useTranslations(namespace);

  const message = useMemo(() => {
    const viewerTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!viewerTimeZone) return null;

    const differenceHours = getTimeZoneDifferenceHours(
      officeTimeZone,
      viewerTimeZone,
      date ?? new Date(),
    );

    if (differenceHours === 0) {
      return t("timeZoneDifferenceSame");
    }

    const hours = formatHours(Math.abs(differenceHours));
    return differenceHours > 0
      ? t("timeZoneDifferenceAhead", { hours })
      : t("timeZoneDifferenceBehind", { hours });
  }, [date, officeTimeZone, t]);

  if (!message) return null;

  return <p className={className}>{message}</p>;
}
