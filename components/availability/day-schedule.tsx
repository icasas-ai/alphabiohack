import { Calendar, Clock, Plus, Settings, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DaySchedule } from "@/types";
import { DaysOfWeek } from "@/lib/prisma-browser";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { getTimeSlotDuration } from "@/types";
import { useTranslations } from "next-intl";

interface DayScheduleProps {
  day: DaySchedule;
  onToggleDay: (dayOfWeek: DaysOfWeek, enabled: boolean) => void;
  onAddTimeSlot: (dayOfWeek: DaysOfWeek) => void;
  onRemoveTimeSlot: (dayOfWeek: DaysOfWeek, slotIndex: number) => void;
  onTimeSlotChange: (
    dayOfWeek: DaysOfWeek,
    slotIndex: number,
    field: "startTime" | "endTime",
    value: string
  ) => void;
  operationsLoading: boolean;
  deletingSlots: Set<string>;
}

export function DayScheduleComponent({
  day,
  onToggleDay,
  onAddTimeSlot,
  onRemoveTimeSlot,
  onTimeSlotChange,
  operationsLoading,
  deletingSlots,
}: DayScheduleProps) {
  const t = useTranslations("Availability");

  const getDayName = (dayOfWeek: DaysOfWeek): string => {
    const dayNames = {
      [DaysOfWeek.Monday]: t("monday"),
      [DaysOfWeek.Tuesday]: t("tuesday"),
      [DaysOfWeek.Wednesday]: t("wednesday"),
      [DaysOfWeek.Thursday]: t("thursday"),
      [DaysOfWeek.Friday]: t("friday"),
      [DaysOfWeek.Saturday]: t("saturday"),
      [DaysOfWeek.Sunday]: t("sunday"),
    };
    return dayNames[dayOfWeek];
  };

  const getDuration = (startTime: string, endTime: string): string => {
    const duration = getTimeSlotDuration(startTime, endTime);
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;

    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  };

  return (
    <div className="w-full">
      {/* Day Header - Mobile Optimized */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900/20 rounded-lg p-4 mb-4 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Day Info */}
          <div className="flex items-center gap-3">
            <Switch
              checked={day.isEnabled}
              onCheckedChange={(checked: boolean) =>
                onToggleDay(day.dayOfWeek, checked)
              }
              disabled={operationsLoading}
              className="flex-shrink-0"
            />
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <Label className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {getDayName(day.dayOfWeek)}
              </Label>
            </div>
            <Badge 
              variant={day.isEnabled ? "default" : "secondary"}
              className={`flex-shrink-0 ${
                day.isEnabled 
                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800" 
                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700"
              }`}
            >
              {day.isEnabled ? t("enabled") : t("disabled")}
            </Badge>
          </div>

          {/* Add Button */}
          {day.isEnabled && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddTimeSlot(day.dayOfWeek)}
              disabled={operationsLoading}
              className="self-start sm:self-center bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{t("addTimeSlot")}</span>
              <span className="sm:hidden">{t("add")}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Time Slots - Mobile Optimized */}
      {day.isEnabled && (
        <div className="space-y-3">
          {day.timeSlots.length === 0 ? (
            <div className="text-center py-8 px-4">
              <Clock className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground italic">
                {t("noSlotsForDay")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t("addTimeSlotToGetStarted")}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {day.timeSlots.map((slot, slotIndex) => (
                <TimeSlotComponent
                  key={slotIndex}
                  slot={slot}
                  slotIndex={slotIndex}
                  dayOfWeek={day.dayOfWeek}
                  onRemoveTimeSlot={onRemoveTimeSlot}
                  onTimeSlotChange={onTimeSlotChange}
                  operationsLoading={operationsLoading}
                  deletingSlots={deletingSlots}
                  getDuration={getDuration}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Separator */}
      <Separator className="mt-6" />
    </div>
  );
}

interface TimeSlotComponentProps {
  slot: { startTime: string; endTime: string };
  slotIndex: number;
  dayOfWeek: DaysOfWeek;
  onRemoveTimeSlot: (dayOfWeek: DaysOfWeek, slotIndex: number) => void;
  onTimeSlotChange: (
    dayOfWeek: DaysOfWeek,
    slotIndex: number,
    field: "startTime" | "endTime",
    value: string
  ) => void;
  operationsLoading: boolean;
  deletingSlots: Set<string>;
  getDuration: (startTime: string, endTime: string) => string;
}

function TimeSlotComponent({
  slot,
  slotIndex,
  dayOfWeek,
  onRemoveTimeSlot,
  onTimeSlotChange,
  operationsLoading,
  deletingSlots,
  getDuration,
}: TimeSlotComponentProps) {
  const t = useTranslations("Availability");

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Mobile Layout */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Time Inputs */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Start Time */}
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">
              {t("startTime")}
            </Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input
                type="time"
                value={slot.startTime}
                onChange={(e) =>
                  onTimeSlotChange(dayOfWeek, slotIndex, "startTime", e.target.value)
                }
                className="pl-10 w-full sm:w-32 h-10 text-sm border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                disabled={operationsLoading}
              />
            </div>
          </div>

          {/* End Time */}
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">
              {t("endTime")}
            </Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input
                type="time"
                value={slot.endTime}
                onChange={(e) =>
                  onTimeSlotChange(dayOfWeek, slotIndex, "endTime", e.target.value)
                }
                className="pl-10 w-full sm:w-32 h-10 text-sm border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                disabled={operationsLoading}
              />
            </div>
          </div>
        </div>

        {/* Duration Badge */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <Badge 
            variant="outline" 
            className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800 px-3 py-1"
          >
            <Settings className="h-3 w-3 mr-1" />
            {getDuration(slot.startTime, slot.endTime)}
          </Badge>

          {/* Delete Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemoveTimeSlot(dayOfWeek, slotIndex)}
            disabled={
              operationsLoading ||
              deletingSlots.has(`${dayOfWeek}-${slotIndex}`)
            }
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 p-2 h-10 w-10"
          >
            {deletingSlots.has(`${dayOfWeek}-${slotIndex}`) ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 dark:border-red-400"></div>
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
