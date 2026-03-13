"use client";

import { CalendarView, ViewToggle } from "@/components/calendar";
import React, { useMemo, useState } from 'react';

import { BookingsDataTable } from "@/components/bookings/bookings-data-table";
import { Button } from "@/components/ui/button";
import { CreateBookingDialog } from "@/components/bookings/create-booking-dialog";
import { EditBookingDialog } from "@/components/bookings/edit-booking-dialog";
import type { CalendarEvent } from "@/lib/utils/calendar";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { convertBookingsToEvents } from "@/lib/utils/calendar";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useUserBookings } from "@/hooks/use-user-bookings";
import type { BookingRow } from "@/components/bookings/bookings-data-table";

export default function BookingsPage() {
  const searchParams = useSearchParams();
  const {
    bookings,
    loading,
    error,
    canManageAppointments,
    canViewCompanyBookings,
    currentUserId,
    frontDeskManagesAllTherapists,
    managedTherapistId,
    isAdmin,
    isFrontDesk,
    isTherapist,
    refetch,
    updateBookingInState,
  } = useUserBookings();
  const t = useTranslations("Bookings");
  const requestedView = searchParams.get("view") === "calendar" ? "calendar" : "list";
  const [currentView, setCurrentView] = useState<'list' | 'calendar'>(requestedView);
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null);
  const [editingBooking, setEditingBooking] = useState<BookingRow | null>(null);
  const [createBookingOpen, setCreateBookingOpen] = useState(false);
  const [createBookingDate, setCreateBookingDate] = useState<Date | null>(null);
  const [therapistFilter, setTherapistFilter] = useState("all");

  React.useEffect(() => {
    setCurrentView((prev) => (prev === requestedView ? prev : requestedView));
  }, [requestedView]);

  const therapistOptions = useMemo(
    () =>
      Array.from(
        new Map(
          bookings
            .filter((booking) => booking.therapist?.id)
            .map((booking) => [
              booking.therapist!.id,
              {
                id: booking.therapist!.id,
                label: `${booking.therapist!.firstname} ${booking.therapist!.lastname}`,
              },
            ]),
        ).values(),
      ).sort((left, right) => left.label.localeCompare(right.label)),
    [bookings],
  );

  React.useEffect(() => {
    if (
      therapistFilter !== "all" &&
      !therapistOptions.some((option) => option.id === therapistFilter)
    ) {
      setTherapistFilter("all");
    }
  }, [therapistFilter, therapistOptions]);

  const eventStatusToBookingStatus = (status?: CalendarEvent["status"]) => {
    switch (status) {
      case "confirmed":
        return "Confirmed";
      case "needsattention":
        return "NeedsAttention";
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

  const filteredBookings = useMemo(() => {
    if (therapistFilter === "all") {
      return bookings;
    }

    return bookings.filter((booking) => booking.therapist?.id === therapistFilter);
  }, [bookings, therapistFilter]);

  const calendarEvents = useMemo(() => {
    return convertBookingsToEvents(filteredBookings);
  }, [filteredBookings]);

  const bookingById = useMemo(() => {
    const map = new Map<string, BookingRow>();
    bookings.forEach((booking) => {
      map.set(booking.id, booking as BookingRow);
    });
    return map;
  }, [bookings]);

  const canManageBooking = React.useCallback(
    (booking: BookingRow) => {
      const bookingTherapistId = booking.therapist?.id ?? null;

      if (isAdmin) {
        return true;
      }

      if (!bookingTherapistId) {
        return false;
      }

      if (isTherapist) {
        return bookingTherapistId === currentUserId;
      }

      if (isFrontDesk) {
        return frontDeskManagesAllTherapists || bookingTherapistId === managedTherapistId;
      }

      return false;
    },
    [
      currentUserId,
      frontDeskManagesAllTherapists,
      isAdmin,
      isFrontDesk,
      isTherapist,
      managedTherapistId,
    ],
  );

  const canManageEvent = React.useCallback(
    (event: CalendarEvent) => {
      const booking = bookingById.get(event.id);
      return booking ? canManageBooking(booking) : false;
    },
    [bookingById, canManageBooking],
  );

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
    if (!canManageBooking(booking)) {
      return;
    }

    setEditingBooking(booking);
  };

  const handleEventEdit = (event: CalendarEvent) => {
    const booking = bookingById.get(event.id);
    if (booking && canManageBooking(booking)) {
      setEditingBooking(booking);
    }
  };

  const handleEventCancel = async (event: CalendarEvent) => {
    if (!canManageAppointments || !canManageEvent(event) || event.status === "cancelled") return;
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
    if (!canManageEvent(event)) return;
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

      {canViewCompanyBookings ? (
        <div className="flex justify-end">
          <Select value={therapistFilter} onValueChange={setTherapistFilter}>
            <SelectTrigger className="w-full sm:w-[280px]">
              <SelectValue placeholder={t("filterByTherapist")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allTherapists")}</SelectItem>
              {therapistOptions.map((therapist) => (
                <SelectItem key={therapist.id} value={therapist.id}>
                  {therapist.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}
      
      {currentView === 'list' ? (
        <BookingsDataTable
          data={filteredBookings}
          canManageStatus={canManageAppointments}
          canManageBooking={canManageBooking}
          updatingBookingId={updatingBookingId}
          onStatusChange={handleStatusChange}
          onEditBooking={canManageAppointments ? handleEditBooking : undefined}
        />
      ) : (
        <CalendarView
          events={calendarEvents}
          onEventClick={handleEventClick}
          onEventEdit={canManageAppointments ? handleEventEdit : undefined}
          onEventCancel={canManageAppointments ? handleEventCancel : undefined}
          onEventStatusChange={canManageAppointments ? handleEventStatusChange : undefined}
          canManageEvent={canManageEvent}
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
