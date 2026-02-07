"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, MapPin, Plus, Stethoscope, User } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import { useLocations, useServices, useSpecialties, useTherapist } from "@/hooks"
import { formatTime12h } from "@/lib/format-time"; 

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PhoneInput } from "@/components/ui/phone-input"
import { Textarea } from "@/components/ui/textarea"
import { useBookingWizard } from "@/contexts"
import { useState } from "react"

export function BasicInformationForm() {
  const { data, update } = useBookingWizard()
  const { locations } = useLocations()
  const { services } = useServices(data.specialtyId || undefined)
  const { specialties } = useSpecialties()
  const { therapist, loading: therapistLoading, error: therapistError } = useTherapist(data.therapistId || undefined)
  const t = useTranslations('Booking')
  const format = useFormatter()
  
  const [showNoteField, setShowNoteField] = useState(false)

  const handleInputChange = (field: string, value: string | boolean) => {
    update({
      basicInfo: {
        ...data.basicInfo,
        [field]: value
      }
    })
  }

  const handlePhoneChange = (value: string | undefined) => {
    update({
      basicInfo: {
        ...data.basicInfo,
        phone: value || ""
      }
    })
  }

  // Obtener información de la ubicación seleccionada
  const selectedLocation = locations.find(loc => loc.id === data.locationId)
  
  // Obtener información de la especialidad seleccionada
  const selectedSpecialty = specialties.find(spec => spec.id === data.specialtyId)
  
  // Obtener servicios seleccionados
  const selectedServices = services.filter(service => 
    data.selectedServiceIds.includes(service.id)
  )
  const selectedService = selectedServices[0]
  
  // Calcular duración total
  //const totalDuration = selectedServices.reduce((total, service) => total + service.duration, 0)

  // Formatear fecha seleccionada usando useFormatter
  const formatSelectedDate = () => {
    if (!data.selectedDate) return t('selectDate')
    
    return format.dateTime(data.selectedDate, {
      weekday: "long",
      day: "numeric",
      month: "long"
    })
  }

  // Formatear hora seleccionada usando useFormatter
  const formatSelectedTime = () => {
   if (!data.selectedTime || !selectedService?.duration) return ""

  const [h, m] = data.selectedTime.split(":").map(Number);
  const startLabel = formatTime12h(data.selectedTime);

  const endMinutes = h * 60 + m + selectedService.duration
  const endH = Math.floor(endMinutes / 60);
  const endM = endMinutes % 60;
  const endTime = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
  const endLabel = formatTime12h(endTime);

  return `${startLabel} – ${endLabel}`;
};

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Contact Information Form */}
      <div className="flex-1 lg:flex-[2] space-y-6 bg-card p-6 rounded-lg">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-6">{t('enterPersonalInfo')}</h2>

          {/* Phone Number */}
          <div className="space-y-2 mb-6">
            <PhoneInput
              value={data.basicInfo.phone}
              onChange={handlePhoneChange}
              placeholder={t('phone')}
              defaultCountry="US"
            />
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('phoneConsentText')}
            </p>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Input
              placeholder={t('firstName')}
              value={data.basicInfo.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
            />
            <Input
              placeholder={t('lastName')}
              value={data.basicInfo.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
            />
          </div>

          {/* Email */}
          <div className="mb-6">
            <Input
              type="email"
              placeholder={t('email')}
              value={data.basicInfo.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />
          </div>

          {/* Marketing Checkbox */}
          <div className="flex items-start space-x-3 mb-8">
            <Checkbox
              id="marketing"
              checked={data.basicInfo.givenConsent}
              onCheckedChange={(checked) => handleInputChange("givenConsent", checked as boolean)}
              className="mt-1"
            />
            <div className="space-y-2">
              <Label htmlFor="marketing" className="text-sm font-medium leading-relaxed cursor-pointer">
                {t('marketingConsentLabel', { clinicName: selectedLocation?.title || t('clinic') })}
              </Label>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t('marketingConsentText', { clinicName: selectedLocation?.title || t('clinic') })}
              </p>
            </div>
          </div>
        </div>

        {/* Appointment Note */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">{t('appointmentNote')}</h3>
            {!showNoteField && (
              <Button
                type="button"
                variant="ghost"
                className="text-primary hover:text-primary/90 hover:bg-primary/10"
                onClick={() => setShowNoteField(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                {t('add')}
              </Button>
            )}
          </div>

          {showNoteField && (
            <Textarea
              placeholder={t('addNotePlaceholder')}
              value={data.basicInfo.bookingNotes}
              onChange={(e) => handleInputChange("bookingNotes", e.target.value)}
              className="min-h-[100px] resize-none"
            />
          )}
        </div>

        {/* Cancellation Policy */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">{t('cancellationPolicy')}</h3>
          <p className="text-sm text-muted-foreground">{t('cancellationPolicyText')}</p>
          <Button variant="link" className="text-primary hover:text-primary/90 p-0 h-auto font-medium">
            {t('readFullPolicy')}
          </Button>
        </div>
      </div>

      {/* Appointment Summary */}
      <div className="flex-1 lg:max-w-sm">
        <Card className="sticky top-6">
          <CardHeader className="">
            <div className="flex flex-col items-center justify-between">
              <CardTitle className="text-lg font-semibold text-center">{t('appointmentSummary')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Datos del Terapeuta */}
            {therapistLoading ? (
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-foreground">{t('therapist')}</h4>
                  <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
                </div>
              </div>
            ) : therapistError ? (
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-foreground">{t('therapist')}</h4>
                  <p className="text-sm text-destructive">Error al cargar terapeuta</p>
                </div>
              </div>
            ) : therapist ? (
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-foreground">{t('therapist')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {therapist.firstName} {therapist.lastName}
                  </p>
                  {therapist.specialties && therapist.specialties.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {therapist.specialties.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            ) : null}

            {/* Especialidad */}
            {selectedSpecialty && (
              <div className="flex items-start gap-3">
                <Stethoscope className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-foreground">{t('specialty')}</h4>
                  <p className="text-sm text-muted-foreground">{selectedSpecialty.name}</p>
                </div>
              </div>
            )}

            {/* Fecha y hora */}
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-1 flex-1">
                <h4 className="text-sm font-semibold text-foreground">{t('dateAndTime')}</h4>
                  
                  <div className="flex-1 flex flex-col mt-2">
                    <p className="text-sm font-medium text-foreground capitalize"> {formatSelectedDate()}</p>
                    <p className="text-xs text-muted-foreground">{formatSelectedTime()}</p>
                  </div>
              </div>
            </div>

            {/* Dirección */}
            {selectedLocation && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-foreground">{t('address')}</h4>
                  <p className="text-sm text-muted-foreground">{selectedLocation.address}</p>
                </div>
              </div>
            )}

            {/* Servicios */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">{t('services')}</h4>
              {selectedServices.map((service) => (
                <div key={service.id} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}