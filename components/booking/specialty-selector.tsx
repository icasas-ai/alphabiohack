"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useServices, useSpecialties } from "@/hooks"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppointmentFlags } from "@/hooks"
import { useBookingWizard } from "@/contexts"
import { useTranslations } from "next-intl"

export function SpecialtySelector() {
  const { data, update } = useBookingWizard()
  const { specialties, loading: specialtiesLoading, error: specialtiesError } = useSpecialties()
  const { services, loading: servicesLoading, error: servicesError } = useServices(data.specialtyId || undefined)
  const { /* canSelectMultipleServices, */ shouldShowPrices } = useAppointmentFlags()
  const t = useTranslations('Booking')

  const handleSpecialtyChange = (specialtyId: string) => {
    if (specialtyId && specialtyId.trim() !== "") {
      update({ specialtyId })
      // Limpiar servicios seleccionados cuando cambia la especialidad
      update({ selectedServiceIds: [] })
    }
  }

  const handleServiceToggle = (serviceId: string) => {
    const currentServices = data.selectedServiceIds
    const newServices = currentServices.includes(serviceId)
      ? currentServices.filter((id) => id !== serviceId)
      : [...currentServices, serviceId]
    
    update({ selectedServiceIds: newServices })
  }

  const getSelectedSpecialtyName = () => {
    const specialty = specialties.find(s => s.id === data.specialtyId)
    return specialty ? specialty.name : t('selectSpecialty')
  }

  if (specialtiesError || servicesError) {
    return (
      <Alert variant="destructive" className="p-6">
        <AlertDescription>
          <div className="text-center py-2">
            <p className="text-sm">{t('error')}: {specialtiesError || servicesError}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-sm text-primary hover:underline"
            >
              {t('retry')}
            </button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="surface-panel space-y-6 p-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">{t('selectSpecialty')}</h3>
        {specialtiesLoading ? (
          <div className="space-y-3 py-2">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ) : (
          <Select 
            value={data.specialtyId || ""} 
            onValueChange={handleSpecialtyChange}
          >
            <SelectTrigger
              className="w-full min-h-10 h-auto py-2 items-center text-left"
              aria-label={t('selectSpecialty')}
            >
              <SelectValue
                className="w-full text-left truncate"
                placeholder={getSelectedSpecialtyName()}
              >
                {getSelectedSpecialtyName()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent
              position="popper"
              className="max-h-[60vh] w-[--radix-select-trigger-width] max-w-[95vw] sm:max-w-[36rem] overscroll-contain"
            >
              {specialties.map((specialty) => (
                <SelectItem key={specialty.id} value={specialty.id}>
                  <div className="flex w-full min-w-0 flex-col items-start gap-1 py-1.5 min-h-12">
                    <div className="w-full min-w-0 font-medium truncate" title={specialty.name}>{specialty.name}</div>
                    {specialty.description && (
                      <div className="w-full min-w-0 text-xs text-muted-foreground whitespace-normal break-words line-clamp-2" title={specialty.description}>
                        {specialty.description}
                      </div>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {data.specialtyId && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">{t('selectService')}</h3>
          {servicesLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-32 rounded-2xl" />
              ))}
            </div>
          ) : services.length === 0 ? (
            <Alert variant="info">
              <AlertDescription>{t('noServicesAvailable')}</AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {services.map((service) => (
                <Card
                  key={service.id}
                  className={`cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                    data.selectedServiceIds.includes(service.id)
                      ? "interactive-selected ring-1 ring-primary/10"
                      : "border-border/80 bg-card/70"
                  }`}
                  onClick={(e) => {
                    // Solo manejar el click si no se hizo click en el checkbox
                    if (e.target === e.currentTarget || !(e.target as HTMLElement).closest('[role="checkbox"]')) {
                      handleServiceToggle(service.id);
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground mb-1">{service.description}</h4>
                        <div className="flex gap-2">
                          {shouldShowPrices() && (
                          <Badge variant="info" className="text-sm">
                              ${service.cost}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-sm">
                            {t('serviceDuration', { duration: service.duration })}
                          </Badge>
                        </div>
                      </div>
                      <div onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={data.selectedServiceIds.includes(service.id)}
                          onCheckedChange={() => handleServiceToggle(service.id)}
                          className="ml-2"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
