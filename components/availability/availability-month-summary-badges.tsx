"use client";

import { Info } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

  const items = [
    {
      label: t("currentMonth"),
      value: monthLabel,
      help: t("help.currentMonth"),
      capitalize: true,
      variant: "secondary" as const,
    },
    {
      label: t("openDays"),
      value: String(openDays),
      help: t("help.openDays"),
      variant: "info" as const,
    },
    {
      label: t("remainingSessions"),
      value: String(remainingSessions),
      help: t("help.remainingSessions"),
      variant: "success" as const,
    },
  ];

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge
            key={item.label}
            variant={item.variant}
            className="gap-2 rounded-full px-3 py-1 text-sm font-normal"
          >
            <span className="text-muted-foreground">{item.label}:</span>
            <span
              className={`font-medium text-foreground ${item.capitalize ? "capitalize" : ""}`}
            >
              {item.value}
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="rounded-full text-muted-foreground transition hover:text-foreground"
                  aria-label={`${t("moreInformation")} ${item.label}`}
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-64 text-sm">{item.help}</TooltipContent>
            </Tooltip>
          </Badge>
        ))}
      </div>
    </TooltipProvider>
  );
}
