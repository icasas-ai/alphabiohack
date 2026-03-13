"use client"

import { Avatar, AvatarIconFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CalendarDays,
  CheckCircle,
  Clock3,
  MapPin,
  Phone,
  QrCode,
  UserRound,
} from "lucide-react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { useLocations, useServices } from "@/hooks"
import { formatTime12h } from "@/lib/format-time"
import { AddToCalendarButton } from "@/components/common/add-to-calendar-button"
import { TimeZoneDifferenceNote } from "@/components/common/timezone-difference-note"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useBookingWizard } from "@/contexts"
import { buildICS } from "@/lib/utils/calendar-links"
import { formatTimeZoneLabel } from "@/lib/utils/timezone"
import { cn } from "@/lib/utils"
import QRCode from "qrcode"
import { useEffect, useMemo, useState } from "react"
import { useFormatter, useLocale } from "next-intl"

export function BookingConfirmation() {
  const format = useFormatter()
  const locale = useLocale()
  const t = useTranslations("Booking")

  const { data, publicTherapist, publicTherapistLoading, publicTherapistError } = useBookingWizard()
  const { locations } = useLocations()
  const { services } = useServices()
  const createdBooking = data.createdBooking as { id?: string; bookingNumber?: string } | null
  const therapist = data.selectedTherapist || publicTherapist || null
  const therapistLoading =
    !therapist && Boolean(data.therapistId) && publicTherapistLoading
  const therapistError = !therapist ? publicTherapistError : null
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)

  const selectedLocation = locations.find((loc) => loc.id === data.locationId)
  const officeTimeZoneLabel = selectedLocation?.timezone
    ? formatTimeZoneLabel(selectedLocation.timezone, locale)
    : null
  const selectedServices = services.filter((service) =>
    data.selectedServiceIds.includes(service.id),
  )
  const selectedService = selectedServices[0]

  const endTimeHHmm = useMemo(() => {
    if (!data.selectedTime) return "00:00"

    const [h, m] = data.selectedTime.split(":").map(Number)
    const dur = data.sessionDurationMinutes ?? selectedService?.duration ?? 60
    const endMinutes = h * 60 + m + dur
    const eh = Math.floor(endMinutes / 60)
    const em = endMinutes % 60

    return `${eh.toString().padStart(2, "0")}:${em.toString().padStart(2, "0")}`
  }, [data.selectedTime, data.sessionDurationMinutes, selectedService])

  const therapistName = therapist ? `${therapist.firstName} ${therapist.lastName}` : null
  const bookingNumber = createdBooking?.bookingNumber || t("notSelectedYet")
  const contactName = `${data.basicInfo.firstName} ${data.basicInfo.lastName}`.trim() || t("notSelectedYet")
  const appointmentDateLabel = data.selectedDate
    ? format.dateTime(data.selectedDate, {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : t("notSelectedYet")
  const appointmentTimeLabel = data.selectedTime ? formatTime12h(data.selectedTime) : t("notSelectedYet")
  const serviceLabel =
    selectedServices.length > 0
      ? selectedServices.map((service) => service.description).join(", ")
      : t("notSelectedYet")
  const contactDetail =
    [data.basicInfo.phone, data.basicInfo.email].filter(Boolean).join(" • ") || undefined
  const summaryTileClassName =
    "rounded-2xl border border-border/70 bg-muted/30 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]"
  const calendarTitle = useMemo(() => {
    const titleBase = therapistName
      ? t("appointmentWith", { name: therapistName })
      : t("appointmentSummary")

    return createdBooking?.bookingNumber
      ? `${titleBase} (${createdBooking.bookingNumber})`
      : titleBase
  }, [createdBooking?.bookingNumber, t, therapistName])
  const calendarDescription = useMemo(() => {
    const bookingNumberLine = createdBooking?.bookingNumber
      ? `${t("bookingNumber")}: ${createdBooking.bookingNumber}`
      : null

    return [bookingNumberLine, data.basicInfo.bookingNotes || undefined]
      .filter(Boolean)
      .join("\n\n")
  }, [createdBooking?.bookingNumber, data.basicInfo.bookingNotes, t])
  const calendarFilename = createdBooking?.bookingNumber
    ? `appointment-${createdBooking.bookingNumber}`
    : undefined
  const qrPayload = useMemo(() => {
    if (!data.selectedDate || !data.selectedTime || !selectedLocation || !createdBooking?.bookingNumber) {
      return null
    }

    return buildICS(
      {
        uid: createdBooking.id
          ? `booking-${createdBooking.id}@booking-saas`
          : `booking-${createdBooking.bookingNumber}@booking-saas`,
        organizerEmail:
          process.env.NEXT_PUBLIC_BOOKING_FROM_EMAIL || "no-reply@booking-saas.com",
        attendeeEmail: data.basicInfo.email || undefined,
        title: calendarTitle,
        description: calendarDescription,
        location: selectedLocation.address,
        date: data.selectedDate,
        startTimeHHmm: data.selectedTime,
        endTimeHHmm,
      },
      selectedLocation.timezone,
    )
  }, [
    calendarDescription,
    calendarTitle,
    createdBooking?.bookingNumber,
    createdBooking?.id,
    data.basicInfo.email,
    data.selectedDate,
    data.selectedTime,
    endTimeHHmm,
    selectedLocation,
  ])

  useEffect(() => {
    let isActive = true

    if (!qrPayload) {
      setQrCodeDataUrl(null)
      return () => {
        isActive = false
      }
    }

    void QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 384,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    })
      .then((dataUrl) => {
        if (isActive) {
          setQrCodeDataUrl(dataUrl)
        }
      })
      .catch((error: unknown) => {
        console.error("Error generating booking QR code:", error)
        if (isActive) {
          setQrCodeDataUrl(null)
        }
      })

    return () => {
      isActive = false
    }
  }, [qrPayload])

  const summaryItems = [
    {
      key: "dateTime",
      icon: CalendarDays,
      label: t("dateTime"),
      value: appointmentDateLabel,
      detail: appointmentTimeLabel,
      accentClassName: "text-emerald-700 dark:text-emerald-300",
    },
    {
      key: "service",
      icon: CheckCircle,
      label: t("service"),
      value: serviceLabel,
    },
    {
      key: "location",
      icon: MapPin,
      label: t("location"),
      value: selectedLocation?.title || t("notSelectedYet"),
      detail: selectedLocation?.address || undefined,
    },
    {
      key: "contact",
      icon: UserRound,
      label: t("contactInfo"),
      value: contactName,
      detail: contactDetail,
    },
  ]

  return (
    <div className="w-full space-y-8">
      <Card className="overflow-hidden border-emerald-300/60 bg-gradient-to-br from-emerald-50 via-background to-background shadow-[0_20px_45px_-28px_rgba(22,163,74,0.45)] dark:border-emerald-500/30 dark:from-emerald-950/40 dark:via-background dark:to-background">
        <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-500/12 ring-8 ring-emerald-500/8">
              <span className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
              <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                <CheckCircle className="h-7 w-7" />
              </span>
            </div>
            <div className="space-y-1">
              <Badge className="w-fit border-emerald-500/30 bg-emerald-500/12 text-emerald-700 hover:bg-emerald-500/12 dark:text-emerald-300">
                {t("bookingConfirmed")}
              </Badge>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {t("bookingSuccess")}
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {t("bookingSuccessMessage")}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-400/25 bg-white/70 px-4 py-3 text-sm text-emerald-800 shadow-sm dark:bg-emerald-950/20 dark:text-emerald-200">
            <span className="block text-xs font-medium uppercase tracking-[0.18em] text-emerald-600/80 dark:text-emerald-300/80">
              {t("bookingNumber")}
            </span>
            <span className="mt-1 block font-semibold">{bookingNumber}</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Card className="flex items-start gap-4 p-6">
            {therapistLoading ? (
              <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
            ) : therapistError ? (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <span className="text-xs text-destructive">Error</span>
              </div>
            ) : therapist ? (
              <Avatar className="h-16 w-16">
                <AvatarImage src={therapist.profileImage || undefined} alt={therapistName || ""} />
                <AvatarIconFallback iconClassName="size-6" />
              </Avatar>
            ) : (
              <div className="h-16 w-16 rounded-full bg-muted" />
            )}
            <div className="flex-1">
              <p className="leading-relaxed text-muted-foreground">
                {therapistLoading ? (
                  <span className="animate-pulse">Cargando informacion del terapeuta...</span>
                ) : therapistError ? (
                  <span className="text-destructive">Error al cargar informacion del terapeuta</span>
                ) : therapist ? (
                  <>
                    Tu cita ha sido confirmada con {therapistName}. Por favor llega{" "}
                    <span className="font-medium text-foreground">15 minutos antes</span> de la hora
                    de la cita.
                  </>
                ) : (
                  "Informacion del terapeuta no disponible"
                )}
              </p>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border/70 pb-4">
              <CardTitle className="text-base">{t("appointmentSummary")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
              <div className={cn(summaryTileClassName, "md:col-span-2")}>
                <div className="flex items-center gap-4">
                  {therapistLoading ? (
                    <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                  ) : therapistError ? (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                      <span className="text-xs text-destructive">!</span>
                    </div>
                  ) : therapist ? (
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={therapist.profileImage || undefined} alt={therapistName || ""} />
                      <AvatarIconFallback />
                    </Avatar>
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-muted" />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      {t("therapist")}
                    </p>
                    <p className="mt-1 text-base font-semibold text-foreground">
                      {therapistLoading ? (
                        <span className="animate-pulse">Cargando...</span>
                      ) : therapistError ? (
                        <span className="text-destructive">Error al cargar</span>
                      ) : therapistName ? (
                        therapistName
                      ) : (
                        "No disponible"
                      )}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {therapistLoading ? (
                        <span className="animate-pulse">Cargando especialidades...</span>
                      ) : therapistError ? (
                        <span className="text-destructive">Error al cargar</span>
                      ) : therapist ? (
                        therapist.specialties.join(", ")
                      ) : (
                        "No disponible"
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {summaryItems.map((item) => {
                const Icon = item.icon

                return (
                  <div key={item.key} className={summaryTileClassName}>
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 rounded-full bg-background p-2 text-emerald-600 shadow-sm dark:text-emerald-400">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                          {item.label}
                        </p>
                        <p className={cn("mt-1 text-sm font-semibold text-foreground", item.accentClassName)}>
                          {item.value}
                        </p>
                        {item.detail ? (
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            {item.detail}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )
              })}

              {officeTimeZoneLabel ? (
                <div className={cn(summaryTileClassName, "md:col-span-2")}>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 rounded-full bg-background p-2 text-emerald-600 shadow-sm dark:text-emerald-400">
                      <Clock3 className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                        {t("timeZone")}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {t("officeTimeZoneNotice", {
                          location: selectedLocation?.title || t("location"),
                          timezone: officeTimeZoneLabel,
                        })}
                      </p>
                      {selectedLocation?.timezone ? (
                        <TimeZoneDifferenceNote
                          officeTimeZone={selectedLocation.timezone}
                          date={data.selectedDate}
                          namespace="Booking"
                          className="mt-2 text-xs text-muted-foreground"
                        />
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("needHelp")}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <p className="text-muted-foreground">{t("helpDescription")}</p>
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <Phone className="h-4 w-4" />
                {t("callUs")}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit space-y-6 p-4 xl:sticky xl:top-6">
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="flex h-48 w-48 items-center justify-center rounded-lg bg-muted p-3">
                {qrCodeDataUrl ? (
                  <Image
                    src={qrCodeDataUrl}
                    alt={t("qrCodeDescription")}
                    className="h-full w-full rounded-md bg-white object-contain"
                    width={192}
                    height={192}
                    unoptimized
                  />
                ) : (
                  <QrCode className="h-24 w-24 text-muted-foreground" />
                )}
              </div>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t("qrCodeDescription")}
            </p>
          </div>

          <div className="space-y-3">
            {data.selectedDate && data.selectedTime && selectedLocation ? (
              <AddToCalendarButton
                title={calendarTitle}
                description={calendarDescription}
                location={selectedLocation.address}
                date={data.selectedDate}
                startTimeHHmm={data.selectedTime}
                endTimeHHmm={endTimeHHmm}
                organizerEmail={process.env.NEXT_PUBLIC_BOOKING_FROM_EMAIL}
                timeZone={selectedLocation.timezone}
                filename={calendarFilename}
              />
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  )
}
