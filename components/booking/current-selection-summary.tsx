"use client";

import { CalendarDays, Clock3, ListChecks, MapPin, Sparkles, Stethoscope } from "lucide-react";

import { Card } from "@/components/ui/card";
import { useBookingWizard } from "@/contexts";
import { useFormatter, useTranslations } from "next-intl";
import { useLocations, useServices, useSpecialties } from "@/hooks";

interface CurrentSelectionSummaryProps {
  readonly level: 1 | 2 | 3;
  readonly compact?: boolean;
}

export function CurrentSelectionSummary({ level, compact = false }: CurrentSelectionSummaryProps) {
  const { data } = useBookingWizard();
  const { locations } = useLocations();
  const { specialties } = useSpecialties();
  const { services } = useServices(data.specialtyId || undefined);
  const t = useTranslations("Booking");
  const format = useFormatter();

  const selectedLocation = locations.find((location) => location.id === data.locationId);
  const selectedSpecialty = specialties.find((specialty) => specialty.id === data.specialtyId);
  const selectedServices = services.filter((service) =>
    data.selectedServiceIds.includes(service.id),
  );

  const appointmentTypeLabel = (() => {
    switch (data.appointmentType) {
      case "DirectVisit":
        return t("clinic");
      case "VideoCall":
        return t("video");
      case "PhoneCall":
        return t("phone");
      case "HomeVisit":
        return t("home");
      default:
        return t("notSelectedYet");
    }
  })();

  const formattedDate = data.selectedDate
    ? format.dateTime(data.selectedDate, {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : null;

  const items = [
    {
      key: "appointmentType",
      visible: level >= 1,
      icon: Sparkles,
      label: t("appointmentType"),
      value: appointmentTypeLabel,
    },
    {
      key: "location",
      visible: level >= 1,
      icon: MapPin,
      label: t("location"),
      value: selectedLocation?.title || t("notSelectedYet"),
    },
    {
      key: "specialty",
      visible: level >= 2,
      icon: Stethoscope,
      label: t("specialty"),
      value: selectedSpecialty?.name || t("notSelectedYet"),
    },
    {
      key: "services",
      visible: level >= 2,
      icon: ListChecks,
      label: t("services"),
      value:
        selectedServices.length > 0
          ? selectedServices.map((service) => service.description).join(", ")
          : t("notSelectedYet"),
    },
    {
      key: "date",
      visible: level >= 3,
      icon: CalendarDays,
      label: t("date"),
      value: formattedDate || t("notSelectedYet"),
    },
    {
      key: "time",
      visible: level >= 3,
      icon: Clock3,
      label: t("time"),
      value: data.selectedTime || t("notSelectedYet"),
    },
  ];

  const visibleItems = items.filter((item) => item.visible);

  return (
    <Card className="border-primary/15 bg-primary/5 px-4 py-3">
      {!compact ? (
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-foreground">{t("selectedSoFar")}</h3>
          <p className="text-xs text-muted-foreground">{t("selectedSoFarDescription")}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {visibleItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.key}
              className="inline-flex min-w-0 max-w-full items-center gap-2 rounded-full border bg-background/90 px-3 py-2"
            >
              <span className="rounded-full bg-primary/10 p-1.5 text-primary">
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                {item.label}
              </span>
              <span className="truncate text-sm font-medium text-foreground">
                {item.value}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
