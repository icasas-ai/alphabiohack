"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useServices } from "@/hooks"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppointmentFlags } from "@/hooks"
import { useBookingWizard } from "@/contexts"
import { cn } from "@/lib/utils"
import { useEffect } from "react"
import { useTranslations } from "next-intl"

interface SpecialtySelectorProps {
  showValidation?: boolean
}

export function SpecialtySelector({ showValidation = false }: SpecialtySelectorProps) {
  const { data, update } = useBookingWizard()
  const { services, loading: servicesLoading, error: servicesError } = useServices()
  const { shouldShowPrices } = useAppointmentFlags()
  const t = useTranslations('Booking')

  useEffect(() => {
    if (data.selectedServiceIds.length <= 1) {
      return
    }

    const firstServiceId = data.selectedServiceIds[0]
    const primarySelectedService = services.find((service) => service.id === firstServiceId)

    update({
      selectedServiceIds: firstServiceId ? [firstServiceId] : [],
      specialtyId: primarySelectedService?.specialtyId ?? null,
    })
  }, [data.selectedServiceIds, services, update])

  const handleServiceToggle = (serviceId: string) => {
    const isCurrentlySelected = data.selectedServiceIds[0] === serviceId
    const nextServiceIds = isCurrentlySelected ? [] : [serviceId]

    const primarySelectedService = services.find(
      (service) => service.id === nextServiceIds[0],
    )

    update({
      selectedServiceIds: nextServiceIds,
      specialtyId: primarySelectedService?.specialtyId ?? null,
    })
  }

  if (servicesError) {
    return (
      <Alert variant="destructive" className="p-6">
        <AlertDescription>
          <div className="text-center py-2">
            <p className="text-sm">{t('error')}: {servicesError}</p>
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
        <h3 className="text-lg font-semibold text-foreground mb-4">{t('selectService')}</h3>
        {servicesLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-32 rounded-2xl" />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">{t('noServicesAvailable')}</p>
          </div>
        ) : (
          <div className="max-h-[26rem] overflow-y-auto pr-2 md:max-h-[32rem]">
            <div
              className={cn(
                "grid grid-cols-1 gap-4 pr-2 md:grid-cols-3",
                showValidation &&
                  data.selectedServiceIds.length === 0 &&
                  "[&>div]:border-red-500/70 [&>div]:ring-1 [&>div]:ring-red-500/20",
              )}
            >
              {services.map((service) => (
                <Card
                  key={service.id}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
                    data.selectedServiceIds[0] === service.id
                      ? "interactive-selected ring-1 ring-primary/10"
                      : "border-border/80 bg-card/70",
                  )}
                  onClick={(e) => {
                    if (e.target === e.currentTarget || !(e.target as HTMLElement).closest('[role="checkbox"]')) {
                      handleServiceToggle(service.id)
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground mb-1">{service.description}</h4>
                        <div className="flex gap-2">
                          {shouldShowPrices() ? (
                            <Badge variant="info" className="text-sm">
                              ${service.cost}
                            </Badge>
                          ) : null}
                          <Badge variant="outline" className="text-sm">
                            {t('serviceDuration', { duration: service.duration })}
                          </Badge>
                        </div>
                      </div>
                      <div onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={data.selectedServiceIds[0] === service.id}
                          onCheckedChange={() => handleServiceToggle(service.id)}
                          className="ml-2"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        {showValidation && data.selectedServiceIds.length === 0 ? (
          <p className="mt-3 text-sm text-red-500">{t('selectService')}</p>
        ) : null}
      </div>
    </div>
  )
}
