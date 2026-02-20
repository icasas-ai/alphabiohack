"use client";

import { useTranslations } from "next-intl";
import { useUser } from "@/contexts/user-context";

interface BusinessHoursProps {
  weekdays?: string;
  saturday?: string;
  sunday?: string;
  className?: string;
  weekdaysHours?: string | null;
  saturdayHours?: string | null;
  sundayHours?: string | null;
}

interface UserBusinessHours {
  weekdaysHours?: string;
  saturdayHours?: string;
  sundayHours?: string;
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
  const { prismaUser } = useUser();

  const user = prismaUser as UserBusinessHours | null;

  // Usar datos de los props si vienen (datos públicos), sino del usuario autenticado, sino defaults
  const weekdaysHours = propsWeekdaysHours || user?.weekdaysHours || weekdays || "9:00 AM - 6:00 PM";
  const saturdayHours = propsSaturdayHours || user?.saturdayHours || saturday || "9:00 AM - 2:00 PM";
  const sundayHours = propsSundayHours || user?.sundayHours || sunday || "Closed";

  return (
    <div className={`p-6 rounded-lg bg-card text-card-foreground ${className || ''}`}>
      <h3 className="font-semibold mb-3 text-foreground">{t('businessHours')}</h3>
      <div className="space-y-2 text-sm text-muted-foreground">
        <p><span className="font-medium text-foreground">{t('weekdays')}:</span> {weekdaysHours}</p>
        <p><span className="font-medium text-foreground">{t('saturday')}:</span> {saturdayHours}</p>
        <p><span className="font-medium text-foreground">{t('sunday')}:</span> {sundayHours}</p>
      </div>
    </div>
  );
}


