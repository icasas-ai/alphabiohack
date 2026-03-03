"use client"

import { PST_TZ, dateKeyInTZ } from '@/lib/utils/timezone';
import React, { useMemo, useState } from 'react';

import { AppointmentsCalendar } from './appointments-calendar';
import type { CalendarEvent } from '@/lib/utils/calendar';
import { EventDetailsDialog } from './event-details-dialog';
import { EventList } from './event-list';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslations } from 'next-intl';

interface CalendarViewProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onEventEdit?: (event: CalendarEvent) => void;
  onEventCancel?: (event: CalendarEvent) => void;
  onEventStatusChange?: (event: CalendarEvent, status: import('@/lib/utils/booking-status').BookingStatusValue) => Promise<void> | void;
  updatingStatus?: boolean;
  onAddEvent?: (date: Date) => void;
  className?: string;
}

export function CalendarView({
  events,
  onEventClick,
  onEventEdit,
  onEventCancel,
  onEventStatusChange,
  updatingStatus = false,
  onAddEvent,
  className
}: CalendarViewProps) {
  const t = useTranslations('Bookings');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [locationFilter, setLocationFilter] = useState<string>("all");

  const locationOptions = useMemo(
    () =>
      Array.from(
        new Map(
          events
            .filter((event) => event.locationId && event.location)
            .map((event) => [event.locationId as string, event.location as string]),
        ).entries(),
      ).map(([id, title]) => ({ id, title })),
    [events],
  );

  const filteredEvents = useMemo(() => {
    if (locationFilter === "all") return events;
    return events.filter((event) => event.locationId === locationFilter);
  }, [events, locationFilter]);

  // Filtrar eventos del día seleccionado
  const dayEvents = useMemo(() => {
    const dateKey = dateKeyInTZ(selectedDate, PST_TZ);
    return filteredEvents.filter(event => {
      const eventDate = event.dateKey || dateKeyInTZ(new Date(event.time), PST_TZ);
      return eventDate === dateKey;
    });
  }, [filteredEvents, selectedDate]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
    onEventClick?.(event);
  };

  const handleEventCancel = (event: CalendarEvent) => {
    setIsDialogOpen(false);
    onEventCancel?.(event);
  };

  const handleEventEdit = (event: CalendarEvent) => {
    setIsDialogOpen(false);
    onEventEdit?.(event);
  };

  const handleAddEvent = (date: Date) => {
    setSelectedDate(date);
    onAddEvent?.(date);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedEvent(null);
  };

  return (
    <div className={cn("grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]", className)}>
      <div className="space-y-4">
        <div className="flex justify-end">
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-full sm:w-[240px]">
              <SelectValue placeholder={t("filterByLocation")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allLocations")}</SelectItem>
              {locationOptions.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <AppointmentsCalendar
          events={filteredEvents}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          onEventClick={handleEventClick}
          onAddEvent={handleAddEvent}
        />
      </div>

      <EventList
        date={selectedDate}
        events={dayEvents}
        onEventClick={handleEventClick}
        className="h-fit xl:sticky xl:top-4"
      />

      {/* Dialog de detalles */}
      <EventDetailsDialog
        event={selectedEvent}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onEdit={handleEventEdit}
        onCancel={handleEventCancel}
        onStatusChange={onEventStatusChange}
        updatingStatus={updatingStatus}
      />
    </div>
  );
}
