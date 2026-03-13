"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { addMonths, eachDayOfInterval, endOfMonth, format, isSameDay, isSameMonth, startOfMonth, subMonths } from 'date-fns';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { CalendarEvent } from '@/lib/utils/calendar';
import { cn } from '@/lib/utils';
import { es } from 'date-fns/locale';
import { useTranslations } from 'next-intl';

interface CalendarDay {
  date: Date;
  events: CalendarEvent[];
  isCurrentMonth: boolean;
  isToday: boolean;
}

interface AppointmentsCalendarProps {
  events: CalendarEvent[];
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onAddEvent?: (date: Date) => void;
  className?: string;
}

export function AppointmentsCalendar({
  events,
  selectedDate,
  onDateSelect,
  onEventClick,
  onAddEvent,
  className
}: AppointmentsCalendarProps) {
  const t = useTranslations('Calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [internalSelectedDate, setInternalSelectedDate] = useState<Date | undefined>(new Date());
  const activeSelectedDate = selectedDate ?? internalSelectedDate;

  // Organizar eventos por fecha
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {};
    
    events.forEach(event => {
      const dateKey = event.dateKey || format(new Date(event.time), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    
    return grouped;
  }, [events]);

  // Generar días del calendario
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });
    
    // Agregar días del mes anterior y siguiente para completar la semana
    const startOfWeek = start.getDay();
    const endOfWeek = 6 - end.getDay();
    
    const prevMonthDays = [];
    const nextMonthDays = [];
    
    // Días del mes anterior
    for (let i = startOfWeek - 1; i >= 0; i--) {
      const date = new Date(start);
      date.setDate(date.getDate() - i - 1);
      prevMonthDays.push(date);
    }
    
    // Días del mes siguiente
    for (let i = 1; i <= endOfWeek; i++) {
      const date = new Date(end);
      date.setDate(date.getDate() + i);
      nextMonthDays.push(date);
    }
    
    const allDays = [...prevMonthDays, ...days, ...nextMonthDays];
    
    return allDays.map(date => {
      const dateKey = format(date, 'yyyy-MM-dd');
      const dayEvents = eventsByDate[dateKey] || [];
      const isCurrentMonth = isSameMonth(date, currentDate);
      const isToday = isSameDay(date, new Date());
      
      return {
        date,
        events: dayEvents,
        isCurrentMonth,
        isToday
      };
    });
  }, [currentDate, eventsByDate]);

  const handleDateClick = (day: CalendarDay) => {
    setInternalSelectedDate(day.date);
    onDateSelect?.(day.date);
  };

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    onEventClick?.(event);
  };

  const handleAddEvent = (date: Date, e: React.MouseEvent) => {
    e.stopPropagation();
    onAddEvent?.(date);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setInternalSelectedDate(new Date());
    onDateSelect?.(new Date());
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">
            {format(currentDate, 'MMMM yyyy', { locale: es })}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="text-xs"
            >
              {t('today')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Días de la semana */}
        <div className="grid grid-cols-7 border-b">
          {[
            t('sunday'),
            t('monday'),
            t('tuesday'),
            t('wednesday'),
            t('thursday'),
            t('friday'),
            t('saturday')
          ].map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground border-r last:border-r-0">
              {day.slice(0, 3)}
            </div>
          ))}
        </div>
        
        {/* Calendario */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={cn(
                "group min-h-[120px] border-r border-b last:border-r-0 p-2 cursor-pointer transition-colors hover:bg-muted/50",
                !day.isCurrentMonth && "bg-muted/30 text-muted-foreground",
                day.isToday && "bg-primary/10",
                activeSelectedDate && isSameDay(day.date, activeSelectedDate) && "bg-primary/20 ring-2 ring-primary/30"
              )}
              onClick={() => handleDateClick(day)}
            >
              {/* Número del día */}
              <div className="flex items-center justify-between mb-1">
                <span className={cn(
                  "text-sm font-medium",
                  day.isToday && "text-primary font-bold"
                )}>
                  {format(day.date, 'd')}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100 hover:opacity-100"
                  onClick={(e) => handleAddEvent(day.date, e)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              
              {/* Eventos */}
              <div className="space-y-1">
                {day.events.slice(0, 3).map((event) => (
                  <Badge
                    key={event.id}
                    variant="secondary"
                    className={cn(
                      "w-full text-xs cursor-pointer hover:opacity-80 transition-opacity",
                      event.type === 'appointment' && "bg-primary/10 text-primary hover:bg-primary/20",
                      event.type === 'task' && "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/30",
                      event.type === 'event' && "bg-purple-100 text-purple-800 hover:bg-purple-200"
                    )}
                    onClick={(e) => handleEventClick(event, e)}
                  >
                    <div className="truncate">
                      {event.title}
                    </div>
                  </Badge>
                ))}
                
                {/* Indicador de más eventos */}
                {day.events.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center">
                    {t('moreEvents', { count: day.events.length - 3 })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
