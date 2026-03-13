"use client";

import { useTranslations } from "next-intl";

interface BusinessHoursProps {
  weekdays?: string;
  saturday?: string;
  sunday?: string;
  className?: string;
  weekdaysHours?: string | null;
  saturdayHours?: string | null;
  sundayHours?: string | null;
}

export function BusinessHours({
  weekdays,
  saturday,
  sunday,
  className,
  weekdaysHours: propsWeekdaysHours,
  saturdayHours: propsSaturdayHours,
  sundayHours: propsSundayHours,
}: BusinessHoursProps) {
  const t = useTranslations('Contact');

  const weekdaysHours = propsWeekdaysHours || weekdays || "9:00 AM - 6:00 PM";
  const saturdayHours = propsSaturdayHours || saturday || "9:00 AM - 2:00 PM";
  const sundayHours = propsSundayHours || sunday || "Closed";

  return (
    <div className={`surface-panel overflow-hidden rounded-[24px] p-6 ${className || ''}`}>
      <div className="mb-5 flex items-center justify-between gap-4">
        <h3 className="font-semibold text-foreground">{t('businessHours')}</h3>
      </div>
      <div className="space-y-3 text-sm text-muted-foreground">
        <div className="surface-inset flex items-center justify-between gap-4 rounded-[24px] px-4 py-3">
          <span className="font-medium text-foreground">{t('weekdays')}</span>
          <span>{weekdaysHours}</span>
        </div>
        <div className="surface-inset flex items-center justify-between gap-4 rounded-[24px] px-4 py-3">
          <span className="font-medium text-foreground">{t('saturday')}</span>
          <span>{saturdayHours}</span>
        </div>
        <div className="surface-inset flex items-center justify-between gap-4 rounded-[24px] px-4 py-3">
          <span className="font-medium text-foreground">{t('sunday')}</span>
          <span>{sundayHours}</span>
        </div>
      </div>
    </div>
  );
}
