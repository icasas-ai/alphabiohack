"use client";

import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

interface AvailabilityMonthSummaryBadgesProps {
  monthLabel: string;
  openDays: number;
  remainingSessions: number;
}

export function AvailabilityMonthSummaryBadges({
  monthLabel,
  openDays,
  remainingSessions,
}: AvailabilityMonthSummaryBadgesProps) {
  const t = useTranslations("Availability");

  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant="outline" className="rounded-full px-3 py-1 text-sm font-normal">
        <span className="text-muted-foreground">{t("currentMonth")}:</span>
        <span className="ml-1 font-medium capitalize text-foreground">{monthLabel}</span>
      </Badge>
      <Badge variant="outline" className="rounded-full px-3 py-1 text-sm font-normal">
        <span className="text-muted-foreground">{t("openDays")}:</span>
        <span className="ml-1 font-medium text-foreground">{openDays}</span>
      </Badge>
      <Badge variant="outline" className="rounded-full px-3 py-1 text-sm font-normal">
        <span className="text-muted-foreground">{t("remainingSessions")}:</span>
        <span className="ml-1 font-medium text-foreground">{remainingSessions}</span>
      </Badge>
    </div>
  );
}
