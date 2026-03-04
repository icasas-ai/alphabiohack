"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { BookingStatus, BookingType, UserRole } from "@prisma/client";
import { AlertCircle, Loader2, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useAvailabilityCalendar } from "@/hooks/use-availability-calendar";
import { useLocations } from "@/hooks/use-locations";
import { useServices } from "@/hooks/use-services";
import { useSpecialties } from "@/hooks/use-specialties";
import { useTherapistConfig } from "@/hooks/use-therapist-config";
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
  parseDateStringInTimeZone,
} from "@/lib/utils/timezone";
import { buildCreateBookingRequestFromStaff } from "@/lib/utils/booking-request";
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
  const timezone = selectedLocation?.timezone || PST_TZ;
  const selectedDateKey = selectedDate ? toDateKey(selectedDate) : undefined;
  const selectedMonthKey = format(visibleMonth, "yyyy-MM");

  const { monthSummary, daySlots, monthLoading, dayLoading } = useAvailabilityCalendar(
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
  }, [initialDate, open]);

  useEffect(() => {
    setServiceId("");
  }, [specialtyId]);

  useEffect(() => {
    setSelectedDate((currentDate) => {
      if (!currentDate || !locationId) return currentDate;
      return parseDateStringInTimeZone(toDateKey(currentDate), timezone);
    });
    setSelectedTime("");
  }, [locationId, timezone]);

  const availableTimeOptions = useMemo(() => {
    if (!daySlots) return [];
    return daySlots.slots.filter((slot) => slot.isAvailable);
  }, [daySlots]);

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
        locationId &&
        specialtyId &&
        serviceId &&
        selectedDate &&
        selectedTime &&
        firstname.trim() &&
        lastname.trim() &&
        email.trim() &&
        phone.trim(),
    ) && !isSaving;

  const handleSave = async () => {
    if (
      !therapistId ||
      !locationId ||
      !specialtyId ||
      !serviceId ||
      !selectedDate ||
      !selectedTime
    ) {
      return;
    }

    try {
      setIsSaving(true);

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
          firstname: firstname.trim(),
          lastname: lastname.trim(),
          email: email.trim(),
          phone: phone.trim(),
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
            <div className="grid gap-4 xl:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="create-location">{t("location")}</Label>
                <Select value={locationId} onValueChange={setLocationId} disabled={isSaving}>
                  <SelectTrigger id="create-location">
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-status">{t("status")}</Label>
                <Select
                  value={status}
                  onValueChange={(value) => setStatus(value as BookingStatus)}
                  disabled={isSaving}
                >
                  <SelectTrigger id="create-status">
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
                  <SelectTrigger id="create-specialty">
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-service">{t("service")}</Label>
                <Select
                  value={serviceId}
                  onValueChange={setServiceId}
                  disabled={!specialtyId || isSaving}
                >
                  <SelectTrigger id="create-service">
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
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_250px]">
              <div className="space-y-3 rounded-2xl border bg-card p-4 shadow-sm">
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
              </div>

              <div className="space-y-4 rounded-2xl border bg-card p-4 shadow-sm">
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
                          timezone,
                          office: selectedLocation.title,
                        })}
                      </span>
                      <TimeZoneDifferenceNote
                        officeTimeZone={timezone}
                        date={selectedDate}
                        namespace="Bookings"
                      />
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-lastname">{t("lastName")}</Label>
                <Input
                  id="create-lastname"
                  placeholder={t("lastName")}
                  value={lastname}
                  onChange={(event) => setLastname(event.target.value)}
                  disabled={isSaving}
                />
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-phone">{t("phone")}</Label>
                <Input
                  id="create-phone"
                  placeholder={t("phone")}
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  disabled={isSaving}
                />
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
          <Button onClick={handleSave} disabled={!canSave}>
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
