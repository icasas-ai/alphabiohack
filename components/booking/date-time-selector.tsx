"use client"

import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useAvailabilityCalendar, useServices } from "@/hooks"
import { useEffect, useMemo, useState } from "react"
import { useFormatter, useNow, useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { useBookingWizard } from "@/contexts"

const calendarDateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

export function DateTimeSelector() {
  const { data, update } = useBookingWizard()
  const t = useTranslations('Booking')
  const format = useFormatter()
  const now = useNow()
  const [month, setMonth] = useState<Date>((data.selectedDate as Date) || (now as Date))
  const { services } = useServices(data.specialtyId || undefined)

  const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`
  const selectedDateKey = data.selectedDate ? calendarDateKey(data.selectedDate) : undefined
  const {
    monthSummary,
    daySlots,
    loading,
    error,
  } = useAvailabilityCalendar(data.therapistId, data.locationId, monthKey, selectedDateKey)

  const selectedService = useMemo(
    () => services.find((service) => data.selectedServiceIds.includes(service.id)),
    [data.selectedServiceIds, services],
  )

  const effectiveDurationMinutes = data.sessionDurationMinutes ?? selectedService?.duration ?? null

  const availableDateKeys = useMemo(
    () => new Set((monthSummary?.days || []).filter((day) => day.hasAvailability).map((day) => day.date)),
    [monthSummary],
  )

  useEffect(() => {
    if (daySlots && daySlots.sessionDurationMinutes !== data.sessionDurationMinutes) {
      update({ sessionDurationMinutes: daySlots.sessionDurationMinutes })
    }

    if (daySlots && data.selectedTime) {
      const stillAvailable = daySlots.slots.some(
        (slot) => slot.value === data.selectedTime && slot.isAvailable,
      )

      if (!stillAvailable) {
        update({ selectedTime: "" })
      }
    }
  }, [data.selectedTime, data.sessionDurationMinutes, daySlots, update])

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
        <header className="text-center space-y-2" aria-labelledby="booking-date-time-heading">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 mb-4">
            <CalendarIcon className="h-8 w-8 text-primary" />
          </div>
          <h2 id="booking-date-time-heading" className="text-2xl sm:text-3xl font-bold text-foreground">
            {t('selectDateTime')}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
            {t('chooseAppointmentTime')}
          </p>
        </header>

        <Card className="overflow-hidden shadow-2xl border-0">
          <CardContent className="relative p-0 md:pr-48">
            {!data.therapistId || !data.locationId ? (
              <section className="p-6">
                <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                  {t("selectTherapistAndLocationFirst")}
                </div>
              </section>
            ) : (
              <>
                <section className="p-6" aria-label={t('selectDate')}>
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
                </section>

                <aside className="no-scrollbar inset-y-0 right-0 flex max-h-72 w-full scroll-pb-6 flex-col gap-4 overflow-y-auto border-t p-6 md:absolute md:max-h-none md:w-48 md:border-t-0 md:border-l" aria-label={t('availableTimeSlots')}>
                  <div className="grid gap-2">
                    {data.selectedDate ? (
                      loading ? (
                        <div className="text-center py-6 text-xs text-muted-foreground">{t('loading')}</div>
                      ) : daySlots?.slots?.length ? (
                        daySlots.slots.map((timeSlot) => (
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
                      <div className="text-center py-6 text-xs text-muted-foreground">{t('selectDateFirst')}</div>
                    )}
                  </div>
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
