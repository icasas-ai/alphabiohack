"use client"

import { AlertCircle, Calendar as CalendarIcon, Clock } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { useAvailabilityCalendar, useLocations, useServices } from "@/hooks"
import { useEffect, useMemo, useState } from "react"
import { useFormatter, useLocale, useNow, useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { TimeZoneDifferenceNote } from "@/components/common/timezone-difference-note"
import { useBookingWizard } from "@/contexts"
import { cn } from "@/lib/utils"
import { combineDateAndTimeToUtc, parseDateStringInTimeZone } from "@/lib/utils/timezone"
import { formatTimeZoneLabel } from "@/lib/utils/timezone"

const calendarDateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

interface DateTimeSelectorProps {
  showValidation?: boolean
}

export function DateTimeSelector({ showValidation = false }: DateTimeSelectorProps) {
  const { data, update } = useBookingWizard()
  const t = useTranslations('Booking')
  const format = useFormatter()
  const locale = useLocale()
  const now = useNow({ updateInterval: 60_000 })
  const [month, setMonth] = useState<Date>((data.selectedDate as Date) || (now as Date))
  const { services } = useServices(data.specialtyId || undefined)
  const { locations } = useLocations()

  const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`
  const selectedDateKey = data.selectedDate ? calendarDateKey(data.selectedDate) : undefined
  const {
    monthSummary,
    daySlots,
    monthLoading,
    dayLoading,
    error,
  } = useAvailabilityCalendar(data.therapistId, data.locationId, monthKey, selectedDateKey)

  const selectedService = useMemo(
    () => services.find((service) => data.selectedServiceIds.includes(service.id)),
    [data.selectedServiceIds, services],
  )

  const effectiveDurationMinutes = data.sessionDurationMinutes ?? selectedService?.duration ?? null
  const selectedLocation = useMemo(
    () => locations.find((location) => location.id === data.locationId),
    [data.locationId, locations],
  )
  const officeTimeZone = selectedLocation?.timezone || null
  const officeTimeZoneLabel = officeTimeZone
    ? formatTimeZoneLabel(officeTimeZone, locale)
    : null
  const selectedDayKeyRaw = daySlots?.date || selectedDateKey
  const selectedDayKey = selectedDayKeyRaw ? selectedDayKeyRaw.slice(0, 10) : undefined
  const visibleDaySlots = useMemo(() => {
    if (!daySlots?.slots?.length) return []
    if (!selectedDayKey) {
      return daySlots.slots
    }
    const nowDate = now as Date

    return daySlots.slots.filter((slot) => {
      if (officeTimeZone) {
        const selectedDateInOfficeTZ = parseDateStringInTimeZone(selectedDayKey, officeTimeZone)
        const slotDateTime = combineDateAndTimeToUtc(selectedDateInOfficeTZ, slot.value, officeTimeZone)
        return slotDateTime.getTime() > nowDate.getTime()
      }

      const [hours, minutes] = slot.value.split(":").map(Number)
      const slotDateTime = new Date(data.selectedDate || nowDate)
      slotDateTime.setHours(hours, minutes, 0, 0)
      return slotDateTime.getTime() > nowDate.getTime()
    })
  }, [data.selectedDate, daySlots?.slots, now, officeTimeZone, selectedDayKey])

  const availableDateKeys = useMemo(
    () => new Set((monthSummary?.days || []).filter((day) => day.hasAvailability).map((day) => day.date)),
    [monthSummary],
  )

  useEffect(() => {
    if (daySlots && daySlots.sessionDurationMinutes !== data.sessionDurationMinutes) {
      update({ sessionDurationMinutes: daySlots.sessionDurationMinutes })
    }

    if (data.selectedTime) {
      const stillAvailable = visibleDaySlots.some(
        (slot) => slot.value === data.selectedTime && slot.isAvailable,
      )

      if (!stillAvailable) {
        update({ selectedTime: "" })
      }
    }
  }, [data.selectedTime, data.sessionDurationMinutes, daySlots, update, visibleDaySlots])

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return

    const normalized = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      12, 0, 0
    )

    update({
      selectedDate: normalized,
      selectedTime: "",
      sessionDurationMinutes: null,
    })
  }

  const handleTimeSelect = (time: string) => {
    update({ selectedTime: time })
  }

  const formatSelectedDate = (date: Date) => {
    return format.dateTime(date, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime12h = (time: string) => {
    const [h, m] = time.split(":").map(Number)
    const isPM = h >= 12
    const hour = ((h + 11) % 12) + 1
    return `${hour}:${m.toString().padStart(2, "0")} ${isPM ? "PM" : "AM"}`
  }

  const isDateAvailable = (date: Date) => {
    const todayKey = calendarDateKey(new Date())
    const dateKey = calendarDateKey(date)

    if (dateKey < todayKey) return false

    return availableDateKeys.has(dateKey)
  }

  return (
    <main className="w-full max-w-7xl mx-auto" role="main">
      <div className="space-y-6">
        <Card className="overflow-hidden border">
          <CardContent className="relative p-0 md:pr-48">
            {!data.therapistId || !data.locationId ? (
              <section className="p-6">
                <Alert variant="warning">
                  <AlertDescription>{t("selectTherapistAndLocationFirst")}</AlertDescription>
                </Alert>
              </section>
            ) : (
              <>
                {officeTimeZoneLabel ? (
                  <section className="px-6 pt-6">
                    <Alert variant="info">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <AlertDescription>
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">
                          {t("timesShownInOfficeTime")}
                          </p>
                          <p className="text-muted-foreground">
                          {t("officeTimeZoneNotice", {
                            location: selectedLocation?.title || t("location"),
                            timezone: officeTimeZoneLabel,
                          })}
                          </p>
                        </div>
                      </AlertDescription>
                    </Alert>
                  </section>
                ) : null}

                <section className="p-6" aria-label={t('selectDate')}>
                  {monthLoading ? (
                    <div className="surface-panel min-h-[360px] space-y-4 px-6 py-8">
                      <div className="space-y-2 text-center">
                        <p className="text-sm font-medium text-foreground">{t("loading")}</p>
                        <p className="text-xs text-muted-foreground">{t("loadingAvailability")}</p>
                      </div>
                      <div className="grid gap-4">
                        <Skeleton className="h-5 w-40 mx-auto" />
                        <div className="grid grid-cols-7 gap-2">
                          {Array.from({ length: 35 }).map((_, index) => (
                            <Skeleton key={index} className="h-10 rounded-xl" />
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "rounded-xl",
                        showValidation &&
                          !data.selectedDate &&
                          "border border-red-500/70 ring-1 ring-red-500/20 p-2",
                      )}
                    >
                      <Calendar
                        key={month.toISOString()}
                        mode="single"
                        selected={data.selectedDate || undefined}
                        onSelect={handleDateSelect}
                        month={month}
                        onMonthChange={setMonth}
                        disabled={(date) => !isDateAvailable(date)}
                        showOutsideDays={false}
                        className="bg-transparent p-0 w-full"
                      />
                    </div>
                  )}
                  {showValidation && !data.selectedDate ? (
                    <p className="mt-3 text-sm text-red-500">{t('selectDate')}</p>
                  ) : null}
                </section>

                <aside
                  className={cn(
                    "no-scrollbar inset-y-0 right-0 flex max-h-72 w-full scroll-pb-6 flex-col gap-4 overflow-y-auto border-t p-6 md:absolute md:max-h-none md:w-48 md:border-t-0 md:border-l",
                    showValidation && !data.selectedTime && data.selectedDate && "bg-red-500/5",
                  )}
                  aria-label={t('availableTimeSlots')}
                >
                  <div className="grid gap-2">
                    {data.selectedDate ? (
                      dayLoading ? (
                        <div className="space-y-2 py-2">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Skeleton key={index} className="h-10 w-full rounded-lg sm:h-12" />
                          ))}
                        </div>
                      ) : visibleDaySlots.length ? (
                        visibleDaySlots.map((timeSlot) => (
                          <Button
                            key={timeSlot.value}
                            variant={data.selectedTime === timeSlot.value ? "default" : "outline"}
                            onClick={() => timeSlot.isAvailable && handleTimeSelect(timeSlot.value)}
                            disabled={!timeSlot.isAvailable}
                            className="w-full h-10 sm:h-12"
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            {formatTime12h(timeSlot.value)}
                          </Button>
                        ))
                      ) : (
                        <div className="text-center py-6 text-xs text-muted-foreground">
                          {t('noSlotsAvailable')}
                        </div>
                      )
                    ) : (
                      <Alert variant="info" className="px-3 py-3 text-xs">
                        <AlertDescription>{t('selectDateFirst')}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                  {showValidation && !data.selectedTime ? (
                    <p className="text-sm text-red-500">
                      {data.selectedDate ? t('selectTime') : t('selectDateFirst')}
                    </p>
                  ) : null}
                </aside>
              </>
            )}
          </CardContent>

          <CardFooter className="border-t bg-gradient-to-r from-muted/5 via-background to-muted/5 p-2 overflow-x-hidden">
            <footer className="w-full space-y-3 sm:space-y-4" aria-label={t('appointmentSummary')}>
              <section>
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
                    <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm sm:text-base font-semibold text-foreground mb-1 sm:mb-2">{t('appointmentSummary')}</h4>
                    {data.selectedDate && data.selectedTime ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-muted/50">
                            <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">{t('date')}</p>
                            <p className="text-sm font-semibold text-foreground">{formatSelectedDate(data.selectedDate)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-muted/50">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">{t('time')}</p>
                            <p className="text-sm font-semibold text-foreground">{formatTime12h(data.selectedTime)}</p>
                          </div>
                        </div>
                        {effectiveDurationMinutes ? (
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-muted/50">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">{t('duration')}</p>
                              <p className="text-sm font-semibold text-foreground">
                                {t('serviceDuration', { duration: effectiveDurationMinutes })}
                              </p>
                            </div>
                          </div>
                        ) : null}
                        {officeTimeZoneLabel ? (
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-muted/50">
                              <AlertCircle className="h-3 w-3 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">{t('timeZone')}</p>
                              <p className="text-sm font-semibold text-foreground">
                                {officeTimeZoneLabel}
                              </p>
                              {officeTimeZone ? (
                                <TimeZoneDifferenceNote
                                  officeTimeZone={officeTimeZone}
                                  date={data.selectedDate}
                                  namespace="Booking"
                                />
                              ) : null}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <div className="p-2 rounded-lg bg-muted/50">
                          <CalendarIcon className="h-4 w-4" />
                        </div>
                        <p className="text-sm">{t('selectDateAndTime')}</p>
                      </div>
                    )}
                    {error ? (
                      <p className="text-sm text-destructive mt-3">{error}</p>
                    ) : null}
                  </div>
                </div>
              </section>
            </footer>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}
