"use client";

import type {
  AvailabilityFormData,
  AvailabilityOperations,
  CreateBusinessHoursData,
  CreateTimeSlotData,
  TimeSlot,
  UpdateBusinessHoursData,
  UpdateTimeSlotData,
} from "@/types";
import { useCallback, useState } from "react";

import { API_ENDPOINTS } from "@/constants";
import { DaysOfWeek } from "@prisma/client";

export function useAvailabilityOperations(): AvailabilityOperations {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTimeSlot = useCallback(
    async (businessHoursId: string, timeSlot: TimeSlot) => {
      setLoading(true);
      setError(null);

      try {
        const data: CreateTimeSlotData = {
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
          businessHoursId,
          isActive: timeSlot.isActive ?? true,
        };

        const response = await fetch(API_ENDPOINTS.TIME_SLOTS.BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Error creating time slot");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error creating time slot";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateTimeSlot = useCallback(
    async (timeSlotId: string, timeSlot: TimeSlot) => {
      setLoading(true);
      setError(null);

      try {
        const data: UpdateTimeSlotData = {
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
          isActive: timeSlot.isActive,
        };

        const response = await fetch(
          API_ENDPOINTS.TIME_SLOTS.BY_ID(timeSlotId),
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Error updating time slot");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error updating time slot";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteTimeSlot = useCallback(async (timeSlotId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS.TIME_SLOTS.BY_ID(timeSlotId), {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Error deleting time slot");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error deleting time slot";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleDayEnabled = useCallback(
    async (locationId: string, dayOfWeek: DaysOfWeek, enabled: boolean) => {
      setLoading(true);
      setError(null);

      try {
        if (enabled) {
          // Crear BusinessHours para el día si no existe
          const businessHoursData: CreateBusinessHoursData = {
            dayOfWeek,
            locationId,
            isActive: true,
          };

          const response = await fetch(API_ENDPOINTS.BUSINESS_HOURS.BY_LOCATION(locationId), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(businessHoursData),
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || "Error creating business hours");
          }

          // Crear un horario por defecto
          const defaultTimeSlot: TimeSlot = {
            startTime: "09:00",
            endTime: "17:00",
            isActive: true,
            businessHoursId: result.data.id,
            id: ""  ,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          await createTimeSlot(result.data.id, defaultTimeSlot);
        } else {
          // Deshabilitar BusinessHours para el día
          const response = await fetch(
            API_ENDPOINTS.BUSINESS_HOURS.BY_DAY_AND_LOCATION(locationId, dayOfWeek)
          );
          const result = await response.json();

          if (response.ok && result.data) {
            const updateData: UpdateBusinessHoursData = {
              isActive: false,
            };

            await fetch(API_ENDPOINTS.BUSINESS_HOURS.BY_ID(locationId, result.data.id), {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updateData),
            });
          }
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error toggling day enabled";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [createTimeSlot]
  );

  const updateLocationAvailability = useCallback(
    async (data: AvailabilityFormData) => {
      setLoading(true);
      setError(null);

      try {
        // Procesar cada día
        for (const day of data.days) {
          if (day.isEnabled) {
            // Crear o actualizar BusinessHours para el día
            let businessHoursId = day.businessHoursId;

            if (!businessHoursId) {
              const businessHoursData: CreateBusinessHoursData = {
                dayOfWeek: day.dayOfWeek,
                locationId: data.locationId,
                isActive: true,
              };

              const response = await fetch(API_ENDPOINTS.BUSINESS_HOURS.BY_LOCATION(data.locationId), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(businessHoursData),
              });

              const result = await response.json();

              if (!response.ok) {
                throw new Error(
                  result.error || "Error creating business hours"
                );
              }

              businessHoursId = result.data.id;
            }

            // Crear los time slots
            for (const slot of day.timeSlots) {
              if (businessHoursId) {
                await createTimeSlot(businessHoursId, {
                  ...slot,
                  businessHoursId,
                });
              }
            }
          } else {
            // Deshabilitar BusinessHours para el día
            if (day.businessHoursId) {
              const updateData: UpdateBusinessHoursData = {
                isActive: false,
              };

              await fetch(
                API_ENDPOINTS.BUSINESS_HOURS.BY_ID(data.locationId, day.businessHoursId),
                {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(updateData),
                }
              );
            }
          }
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Error updating location availability";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [createTimeSlot]
  );

  return {
    createTimeSlot,
    updateTimeSlot,
    deleteTimeSlot,
    toggleDayEnabled,
    updateLocationAvailability,
    loading,
    error,
  };
}
