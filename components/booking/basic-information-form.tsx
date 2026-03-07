"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, MapPin, Plus, Stethoscope, User } from "lucide-react"
import { useFormatter, useLocale, useTranslations } from "next-intl"
import { useLocations, useServices, useSpecialties } from "@/hooks"
import { formatTime12h } from "@/lib/format-time"; 

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PhoneInput } from "@/components/ui/phone-input"
import { Textarea } from "@/components/ui/textarea"
import { TimeZoneDifferenceNote } from "@/components/common/timezone-difference-note"
import { useBookingWizard } from "@/contexts"
import { cn } from "@/lib/utils"
import { formatTimeZoneLabel } from "@/lib/utils/timezone"
import {
  isValidEmailInput,
  isValidPhoneInput,
  normalizeEmailInput,
  normalizePhoneInput,
  normalizeWhitespace,
} from "@/lib/validation/form-fields"
import { useState } from "react"

interface BasicInformationFormProps {
  showValidation?: boolean
}

export function BasicInformationForm({ showValidation = false }: BasicInformationFormProps) {
  const { data, update, publicTherapist, publicTherapistLoading, publicTherapistError } = useBookingWizard()
  const { locations } = useLocations()
  const { services } = useServices(data.specialtyId || undefined)
  const { specialties } = useSpecialties()
  const t = useTranslations('Booking')
  const tValidation = useTranslations('Booking.Validation')
  const format = useFormatter()
  const locale = useLocale()
  
  const [showNoteField, setShowNoteField] = useState(false)

  const handleInputChange = (field: string, value: string | boolean) => {
    const normalizedValue =
      typeof value === "string"
        ? field === "email"
          ? normalizeEmailInput(value)
          : field === "firstName" || field === "lastName"
            ? normalizeWhitespace(value)
            : value
        : value

    update({
      basicInfo: {
        ...data.basicInfo,
        [field]: normalizedValue
      }
    })
  }

  const handlePhoneChange = (value: string | undefined) => {
    update({
      basicInfo: {
        ...data.basicInfo,
        phone: normalizePhoneInput(value || "")
      }
    })
  }

  const invalidFirstName = showValidation && !normalizeWhitespace(data.basicInfo.firstName)
  const invalidLastName = showValidation && !normalizeWhitespace(data.basicInfo.lastName)
  const invalidEmail =
    showValidation &&
    (!data.basicInfo.email.trim() || !isValidEmailInput(data.basicInfo.email))
  const invalidPhone =
    showValidation &&
    (!data.basicInfo.phone.trim() || !isValidPhoneInput(data.basicInfo.phone))
  const invalidConsent = showValidation && !data.basicInfo.givenConsent

  // Obtener información de la ubicación seleccionada
  const selectedLocation = locations.find(loc => loc.id === data.locationId)
  const officeTimeZoneLabel = selectedLocation?.timezone
    ? formatTimeZoneLabel(selectedLocation.timezone, locale)
    : null
  
  // Obtener información de la especialidad seleccionada
  const selectedSpecialty = specialties.find(spec => spec.id === data.specialtyId)
  
  // Obtener servicios seleccionados
  const selectedServices = services.filter(service => 
    data.selectedServiceIds.includes(service.id)
  )
  const selectedService = selectedServices[0]
  const therapist = data.selectedTherapist || publicTherapist || null
  const therapistLoading =
    !therapist && Boolean(data.therapistId) && publicTherapistLoading
  const therapistError = !therapist ? publicTherapistError : null
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
    const duration = data.sessionDurationMinutes ?? selectedService?.duration

    if (!data.selectedTime || !duration) return ""

    const [h, m] = data.selectedTime.split(":").map(Number)
    const startLabel = formatTime12h(data.selectedTime)

    const endMinutes = h * 60 + m + duration
    const endH = Math.floor(endMinutes / 60)
    const endM = endMinutes % 60
    const endTime = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`
    const endLabel = formatTime12h(endTime)

    return `${startLabel} – ${endLabel}`
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Contact Information Form */}
      <div className="flex-1 lg:flex-[2] space-y-6 bg-card p-6 rounded-lg">
        <div>
          <div className="mb-6 space-y-1">
            <h2 className="text-xl font-semibold text-foreground">{t('enterPersonalInfo')}</h2>
            <p className="text-sm text-muted-foreground">{t('requiredFieldsHint')}</p>
          </div>

          {/* Phone Number */}
          <div className="space-y-2 mb-6">
            <Label htmlFor="booking-phone" className="text-sm font-medium">
              {t('phone')} <span className="text-destructive">*</span>
            </Label>
            <PhoneInput
              id="booking-phone"
              value={data.basicInfo.phone}
              onChange={handlePhoneChange}
              placeholder={t('phone')}
              defaultCountry="US"
              aria-required="true"
              aria-invalid={invalidPhone}
              className={cn(
                invalidPhone &&
                  "[&_input]:border-red-500 [&_input]:ring-1 [&_input]:ring-red-500/20",
              )}
              autoComplete="tel"
            />
            {invalidPhone ? (
              <p className="text-sm text-red-500">
                {data.basicInfo.phone.trim()
                  ? tValidation('invalidPhone')
                  : tValidation('enterPhone')}
              </p>
            ) : null}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('phoneConsentText')}
            </p>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="booking-first-name" className="text-sm font-medium">
                {t('firstName')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="booking-first-name"
                placeholder={t('firstName')}
                value={data.basicInfo.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                aria-required="true"
                aria-invalid={invalidFirstName}
                className={cn(invalidFirstName && "border-red-500 ring-1 ring-red-500/20")}
                autoComplete="given-name"
                autoCapitalize="words"
                maxLength={80}
              />
              {invalidFirstName ? (
                <p className="text-sm text-red-500">{tValidation('enterFirstName')}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="booking-last-name" className="text-sm font-medium">
                {t('lastName')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="booking-last-name"
                placeholder={t('lastName')}
                value={data.basicInfo.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                aria-required="true"
                aria-invalid={invalidLastName}
                className={cn(invalidLastName && "border-red-500 ring-1 ring-red-500/20")}
                autoComplete="family-name"
                autoCapitalize="words"
                maxLength={80}
              />
              {invalidLastName ? (
                <p className="text-sm text-red-500">{tValidation('enterLastName')}</p>
              ) : null}
            </div>
          </div>

          {/* Email */}
          <div className="mb-6 space-y-2">
            <Label htmlFor="booking-email" className="text-sm font-medium">
              {t('email')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="booking-email"
              type="email"
              placeholder={t('email')}
              value={data.basicInfo.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              aria-required="true"
              aria-invalid={invalidEmail}
              className={cn(invalidEmail && "border-red-500 ring-1 ring-red-500/20")}
              autoComplete="email"
              autoCapitalize="none"
              inputMode="email"
              spellCheck={false}
            />
            {invalidEmail ? (
              <p className="text-sm text-red-500">
                {data.basicInfo.email.trim()
                  ? tValidation('invalidEmail')
                  : tValidation('enterEmail')}
              </p>
            ) : null}
          </div>

          {/* Marketing Checkbox */}
          <div
            className={cn(
              "mb-8 rounded-xl transition-colors",
              invalidConsent && "border border-red-500/70 bg-red-500/5 p-3",
            )}
          >
            <div className="flex items-start space-x-3">
            <Checkbox
              id="marketing"
              checked={data.basicInfo.givenConsent}
              onCheckedChange={(checked) => handleInputChange("givenConsent", checked as boolean)}
              className="mt-1"
              aria-required="true"
            />
            <div className="space-y-2">
              <Label htmlFor="marketing" className="text-sm font-medium leading-relaxed cursor-pointer">
                {t('marketingConsentLabel', { clinicName: selectedLocation?.title || t('clinic') })} <span className="text-destructive">*</span>
              </Label>
              <p className="text-xs font-medium text-muted-foreground">
                {t('consentRequiredHint')}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t('marketingConsentText', { clinicName: selectedLocation?.title || t('clinic') })}
              </p>
            </div>
            </div>
            {invalidConsent ? (
              <p className="mt-3 text-sm text-red-500">{tValidation('acceptSmsConsent')}</p>
            ) : null}
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
              maxLength={1000}
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
                {officeTimeZoneLabel ? (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
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
                      />
                    ) : null}
                  </div>
                ) : null}
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
