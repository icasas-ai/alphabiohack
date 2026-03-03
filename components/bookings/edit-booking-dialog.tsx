"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarDays, Loader2, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useAvailabilityCalendar } from "@/hooks/use-availability-calendar";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  PST_TZ,
  combineDateAndTimeToUtc,
  parseDateStringInTimeZone,
} from "@/lib/utils/timezone";

type EditableBooking = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  bookingSchedule: string;
  bookingLocalDate?: string;
  bookingLocalTime?: string;
  bookingNotes?: string;
  therapist?: {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
  };
  location: {
    id?: string;
    title: string;
    address?: string;
    timezone?: string;
  };
  specialty?: {
    id: string;
    name: string;
  };
  service?: {
    id: string;
    description: string;
    duration: number;
  };
};

interface EditBookingDialogProps {
  booking: EditableBooking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => Promise<void> | void;
}

function toDateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function EditBookingDialog({
  booking,
  open,
  onOpenChange,
  onSaved,
}: EditBookingDialogProps) {
  const t = useTranslations("Bookings");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const timezone = booking?.location.timezone || PST_TZ;
  const therapistId = booking?.therapist?.id || null;
  const locationId = booking?.location.id || null;

  const originalDateKey = booking?.bookingLocalDate || "";
  const originalTime = booking?.bookingLocalTime || "";
  const selectedDateKey = selectedDate ? toDateKey(selectedDate) : undefined;
  const selectedMonthKey = selectedDate ? format(selectedDate, "yyyy-MM") : undefined;

  const { monthSummary, daySlots, monthLoading, dayLoading } = useAvailabilityCalendar(
    therapistId,
    locationId,
    selectedMonthKey,
    selectedDateKey,
  );

  useEffect(() => {
    if (!booking || !open) return;

    const initialDate = booking.bookingLocalDate
      ? parseDateStringInTimeZone(booking.bookingLocalDate, timezone)
      : new Date(booking.bookingSchedule);
    const nextDateKey = toDateKey(initialDate);
    const nextTime = booking.bookingLocalTime || "";

    setFirstname((current) => (current === (booking.firstname || "") ? current : booking.firstname || ""));
    setLastname((current) => (current === (booking.lastname || "") ? current : booking.lastname || ""));
    setEmail((current) => (current === (booking.email || "") ? current : booking.email || ""));
    setPhone((current) => (current === (booking.phone || "") ? current : booking.phone || ""));
    setNotes((current) => (current === (booking.bookingNotes || "") ? current : booking.bookingNotes || ""));
    setSelectedDate((current) => {
      if (current && toDateKey(current) === nextDateKey) {
        return current;
      }
      return initialDate;
    });
    setSelectedTime((current) => (current === nextTime ? current : nextTime));
  }, [
    booking?.id,
    booking?.firstname,
    booking?.lastname,
    booking?.email,
    booking?.phone,
    booking?.bookingNotes,
    booking?.bookingLocalDate,
    booking?.bookingLocalTime,
    booking?.bookingSchedule,
    open,
    timezone,
  ]);

  const availableTimeOptions = useMemo(() => {
    if (!daySlots) return [];

    const options = daySlots.slots.filter(
      (slot) =>
        slot.isAvailable ||
        (selectedDateKey === originalDateKey && slot.value === originalTime)
    );

    if (
      selectedDateKey === originalDateKey &&
      originalTime &&
      !options.some((slot) => slot.value === originalTime)
    ) {
      return [{ value: originalTime, isAvailable: true }, ...options];
    }

    return options;
  }, [daySlots, originalDateKey, originalTime, selectedDateKey]);

  useEffect(() => {
    if (!selectedDate) {
      if (selectedTime !== "") {
        setSelectedTime("");
      }
      return;
    }

    if (selectedDateKey === originalDateKey && originalTime) {
      if (selectedTime !== originalTime) {
        setSelectedTime(originalTime);
      }
      return;
    }

    if (
      selectedTime &&
      availableTimeOptions.some((slot) => slot.value === selectedTime)
    ) {
      return;
    }

    const nextTime = availableTimeOptions[0]?.value || "";
    if (selectedTime !== nextTime) {
      setSelectedTime(nextTime);
    }
  }, [
    availableTimeOptions,
    originalDateKey,
    originalTime,
    selectedDate,
    selectedDateKey,
    selectedTime,
  ]);

  const availableDateKeys = useMemo(() => {
    const keys = new Set(
      (monthSummary?.days || [])
        .filter((day) => day.hasAvailability)
        .map((day) => day.date),
    );

    if (originalDateKey) {
      keys.add(originalDateKey);
    }

    return keys;
  }, [monthSummary, originalDateKey]);

  const isDateAvailable = (date: Date) => {
    return availableDateKeys.has(toDateKey(date));
  };

  const canSave =
    Boolean(
      booking &&
        firstname.trim() &&
        lastname.trim() &&
        email.trim() &&
        phone.trim() &&
        selectedDate &&
        selectedTime
    ) && !isSaving;

  const handleSave = async () => {
    if (!booking || !selectedDate || !selectedTime) return;

    try {
      setIsSaving(true);
      const bookingSchedule = combineDateAndTimeToUtc(
        selectedDate,
        selectedTime,
        timezone,
      );

      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstname: firstname.trim(),
          lastname: lastname.trim(),
          email: email.trim(),
          phone: phone.trim(),
          bookingNotes: notes.trim() || undefined,
          bookingSchedule: bookingSchedule.toISOString(),
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error || t("updateAppointmentError"));
      }

      toast.success(t("appointmentUpdated"));
      await onSaved();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("updateAppointmentError")
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl xl:max-w-5xl">
        <DialogHeader>
          <DialogTitle>{t("editAppointmentTitle")}</DialogTitle>
          <DialogDescription>
            {t("editAppointmentDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="space-y-5 rounded-xl border bg-background p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <UserRound className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium">{t("participantDetails")}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t("participantDetailsDescription")}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-firstname">{t("firstName")}</Label>
                    <Input
                      id="edit-firstname"
                      placeholder={t("firstName")}
                      value={firstname}
                      onChange={(e) => setFirstname(e.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-lastname">{t("lastName")}</Label>
                    <Input
                      id="edit-lastname"
                      placeholder={t("lastName")}
                      value={lastname}
                      onChange={(e) => setLastname(e.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">{t("email")}</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      placeholder={t("email")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">{t("phone")}</Label>
                    <Input
                      id="edit-phone"
                      placeholder={t("phone")}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-notes">{t("notes")}</Label>
                  <Textarea
                    id="edit-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={isSaving}
                    rows={5}
                    placeholder={t("notes")}
                  />
                </div>
              </div>

              <div className="space-y-4 rounded-xl border bg-background p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium">{t("reschedule")}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t("rescheduleDescription")}
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border bg-card p-3 shadow-inner">
                  <div className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => !isDateAvailable(date)}
                      className="min-w-[320px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium">{t("reschedule")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("rescheduleDescription")}
                </p>
              </div>
            </div>

            <Alert variant="info">
              <CalendarDays className="h-4 w-4" />
              <AlertDescription>
                {monthLoading
                  ? t("loadingAvailability")
                  : t("timeZoneNotice", {
                      timezone,
                      office: booking?.location.title || "",
                    })}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>{t("time")}</Label>
              <Select
                value={selectedTime}
                onValueChange={setSelectedTime}
                disabled={!selectedDate || dayLoading || isSaving}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      selectedDate ? t("selectAvailableTime") : t("selectDateFirst")
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableTimeOptions.length ? (
                    availableTimeOptions.map((slot) => (
                      <SelectItem key={slot.value} value={slot.value}>
                        {slot.value}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="__none" disabled>
                      {dayLoading ? t("loadingTimes") : t("noAvailableTimes")}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            {t("cancel")}
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("savingAppointment")}
              </>
            ) : (
              t("saveAppointment")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
