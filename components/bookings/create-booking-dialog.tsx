"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { BookingStatus, BookingType, UserRole } from "@/lib/prisma-browser";
import { AlertCircle, Loader2, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useAvailabilityCalendar } from "@/hooks/use-availability-calendar";
import { useLocations } from "@/hooks/use-locations";
import { useServices } from "@/hooks/use-services";
import { useSpecialties } from "@/hooks/use-specialties";
import { useUser } from "@/contexts/user-context";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { buildCreateBookingRequestFromStaff } from "@/lib/utils/booking-request";
import {
  isValidEmailInput,
  isValidPhoneInput,
  normalizeEmailInput,
  normalizePhoneInput,
  normalizeWhitespace,
} from "@/lib/validation/form-fields";
import { cn } from "@/lib/utils";
import { TimeZoneDifferenceNote } from "@/components/common/timezone-difference-note";

interface CreateBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => Promise<void> | void;
  initialDate?: Date | null;
}

function toDateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function CreateBookingDialog({
  open,
  onOpenChange,
  onCreated,
  initialDate,
}: CreateBookingDialogProps) {
  const t = useTranslations("Bookings");
  const { prismaUser } = useUser();
  const { locations } = useLocations();
  const { specialties } = useSpecialties();

  const [locationId, setLocationId] = useState("");
  const [specialtyId, setSpecialtyId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [visibleMonth, setVisibleMonth] = useState<Date>(initialDate ?? new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [status, setStatus] = useState<BookingStatus>(BookingStatus.Confirmed);
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);

  const therapistId = useMemo(() => {
    if (prismaUser?.role.includes(UserRole.Therapist)) {
      return prismaUser.id;
    }
    if (prismaUser?.role.includes(UserRole.FrontDesk)) {
      return prismaUser.managedByTherapistId || null;
    }
    return null;
  }, [prismaUser]);

  const { services } = useServices(specialtyId || undefined);
  const selectedLocation = locations.find((location) => location.id === locationId);
  const timezone = selectedLocation?.timezone || null;
  const selectedDateKey = selectedDate ? toDateKey(selectedDate) : undefined;
  const selectedMonthKey = format(visibleMonth, "yyyy-MM");

  const {
    monthSummary,
    daySlots,
    monthLoading,
    dayLoading,
    error: availabilityError,
  } = useAvailabilityCalendar(
    therapistId,
    locationId || null,
    selectedMonthKey,
    selectedDateKey,
  );

  useEffect(() => {
    if (!open) return;

    setLocationId("");
    setSpecialtyId("");
    setServiceId("");
    setSelectedDate(initialDate ?? undefined);
    setVisibleMonth(initialDate ?? new Date());
    setSelectedTime("");
    setStatus(BookingStatus.Confirmed);
    setFirstname("");
    setLastname("");
    setEmail("");
    setPhone("");
    setNotes("");
    setHasAttemptedSave(false);
  }, [initialDate, open]);

  useEffect(() => {
    setServiceId("");
  }, [specialtyId]);

  useEffect(() => {
    setSelectedDate((currentDate) => {
      if (!currentDate || !locationId || !timezone) return currentDate;
      return parseDateStringInTimeZone(toDateKey(currentDate), timezone);
    });
    setSelectedTime("");
  }, [locationId, timezone]);

  const availableTimeOptions = useMemo(() => {
    if (!daySlots) return [];
    return daySlots.slots.filter((slot) => slot.isAvailable);
  }, [daySlots]);

  const validation = useMemo(() => {
    const missingTherapist = !therapistId;
    const noLocations = locations.length === 0;
    const noSpecialties = specialties.length === 0;
    const noServicesForSpecialty = Boolean(specialtyId) && services.length === 0;
    const noAvailabilityConfigured =
      Boolean(locationId) &&
      !monthLoading &&
      !availabilityError &&
      (monthSummary?.availableDays ?? 0) === 0;

    return {
      missingTherapist,
      noLocations,
      noSpecialties,
      noServicesForSpecialty,
      noAvailabilityConfigured,
      missingLocationTimezone: Boolean(locationId) && !timezone,
      location: !locationId,
      specialty: !specialtyId,
      service: !serviceId,
      date: !selectedDate,
      time: !selectedTime || (Boolean(selectedDate) && availableTimeOptions.length === 0),
      firstname: !firstname.trim(),
      lastname: !lastname.trim(),
      email: !email.trim() || !isValidEmailInput(email),
      emailMissing: !email.trim(),
      phone: !phone.trim() || !isValidPhoneInput(phone),
      phoneMissing: !phone.trim(),
    };
  }, [
    therapistId,
    locations.length,
    specialties.length,
    specialtyId,
    serviceId,
    timezone,
    services.length,
    locationId,
    monthLoading,
    availabilityError,
    monthSummary,
    selectedDate,
    selectedTime,
    availableTimeOptions.length,
    firstname,
    lastname,
    email,
    phone,
  ]);

  const unavailableDateKeys = useMemo(() => {
    return new Set(
      (monthSummary?.days || [])
        .filter((day) => day.hasAvailability)
        .map((day) => day.date),
    );
  }, [monthSummary]);

  const isDateAvailable = (date: Date) => {
    if (!locationId) return false;
    return unavailableDateKeys.has(toDateKey(date));
  };

  useEffect(() => {
    if (!selectedDate) {
      setSelectedTime("");
      return;
    }

    if (
      selectedTime &&
      availableTimeOptions.some((slot) => slot.value === selectedTime)
    ) {
      return;
    }

    setSelectedTime(availableTimeOptions[0]?.value || "");
  }, [availableTimeOptions, selectedDate, selectedTime]);

  const canSave =
    Boolean(
      therapistId &&
        !validation.noLocations &&
        !validation.noSpecialties &&
        !validation.noServicesForSpecialty &&
        !validation.noAvailabilityConfigured &&
        !validation.missingLocationTimezone &&
        locationId &&
        specialtyId &&
        serviceId &&
        selectedDate &&
        selectedTime &&
        firstname.trim() &&
        lastname.trim() &&
        isValidEmailInput(email) &&
        isValidPhoneInput(phone),
    ) && !isSaving;

  const handleSave = async () => {
    setHasAttemptedSave(true);

    if (!canSave) {
      return;
    }

    if (!therapistId || !selectedDate || !timezone) {
      return;
    }

    try {
      setIsSaving(true);
      const normalizedEmail = normalizeEmailInput(email);
      const normalizedPhone = normalizePhoneInput(phone);

      if (!isValidEmailInput(normalizedEmail) || !isValidPhoneInput(normalizedPhone)) {
        throw new Error(t("createAppointmentError"));
      }

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildCreateBookingRequestFromStaff({
          bookingType: BookingType.DirectVisit,
          locationId,
          specialtyId,
          serviceId,
          bookedDurationMinutes: services.find((service) => service.id === serviceId)?.duration,
          therapistId,
          firstname: normalizeWhitespace(firstname),
          lastname: normalizeWhitespace(lastname),
          email: normalizedEmail,
          phone: normalizedPhone,
          bookingNotes: notes.trim() || undefined,
          givenConsent: false,
          status,
          selectedDate,
          selectedTime,
        }, timezone)),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        throw new Error(result?.error || t("createAppointmentError"));
      }

      toast.success(t("appointmentCreated"));
      await onCreated();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("createAppointmentError"),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl xl:max-w-5xl">
        <DialogHeader>
          <DialogTitle>{t("createAppointmentTitle")}</DialogTitle>
          <DialogDescription>
            {t("createAppointmentDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_380px]">
          <div className="space-y-6">
            {hasAttemptedSave && validation.missingTherapist ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {prismaUser?.role.includes(UserRole.FrontDesk)
                    ? t("bookingRequirements.missingAssignedTherapist")
                    : t("bookingRequirements.missingTherapistContext")}
                </AlertDescription>
              </Alert>
            ) : null}

            <div className="grid gap-4 xl:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="create-location">{t("location")}</Label>
                <Select value={locationId} onValueChange={setLocationId} disabled={isSaving}>
                  <SelectTrigger
                    id="create-location"
                    aria-invalid={hasAttemptedSave && (validation.location || validation.noLocations)}
                    className={cn(
                      "w-full",
                      hasAttemptedSave &&
                        (validation.location || validation.noLocations) &&
                        "border-red-500 ring-1 ring-red-500/20",
                    )}
                  >
                    <SelectValue placeholder={t("selectOffice")} />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {hasAttemptedSave && validation.noLocations ? (
                  <p className="text-sm text-red-500">{t("bookingRequirements.missingLocations")}</p>
                ) : hasAttemptedSave && validation.location ? (
                  <p className="text-sm text-red-500">{t("bookingRequirements.selectLocation")}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-status">{t("status")}</Label>
                <Select
                  value={status}
                  onValueChange={(value) => setStatus(value as BookingStatus)}
                  disabled={isSaving}
                >
                  <SelectTrigger id="create-status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={BookingStatus.Confirmed}>
                      {t("statusOptions.Confirmed")}
                    </SelectItem>
                    <SelectItem value={BookingStatus.Pending}>
                      {t("statusOptions.Pending")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-specialty">{t("specialty")}</Label>
                <Select
                  value={specialtyId}
                  onValueChange={setSpecialtyId}
                  disabled={isSaving}
                >
                  <SelectTrigger
                    id="create-specialty"
                    aria-invalid={hasAttemptedSave && (validation.specialty || validation.noSpecialties)}
                    className={cn(
                      "w-full",
                      hasAttemptedSave &&
                        (validation.specialty || validation.noSpecialties) &&
                        "border-red-500 ring-1 ring-red-500/20",
                    )}
                  >
                    <SelectValue placeholder={t("selectSpecialty")} />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty.id} value={specialty.id}>
                        {specialty.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {hasAttemptedSave && validation.noSpecialties ? (
                  <p className="text-sm text-red-500">{t("bookingRequirements.missingSpecialties")}</p>
                ) : hasAttemptedSave && validation.specialty ? (
                  <p className="text-sm text-red-500">{t("bookingRequirements.selectSpecialty")}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-service">{t("service")}</Label>
                <Select
                  value={serviceId}
                  onValueChange={setServiceId}
                  disabled={!specialtyId || isSaving}
                >
                  <SelectTrigger
                    id="create-service"
                    aria-invalid={hasAttemptedSave && (validation.service || validation.noServicesForSpecialty)}
                    className={cn(
                      "w-full",
                      hasAttemptedSave &&
                        (validation.service || validation.noServicesForSpecialty) &&
                        "border-red-500 ring-1 ring-red-500/20",
                    )}
                  >
                    <SelectValue placeholder={t("selectService")} />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {hasAttemptedSave && validation.noServicesForSpecialty ? (
                  <p className="text-sm text-red-500">
                    {t("bookingRequirements.missingServicesForSpecialty")}
                  </p>
                ) : hasAttemptedSave && validation.service ? (
                  <p className="text-sm text-red-500">{t("bookingRequirements.selectService")}</p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_250px]">
              <div
                className={cn(
                  "space-y-3 rounded-2xl border bg-card p-4 shadow-sm",
                  hasAttemptedSave &&
                    (validation.date || validation.noAvailabilityConfigured || Boolean(availabilityError)) &&
                    "border-red-500/70 ring-1 ring-red-500/20",
                )}
              >
                {!locationId ? (
                  <Alert variant="warning">
                    <MapPin className="h-4 w-4" />
                    <AlertDescription>
                      <span className="mb-1 block font-medium">{t("selectOfficeFirst")}</span>
                      <span>{t("selectOfficeToUnlockCalendar")}</span>
                    </AlertDescription>
                  </Alert>
                ) : null}

                <div className="rounded-xl border bg-background p-3 shadow-inner">
                  <Calendar
                    mode="single"
                    month={visibleMonth}
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    onMonthChange={setVisibleMonth}
                    disabled={(date) => !isDateAvailable(date)}
                    className="w-full"
                  />
                </div>
                {hasAttemptedSave && availabilityError ? (
                  <p className="text-sm text-red-500">{t("bookingRequirements.availabilityLoadError")}</p>
                ) : hasAttemptedSave && validation.noAvailabilityConfigured ? (
                  <p className="text-sm text-red-500">{t("bookingRequirements.missingAvailability")}</p>
                ) : hasAttemptedSave && validation.date ? (
                  <p className="text-sm text-red-500">{t("bookingRequirements.selectDate")}</p>
                ) : null}
              </div>

              <div
                className={cn(
                  "space-y-4 rounded-2xl border bg-card p-4 shadow-sm",
                  hasAttemptedSave && validation.time && "border-red-500/70 ring-1 ring-red-500/20",
                )}
              >
                <div className="space-y-2">
                  <Label>{t("time")}</Label>
                  <Select
                    value={selectedTime}
                    onValueChange={setSelectedTime}
                    disabled={!selectedDate || dayLoading || isSaving}
                  >
                    <SelectTrigger
                      className="w-full"
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

                <div className="rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground">
                  {monthLoading ? (
                    <div className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("loadingAvailability")}
                    </div>
                  ) : selectedLocation ? (
                    <div className="space-y-1">
                      <span>
                        {t("timeZoneNotice", {
                          timezone: timezone || "Not available",
                          office: selectedLocation.title,
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
                          This office is missing a timezone. Update the office before booking.
                        </p>
                      )}
                    </div>
                  ) : (
                    <span>{t("selectOfficeFirst")}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-xl border p-4">
            <div className="space-y-1">
              <h3 className="font-medium">{t("participantDetails")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("participantDetailsDescription")}
              </p>
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-firstname">{t("firstName")}</Label>
                <Input
                  id="create-firstname"
                  placeholder={t("firstName")}
                  value={firstname}
                  onChange={(event) => setFirstname(event.target.value)}
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
                <Label htmlFor="create-lastname">{t("lastName")}</Label>
                <Input
                  id="create-lastname"
                  placeholder={t("lastName")}
                  value={lastname}
                  onChange={(event) => setLastname(event.target.value)}
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
                <Label htmlFor="create-email">{t("email")}</Label>
                <Input
                  id="create-email"
                  type="email"
                  placeholder={t("email")}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
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
                <Label htmlFor="create-phone">{t("phone")}</Label>
                <PhoneInput
                  id="create-phone"
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
              <div className="space-y-2">
                <Label htmlFor="create-notes">{t("notes")}</Label>
                <Textarea
                  id="create-notes"
                  rows={4}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  disabled={isSaving}
                />
              </div>
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
                {t("creatingAppointment")}
              </>
            ) : (
              t("createAppointmentAction")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
