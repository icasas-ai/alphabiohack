"use client"
import { useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Phone, QrCode } from "lucide-react"
import { useTranslations } from "next-intl"
import { useLocations, useServices, useTherapist } from "@/hooks"
import { formatTime12h } from "@/lib/format-time"
import { AddToCalendarButton } from "@/components/common/add-to-calendar-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useBookingWizard } from "@/contexts"
import { useMemo } from "react"
import { useFormatter } from "next-intl"

export function BookingConfirmation() {
  const format = useFormatter()
  const t = useTranslations('Booking')
 
  const { data } = useBookingWizard()
  const { locations } = useLocations()
  const { services } = useServices(data.specialtyId || undefined)
  const { therapist, loading: therapistLoading, error: therapistError } = useTherapist(data.therapistId || undefined)

  useEffect(() => {
  console.log("STEP 4 selectedTime:", data.selectedTime)
}, [data.selectedTime])
  // Generate booking number
  const bookingNumber = useMemo(() => {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substring(2, 5).toUpperCase()
    return `BK-${timestamp}-${random}`
  }, [])

  // Get selected location
  const selectedLocation = locations.find(loc => loc.id === data.locationId)
  
  // Get selected service
  const selectedService = services.find(service => service.id === data.selectedServiceIds[0])




  const endTimeHHmm = useMemo(() => {
    if (!data.selectedTime) return "00:00"
    const svc = selectedService
    const [h, m] = data.selectedTime.split(":").map(Number)
    const dur = (svc?.duration ?? 60)
    const endMinutes = h * 60 + m + dur
    const eh = Math.floor(endMinutes / 60)
    const em = endMinutes % 60
    return `${eh.toString().padStart(2,'0')}:${em.toString().padStart(2,'0')}`
  }, [data.selectedTime, selectedService])
  
  console.log("STEP 4 selectedTime:", data.selectedTime)
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header with confirmation */}
      <div className="flex items-center gap-3">
        <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
        <h1 className="text-2xl font-semibold text-foreground">{t('bookingSuccess')}</h1>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left side - Booking details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Doctor info and confirmation message */}
          <Card className="flex items-start gap-4 p-6">
            {therapistLoading ? (
              <div className="h-16 w-16 bg-muted animate-pulse rounded-full" />
            ) : therapistError ? (
              <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <span className="text-destructive text-xs">Error</span>
              </div>
            ) : therapist ? (
              <Avatar className="h-16 w-16">
                <AvatarImage src={therapist.profileImage || "/placeholder.svg"} alt={`${therapist.firstName} ${therapist.lastName}`} />
                <AvatarFallback>
                  {`${therapist.firstName} ${therapist.lastName}`
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-16 w-16 bg-muted rounded-full" />
            )}
            <div className="flex-1">
              <p className="text-muted-foreground leading-relaxed">
                {therapistLoading ? (
                  <span className="animate-pulse">Cargando información del terapeuta...</span>
                ) : therapistError ? (
                  <span className="text-destructive">Error al cargar información del terapeuta</span>
                ) : therapist ? (
                  <>
                    Tu cita ha sido confirmada con {therapist.firstName} {therapist.lastName}. 
                    Por favor llega{" "}
                    <span className="font-medium text-foreground">15 minutos antes</span> de la hora de la cita.
                  </>
                ) : (
                  "Información del terapeuta no disponible"
                )}
              </p>
            </div>
          </Card>

          {/* Appointment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('appointmentSummary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Datos del Terapeuta */}
              <div className="flex items-center gap-4">
                {therapistLoading ? (
                  <div className="h-12 w-12 bg-muted animate-pulse rounded-full" />
                ) : therapistError ? (
                  <div className="h-12 w-12 bg-destructive/10 rounded-full flex items-center justify-center">
                    <span className="text-destructive text-xs">!</span>
                  </div>
                ) : therapist ? (
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={therapist.profileImage || "/placeholder.svg"} alt={`${therapist.firstName} ${therapist.lastName}`} />
                    <AvatarFallback>
                      {`${therapist.firstName} ${therapist.lastName}`
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="h-12 w-12 bg-muted rounded-full" />
                )}
                <div>
                  <h4 className="font-medium text-foreground mb-1">{t('therapist')}</h4>
                  <p className="text-muted-foreground">
                    {therapistLoading ? (
                      <span className="animate-pulse">Cargando...</span>
                    ) : therapistError ? (
                      <span className="text-destructive">Error al cargar</span>
                    ) : therapist ? (
                      `${therapist.firstName} ${therapist.lastName}`
                    ) : (
                      "No disponible"
                    )}
                  </p>
                </div>
              </div>

              {/* Especialidad */}
              <div>
                <h4 className="font-medium text-foreground mb-1">{t('specialty')}</h4>
                <p className="text-muted-foreground">
                  {therapistLoading ? (
                    <span className="animate-pulse">Cargando especialidades...</span>
                  ) : therapistError ? (
                    <span className="text-destructive">Error al cargar</span>
                  ) : therapist ? (
                    therapist.specialties.join(', ')
                  ) : (
                    "No disponible"
                  )}
                </p>
              </div>

              {/* Servicio */}
              <div>
                <h4 className="font-medium text-foreground mb-1">{t('service')}</h4>
                <p className="text-muted-foreground">
                  {selectedService ? selectedService.description : "Servicio no seleccionado"}
                </p>
              </div>

              {/* Fecha y hora */}
              <div>
                <h4 className="font-medium text-foreground mb-1">{t('dateTime')}</h4>
                <p>
  {data.selectedDate
    ? format.dateTime(data.selectedDate, {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : ""}
  <br />
  {data.selectedTime ? formatTime12h(data.selectedTime) : ""}
</p>
              </div>

              {/* Ubicación */}
              <div>
                <h4 className="font-medium text-foreground mb-1">{t('location')}</h4>
                <p className="text-muted-foreground">
                  {selectedLocation ? selectedLocation.address : "Ubicación no seleccionada"}
                </p>
              </div>

              {/* Información de contacto */}
              <div>
                <h4 className="font-medium text-foreground mb-1">{t('contactInfo')}</h4>
                <div className="space-y-1">
                  <p className="text-muted-foreground">
                    <strong>{t('name')}:</strong> {data.basicInfo.firstName} {data.basicInfo.lastName}
                  </p>
                  <p className="text-muted-foreground">
                    <strong>{t('phone')}:</strong> {data.basicInfo.phone || "No proporcionado"}
                  </p>
                  <p className="text-muted-foreground">
                    <strong>{t('email')}:</strong> {data.basicInfo.email || "No proporcionado"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Need Our Assistance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('needHelp')}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-muted-foreground">{t('helpDescription')}</p>
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <Phone className="h-4 w-4" />
                {t('callUs')}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right side - Booking number and QR code */}
        <Card className="space-y-6 p-4">
          <div className="text-center">
            <h2 className="font-medium text-foreground mb-2">{t('bookingNumber')}</h2>
            <Badge variant="outline" className="border-green-500/60 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 px-4 py-2 text-base break-normal w-full">
              {bookingNumber}
            </Badge>
          </div>

          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
                <QrCode className="h-24 w-24 text-muted-foreground" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('qrCodeDescription')}
            </p>
          </div>

          <div className="space-y-3">
            {data.selectedDate && data.selectedTime && selectedLocation ? (
              <AddToCalendarButton
                title={t('appointmentWith', { name: therapist ? `${therapist.firstName} ${therapist.lastName}` : '' })}
                description={data.basicInfo.bookingNotes || ''}
                location={selectedLocation.address}
                date={data.selectedDate}
                startTimeHHmm={data.selectedTime}
                endTimeHHmm={endTimeHHmm}
                organizerEmail={process.env.NEXT_PUBLIC_BOOKING_FROM_EMAIL}
              />
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  )
}
