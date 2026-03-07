"use client"

import { Clock, MapPin } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import type { CalendarEvent } from '@/lib/utils/calendar';
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import { normalizeBookingStatus } from '@/lib/utils/calendar';
import { useTranslations } from 'next-intl';

interface EventListProps {
  date: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  className?: string;
}

function getStatusTone(status?: string) {
  switch (normalizeBookingStatus(status)) {
    case 'confirmed':
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900/40';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-900/40';
    case 'needsattention':
      return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-900/40';
    case 'inprogress':
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/40';
    case 'completed':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-900/40';
    case 'noshow':
      return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-900/40';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/40';
    default:
      return 'bg-muted text-foreground/80 border-border';
  }
}

function getStatusText(
  status: string | undefined,
  t: ReturnType<typeof useTranslations>
) {
  switch (normalizeBookingStatus(status)) {
    case 'confirmed':
      return t('confirmed');
    case 'pending':
      return t('pending');
    case 'needsattention':
      return t('needsAttention');
    case 'inprogress':
      return t('inProgress');
    case 'completed':
      return t('completed');
    case 'noshow':
      return t('noShow');
    case 'cancelled':
      return t('cancelled');
    default:
      return status || '';
  }
}

export function EventList({ date, events, onEventClick, className }: EventListProps) {
  const t = useTranslations('Calendar');
  const sortedEvents = [...events].sort((a, b) => {
    const timeA = new Date(a.time).getTime();
    const timeB = new Date(b.time).getTime();
    return timeA - timeB;
  });

  return (
    <div className={cn("overflow-hidden rounded-xl border bg-card", className)}>
      <div className="border-b px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">
              {format(date, 'EEEE, d \'de\' MMMM', { locale: es })}
            </h3>
            <p className="text-sm text-muted-foreground">
              {events.length
                ? t('eventsCount', { count: events.length })
                : t('noEvents')}
            </p>
          </div>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
          {t('noEvents')}
        </div>
      ) : (
        <ScrollArea className="max-h-[520px]">
          <div className="divide-y pb-2">
            {sortedEvents.map((event) => (
              <button
                key={event.id}
                type="button"
                className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 last:pb-4"
                onClick={() => onEventClick?.(event)}
              >
                <div className="min-w-12 pt-0.5 text-sm font-semibold text-foreground">
                  {event.displayTime || format(new Date(event.time), 'HH:mm')}
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium" title={event.patientName || event.title}>
                        {event.patientName || event.title}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {event.location ? (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="truncate" title={event.location}>{event.location}</span>
                          </span>
                        ) : null}
                        {event.duration ? (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {event.duration} {t('minutes')}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {event.status ? (
                      <Badge variant="outline" className={cn("shrink-0", getStatusTone(event.status))}>
                        {getStatusText(event.status, t)}
                      </Badge>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {event.specialty ? (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        {event.specialty}
                      </Badge>
                    ) : null}
                    {event.service ? (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-900/40">
                        {event.service}
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
