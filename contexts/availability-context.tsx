"use client";

import { createContext, useContext, useCallback, useEffect, useRef, useState } from "react";

import { API_ENDPOINTS } from "@/constants";
import { DaysOfWeek } from "@prisma/client";
import { toast } from "sonner";
import type { AvailabilityFormData, DaySchedule, TimeSlot as TimeSlotType } from "@/types";
import { useAvailabilityOperations } from "@/hooks/use-availability-operations";
import { useBusinessHours } from "@/hooks/use-business-hours";

interface AvailabilityContextType {
  days: DaySchedule[];
  hasChanges: boolean;
  isSaving: boolean;
  loading: boolean;
  error: string | null;
  handleToggleDay: (dayOfWeek: DaysOfWeek, enabled: boolean) => void;
  handleAddTimeSlot: (dayOfWeek: DaysOfWeek) => void;
  handleRemoveTimeSlot: (dayOfWeek: DaysOfWeek, slotIndex: number) => Promise<void>;
  handleTimeSlotChange: (
    dayOfWeek: DaysOfWeek,
    slotIndex: number,
    field: "startTime" | "endTime",
    value: string
  ) => void;
  handleSave: (onSave?: (data: AvailabilityFormData) => void) => Promise<void>;
  operationsLoading: boolean;
  deletingSlots: Set<string>;
}

const AvailabilityContext = createContext<AvailabilityContextType | undefined>(undefined);

export function useAvailabilityContext() {
  const context = useContext(AvailabilityContext);
  if (!context) {
    throw new Error("useAvailabilityContext must be used within AvailabilityProvider");
  }
  return context;
}

interface AvailabilityProviderProps {
  locationId: string;
  children: React.ReactNode;
}

export function AvailabilityProvider({ locationId, children }: AvailabilityProviderProps) {
  const {
    businessHours,
    loading: fetchLoading,
    refetch,
  } = useBusinessHours(locationId);
  const {
    deleteTimeSlot,
    loading: operationsLoading,
    error,
  } = useAvailabilityOperations();

  const [days, setDays] = useState<DaySchedule[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingSlots, setDeletingSlots] = useState<Set<string>>(new Set());
  const toggleTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Inicializar días de la semana
  useEffect(() => {
    if (!isInitialized) {
      const initialDays: DaySchedule[] = [
        DaysOfWeek.Monday,
        DaysOfWeek.Tuesday,
        DaysOfWeek.Wednesday,
        DaysOfWeek.Thursday,
        DaysOfWeek.Friday,
        DaysOfWeek.Saturday,
        DaysOfWeek.Sunday,
      ].map((day) => ({
        dayOfWeek: day,
        isEnabled: false,
        timeSlots: [],
        businessHoursId: undefined,
      }));
      setDays(initialDays);
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Cargar horarios existentes - SOLO UNA VEZ al inicializar
  useEffect(() => {
    if (businessHours && businessHours.length > 0 && !hasChanges && isInitialized) {
      const updatedDays = days.map((day) => {
        const dayHours = businessHours.find(
          (bh) => bh.dayOfWeek === day.dayOfWeek
        );

        return {
          ...day,
          isEnabled: dayHours ? dayHours.isActive : false,
          businessHoursId: dayHours?.id,
          timeSlots:
            dayHours?.timeSlots?.map((ts: TimeSlotType) => ({
              id: ts.id,
              startTime: ts.startTime,
              endTime: ts.endTime,
              isActive: ts.isActive,
              businessHoursId: ts.businessHoursId,
            })) || [],
        };
      });

      setDays(updatedDays);
    }
  }, [businessHours, isInitialized]);

  // Cleanup timeouts al desmontar
  useEffect(() => {
    return () => {
      toggleTimeoutRef.current.forEach((timeout) => {
        clearTimeout(timeout);
      });
      toggleTimeoutRef.current.clear();
    };
  }, []);

  const handleToggleDay = useCallback((dayOfWeek: DaysOfWeek, enabled: boolean) => {
    const dayKey = `${dayOfWeek}-${enabled}`;

    // Limpiar timeout anterior si existe
    const existingTimeout = toggleTimeoutRef.current.get(dayKey);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Crear nuevo timeout para debounce
    const timeoutId = setTimeout(() => {
      setDays((prevDays) =>
        prevDays.map((day) => {
          if (day.dayOfWeek === dayOfWeek) {
            return {
              ...day,
              isEnabled: enabled,
              timeSlots: day.timeSlots, // SIEMPRE mantener los slots, solo cambiar isEnabled
            };
          }
          return day;
        })
      );
      setHasChanges(true);

      // Limpiar el timeout del mapa
      toggleTimeoutRef.current.delete(dayKey);
    }, 100); // Debounce de 100ms

    // Guardar el timeout en el mapa
    toggleTimeoutRef.current.set(dayKey, timeoutId);
  }, [hasChanges]);

  const handleAddTimeSlot = useCallback((dayOfWeek: DaysOfWeek) => {
    setDays((prevDays) =>
      prevDays.map((day) =>
        day.dayOfWeek === dayOfWeek
          ? {
              ...day,
              timeSlots: [
                ...day.timeSlots,
                {
                  startTime: "09:00",
                  endTime: "17:00",
                  isActive: true,
                },
              ],
            }
          : day
      )
    );
    setHasChanges(true);
  }, []);

  const handleRemoveTimeSlot = useCallback(async (
    dayOfWeek: DaysOfWeek,
    slotIndex: number
  ) => {
    const day = days.find((d) => d.dayOfWeek === dayOfWeek);
    const slot = day?.timeSlots[slotIndex];

    if (!slot) return;

    if (slot.id) {
      const slotKey = `${dayOfWeek}-${slotIndex}`;
      setDeletingSlots((prev) => new Set(prev).add(slotKey));

      try {
        await deleteTimeSlot(slot.id);
        setDays((prevDays) =>
          prevDays.map((day) =>
            day.dayOfWeek === dayOfWeek
              ? {
                  ...day,
                  timeSlots: day.timeSlots.filter(
                    (_, index) => index !== slotIndex
                  ),
                }
              : day
          )
        );
        await refetch();
      } catch (err) {
        console.error("Error removing time slot:", err);
      } finally {
        setDeletingSlots((prev) => {
          const newSet = new Set(prev);
          newSet.delete(slotKey);
          return newSet;
        });
      }
    } else {
      setDays((prevDays) =>
        prevDays.map((day) =>
          day.dayOfWeek === dayOfWeek
            ? {
                ...day,
                timeSlots: day.timeSlots.filter(
                  (_, index) => index !== slotIndex
                ),
              }
            : day
        )
      );
      setHasChanges(true);
    }
  }, [days, deleteTimeSlot, refetch]);

  const handleTimeSlotChange = useCallback((
    dayOfWeek: DaysOfWeek,
    slotIndex: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setDays((prevDays) =>
      prevDays.map((day) =>
        day.dayOfWeek === dayOfWeek
          ? {
              ...day,
              timeSlots: day.timeSlots.map((slot, index) =>
                index === slotIndex
                  ? { ...slot, [field]: value }
                  : slot
              ),
            }
          : day
      )
    );
    setHasChanges(true);
  }, []);

  const handleSave = useCallback(async (onSave?: (data: AvailabilityFormData) => void) => {
    setIsSaving(true);
    try {
      for (const day of days) {
        if (day.isEnabled) {
          let businessHoursId = day.businessHoursId;

          if (!businessHoursId) {
            const businessHoursData = {
              dayOfWeek: day.dayOfWeek,
              locationId,
              isActive: true,
            };

            const response = await fetch(
              API_ENDPOINTS.BUSINESS_HOURS.BY_LOCATION(locationId),
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(businessHoursData),
              }
            );

            const result = await response.json();
            if (!response.ok) {
              throw new Error(result.error || "Error creating business hours");
            }

            businessHoursId = result.data.id;
          } else {
            await fetch(API_ENDPOINTS.BUSINESS_HOURS.BY_ID(locationId, businessHoursId), {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ isActive: true }),
            });
          }

          const updatedSlots: TimeSlotType[] = [];
          for (const slot of day.timeSlots) {
            if (slot.id) {
              await fetch(API_ENDPOINTS.TIME_SLOTS.BY_ID(slot.id), {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                  isActive: slot.isActive ?? true,
                }),
              });
              updatedSlots.push(slot);
            } else {
              const slotData = {
                startTime: slot.startTime,
                endTime: slot.endTime,
                businessHoursId,
                isActive: slot.isActive ?? true,
              };

              const response = await fetch(API_ENDPOINTS.TIME_SLOTS.BASE, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(slotData),
              });

              const result = await response.json();
              if (response.ok && result.data) {
                updatedSlots.push({
                  ...slot,
                  id: result.data.id,
                  businessHoursId: result.data.businessHoursId,
                });
              }
            }
          }

          setDays((prevDays) =>
            prevDays.map((d) =>
              d.dayOfWeek === day.dayOfWeek
                ? {
                    ...d,
                    businessHoursId,
                    timeSlots: updatedSlots,
                  }
                : d
            )
          );
        } else if (day.businessHoursId) {
          await fetch(API_ENDPOINTS.BUSINESS_HOURS.BY_ID(locationId, day.businessHoursId), {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: false }),
          });
        }
      }

      setHasChanges(false);

      if (onSave) {
        const formData: AvailabilityFormData = {
          locationId,
          days,
        };
        onSave(formData);
      }

      toast.success("Availability has been saved", {
        description: "Monday, December 03, 2023 at 9:00 AM",
      });
    } catch (error) {
      console.error("Error saving availability:", error);
    } finally {
      setIsSaving(false);
    }
  }, [days, locationId]);

  const value: AvailabilityContextType = {
    days,
    hasChanges,
    isSaving,
    loading: fetchLoading,
    error,
    handleToggleDay,
    handleAddTimeSlot,
    handleRemoveTimeSlot,
    handleTimeSlotChange,
    handleSave,
    operationsLoading,
    deletingSlots,
  };

  return (
    <AvailabilityContext.Provider value={value}>
      {children}
    </AvailabilityContext.Provider>
  );
}
