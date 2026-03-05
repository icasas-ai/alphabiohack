"use client";

import { CalendarView, ViewToggle } from "@/components/calendar";
import React, { useMemo, useState } from 'react';

import { BookingsDataTable } from "@/components/bookings/bookings-data-table";
import { Button } from "@/components/ui/button";
import { CreateBookingDialog } from "@/components/bookings/create-booking-dialog";
import { EditBookingDialog } from "@/components/bookings/edit-booking-dialog";
import type { CalendarEvent } from "@/lib/utils/calendar";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { convertBookingsToEvents } from "@/lib/utils/calendar";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useUserBookings } from "@/hooks/use-user-bookings";
import type { BookingRow } from "@/components/bookings/bookings-data-table";

export default function BookingsPage() {
  const {
    bookings,
    loading,
    error,
    canManageAppointments,
    refetch,
    updateBookingInState,
  } = useUserBookings();
  const t = useTranslations("Bookings");
  const [currentView, setCurrentView] = useState<'list' | 'calendar'>('list');
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null);
  const [editingBooking, setEditingBooking] = useState<BookingRow | null>(null);
  const [createBookingOpen, setCreateBookingOpen] = useState(false);
  const [createBookingDate, setCreateBookingDate] = useState<Date | null>(null);

  const eventStatusToBookingStatus = (status?: CalendarEvent["status"]) => {
    switch (status) {
      case "confirmed":
        return "Confirmed";
      case "inprogress":
        return "InProgress";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      case "noshow":
        return "NoShow";
      case "pending":
      default:
        return "Pending";
    }
  };

  const calendarEvents = useMemo(() => {
    return convertBookingsToEvents(bookings);
  }, [bookings]);

  const bookingById = useMemo(() => {
    const map = new Map<string, BookingRow>();
    bookings.forEach((booking) => {
      map.set(booking.id, booking as BookingRow);
    });
    return map;
  }, [bookings]);

  const handleStatusChange = async (bookingId: string, status: string) => {
    try {
      setUpdatingBookingId(bookingId);
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || t("statusUpdateError"));
      }

      updateBookingInState(bookingId, status);
      toast.success(
        t("statusUpdated", {
          status: t(`statusOptions.${status}`),
        })
      );
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("statusUpdateError"));
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const handleEventClick = () => {};

  const handleEditBooking = (booking: BookingRow) => {
    setEditingBooking(booking);
  };

  const handleEventEdit = (event: CalendarEvent) => {
    const booking = bookingById.get(event.id);
    if (booking) {
      setEditingBooking(booking);
    }
  };

  const handleEventCancel = async (event: CalendarEvent) => {
    if (!canManageAppointments || event.status === "cancelled") return;
    const confirmed = window.confirm(
      t("confirmStatusChangeDescription", {
        current: t(`statusOptions.${eventStatusToBookingStatus(event.status)}`),
        next: t("statusOptions.Cancelled"),
      })
    );
    if (!confirmed) return;
    await handleStatusChange(event.id, "Cancelled");
  };

  const handleEventStatusChange = async (
    event: CalendarEvent,
    status: string
  ) => {
    const current = eventStatusToBookingStatus(event.status);
    const confirmed = window.confirm(
      t("confirmStatusChangeDescription", {
        current: t(`statusOptions.${current}`),
        next: t(`statusOptions.${status}`),
      })
    );
    if (!confirmed) return;
    await handleStatusChange(event.id, status);
  };

  const handleAddEvent = (date: Date) => {
    if (!canManageAppointments) return;
    setCreateBookingDate(date);
    setCreateBookingOpen(true);
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[250px] bg-muted" />
          <Skeleton className="h-4 w-[400px] bg-muted" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full bg-muted" />
          <Skeleton className="h-[400px] w-full bg-muted" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="text-center text-red-500">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {canManageAppointments ? t("appointments") : t("myAppointments")}
          </h1>
          <p className="text-muted-foreground">
            {canManageAppointments ? t("manageAppointments") : t("viewMyAppointments")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canManageAppointments ? (
            <Button
              onClick={() => {
                setCreateBookingDate(null);
                setCreateBookingOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("newAppointment")}
            </Button>
          ) : null}
          <ViewToggle
            currentView={currentView}
            onViewChange={setCurrentView}
          />
        </div>
      </div>
      
      {currentView === 'list' ? (
        <BookingsDataTable
          data={bookings}
          canManageStatus={canManageAppointments}
          updatingBookingId={updatingBookingId}
          onStatusChange={handleStatusChange}
          onEditBooking={handleEditBooking}
        />
      ) : (
        <CalendarView
          events={calendarEvents}
          onEventClick={handleEventClick}
          onEventEdit={handleEventEdit}
          onEventCancel={handleEventCancel}
          onEventStatusChange={handleEventStatusChange}
          updatingStatus={Boolean(updatingBookingId)}
          onAddEvent={handleAddEvent}
        />
      )}

      <EditBookingDialog
        booking={editingBooking}
        open={Boolean(editingBooking)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingBooking(null);
          }
        }}
        onSaved={refetch}
      />

      <CreateBookingDialog
        open={createBookingOpen}
        initialDate={createBookingDate}
        onOpenChange={(open) => {
          setCreateBookingOpen(open);
          if (!open) {
            setCreateBookingDate(null);
          }
        }}
        onCreated={refetch}
      />
    </div>
  );
}
