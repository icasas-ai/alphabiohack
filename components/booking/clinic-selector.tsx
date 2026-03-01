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
      <Card>
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
                    "flex items-center gap-3 w-full p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-primary",
                    data.locationId === location.id ? "border-primary bg-primary/5" : "border-border hover:border-border/80",
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
