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
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  parseDateStringInTimeZone,
} from "@/lib/utils/timezone";
import { buildBookingScheduleIsoForTimezone } from "@/lib/utils/booking-request";
import {
  isValidEmailInput,
  isValidPhoneInput,
  normalizeEmailInput,
  normalizePhoneInput,
  normalizeWhitespace,
} from "@/lib/validation/form-fields";
import { TimeZoneDifferenceNote } from "@/components/common/timezone-difference-note";
import { cn } from "@/lib/utils";

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
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);

  const timezone = booking?.location.timezone || null;
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

    const initialDate = booking.bookingLocalDate && timezone
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
    setHasAttemptedSave(false);
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

  const validation = {
    timezone: !timezone,
    firstname: !normalizeWhitespace(firstname),
    lastname: !normalizeWhitespace(lastname),
    email: !email.trim() || !isValidEmailInput(email),
    emailMissing: !email.trim(),
    phone: !phone.trim() || !isValidPhoneInput(phone),
    phoneMissing: !phone.trim(),
    date: !selectedDate,
    time: !selectedTime || (Boolean(selectedDate) && availableTimeOptions.length === 0),
  };

  const handleSave = async () => {
    setHasAttemptedSave(true);

    if (
      !booking ||
      validation.firstname ||
      validation.lastname ||
      validation.email ||
      validation.phone ||
      validation.timezone ||
      validation.date ||
      validation.time ||
      !selectedDate ||
      !selectedTime ||
      !timezone
    ) {
      return;
    }

    try {
      setIsSaving(true);
      const normalizedEmail = normalizeEmailInput(email);
      const normalizedPhone = normalizePhoneInput(phone);

      if (!isValidEmailInput(normalizedEmail) || !isValidPhoneInput(normalizedPhone)) {
        throw new Error(t("updateAppointmentError"));
      }

      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstname: normalizeWhitespace(firstname),
          lastname: normalizeWhitespace(lastname),
          email: normalizedEmail,
          phone: normalizedPhone,
          bookingNotes: notes.trim() || undefined,
          bookingSchedule: buildBookingScheduleIsoForTimezone(
            selectedDate,
            selectedTime,
            timezone,
          ),
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error || t("updateAppointmentError"));
      }

      toast.success(t("appointmentUpdated"));
      await onSaved();
      setHasAttemptedSave(false);
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl xl:max-w-6xl">
        <DialogHeader>
          <DialogTitle>{t("editAppointmentTitle")}</DialogTitle>
          <DialogDescription>
            {t("editAppointmentDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,1fr)] xl:items-start">
          <div className="space-y-5 rounded-2xl border bg-card p-6 shadow-sm">
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
                  aria-invalid={hasAttemptedSave && validation.firstname}
                  className={cn(
                    hasAttemptedSave &&
                      validation.firstname &&
                      "border-red-500 ring-1 ring-red-500/20",
                  )}
                  autoComplete="given-name"
                  autoCapitalize="words"
                  maxLength={80}
                />
                {hasAttemptedSave && validation.firstname ? (
                  <p className="text-sm text-red-500">{t("bookingRequirements.firstName")}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastname">{t("lastName")}</Label>
                <Input
                  id="edit-lastname"
                  placeholder={t("lastName")}
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  disabled={isSaving}
                  aria-invalid={hasAttemptedSave && validation.lastname}
                  className={cn(
                    hasAttemptedSave &&
                      validation.lastname &&
                      "border-red-500 ring-1 ring-red-500/20",
                  )}
                  autoComplete="family-name"
                  autoCapitalize="words"
                  maxLength={80}
                />
                {hasAttemptedSave && validation.lastname ? (
                  <p className="text-sm text-red-500">{t("bookingRequirements.lastName")}</p>
                ) : null}
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
                  aria-invalid={hasAttemptedSave && validation.email}
                  className={cn(
                    hasAttemptedSave &&
                      validation.email &&
                      "border-red-500 ring-1 ring-red-500/20",
                  )}
                  autoComplete="email"
                  autoCapitalize="none"
                  inputMode="email"
                  spellCheck={false}
                />
                {hasAttemptedSave && validation.email ? (
                  <p className="text-sm text-red-500">
                    {validation.emailMissing
                      ? t("bookingRequirements.email")
                      : t("bookingRequirements.validEmail")}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">{t("phone")}</Label>
                <PhoneInput
                  id="edit-phone"
                  placeholder={t("phone")}
                  value={phone}
                  onChange={(value) => setPhone(normalizePhoneInput(value || ""))}
                  disabled={isSaving}
                  aria-invalid={hasAttemptedSave && validation.phone}
                  className={cn(
                    hasAttemptedSave &&
                      validation.phone &&
                      "[&_input]:border-red-500 [&_input]:ring-1 [&_input]:ring-red-500/20",
                  )}
                  autoComplete="tel"
                  defaultCountry="US"
                />
                {hasAttemptedSave && validation.phone ? (
                  <p className="text-sm text-red-500">
                    {validation.phoneMissing
                      ? t("bookingRequirements.phone")
                      : t("bookingRequirements.validPhone")}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notes">{t("notes")}</Label>
              <Textarea
                id="edit-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isSaving}
                rows={6}
                placeholder={t("notes")}
                className="min-h-36"
              />
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

            <div
              className={cn(
                "overflow-x-auto rounded-xl border bg-background p-4 shadow-inner",
                hasAttemptedSave && validation.date && "border-red-500/70 ring-1 ring-red-500/20",
              )}
            >
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => !isDateAvailable(date)}
                  className="min-w-[340px]"
                />
              </div>
            </div>
            {hasAttemptedSave && validation.date ? (
              <p className="text-sm text-red-500">{t("bookingRequirements.selectDate")}</p>
            ) : null}

            <Alert variant="info">
              <CalendarDays className="h-4 w-4" />
              <AlertDescription>
                {monthLoading ? (
                  t("loadingAvailability")
                ) : (
                  <div className="space-y-1">
                    <span>
                      {t("timeZoneNotice", {
                        timezone: timezone || "Not available",
                        office: booking?.location.title || "",
                      })}
                    </span>
                    {timezone ? (
                      <TimeZoneDifferenceNote
                        officeTimeZone={timezone}
                        date={selectedDate}
                        namespace="Bookings"
                      />
                    ) : (
                      <p className="text-sm text-red-500">
                        This office is missing a timezone. Update the office before editing this booking time.
                      </p>
                    )}
                  </div>
                )}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>{t("time")}</Label>
              <Select
                value={selectedTime}
                onValueChange={setSelectedTime}
                disabled={!selectedDate || dayLoading || isSaving}
              >
                <SelectTrigger
                  className={cn(
                    "w-full",
                    hasAttemptedSave && validation.time && "border-red-500 ring-1 ring-red-500/20",
                  )}
                  aria-invalid={hasAttemptedSave && validation.time}
                >
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
              {hasAttemptedSave && validation.time ? (
                <p className="text-sm text-red-500">
                  {selectedDate && !availableTimeOptions.length
                    ? t("bookingRequirements.noTimesForDate")
                    : t("bookingRequirements.selectTime")}
                </p>
              ) : null}
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
          <Button onClick={handleSave} disabled={isSaving}>
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
