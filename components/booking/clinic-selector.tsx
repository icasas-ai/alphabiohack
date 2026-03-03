"use client"

import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import { AsyncWrapper } from "@/components/ui/async-wrapper"
import Image from "next/image"
import { Label } from "@/components/ui/label"
import { MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { useBookingWizard } from "@/contexts"
import { useCallback } from "react"
import { useLocations } from "@/hooks"
import { useTranslations } from "next-intl"

export function ClinicSelector() {
  const { data, update } = useBookingWizard()
  const { locations, loading, error } = useLocations()
  const t = useTranslations('Booking')
  const handleSelect = useCallback((locationId: string) => {
    update({
      locationId,
      selectedDate: null,
      selectedTime: "",
      sessionDurationMinutes: null,
    })
  }, [update])

  const handleRetry = useCallback(() => {
    window.location.reload()
  }, [])

  return (
    <AsyncWrapper
      loading={loading}
      error={error}
      data={locations}
      skeletonProps={{
        title: t('selectClinic'),
        variant: "card"
      }}
      errorProps={{
        title: t('selectClinic'),
        description: t('errorLoadingLocations'),
        onRetry: handleRetry,
        variant: "card"
      }}
    >
      <Card className="surface-panel">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">{t('selectClinic')}</h3>
          <RadioGroup
            value={data.locationId || ""}
            onValueChange={handleSelect}
            className="space-y-3"
          >
            {locations.map((location) => (
              <div key={location.id} className="relative">
                <RadioGroupItem value={location.id} id={location.id} className="sr-only" />
                <Label
                  htmlFor={location.id}
                  className={cn(
                    "flex items-center gap-3 w-full rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 hover:border-primary/25 hover:bg-primary/6",
                    data.locationId === location.id
                      ? "interactive-selected"
                      : "border-border/80 bg-card/70",
                  )}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/10 text-primary">
                    {location.logo ? (
                      <Image 
                        src={location.logo} 
                        alt={location.title} 
                        width={48} 
                        height={48} 
                        className="rounded-full object-cover" 
                      />
                    ) : (
                      <div className="w-6 h-6 bg-background rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold text-foreground">{location.title}</h4>
                    <div className="flex items-center gap-1 text-sm text-foreground/90 mt-1">
                      <MapPin className="h-3 w-3 text-primary" />
                      <span>{location.address}</span>
                    </div>
                    {location.description && (
                      <p className="text-xs text-foreground/70 mt-1">{location.description}</p>
                    )}
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>
    </AsyncWrapper>
  )
}
