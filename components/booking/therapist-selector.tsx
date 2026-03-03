"use client"

import { AsyncWrapper } from "@/components/ui/async-wrapper"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useBookingWizard } from "@/contexts"
import { useTherapistConfig, useTherapists } from "@/hooks"
import { Stethoscope, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCallback } from "react"
import { useTranslations } from "next-intl"

export function TherapistSelector() {
  const { data, update } = useBookingWizard()
  const { therapists, loading, error } = useTherapists()
  const { isSingleTherapistMode, defaultTherapistId } = useTherapistConfig()
  const t = useTranslations("Booking")

  const handleSelect = useCallback(
    (therapistId: string) => {
      update({
        therapistId,
        selectedDate: null,
        selectedTime: "",
        sessionDurationMinutes: null,
      })
    },
    [update],
  )

  const handleRetry = useCallback(() => {
    window.location.reload()
  }, [])

  if (isSingleTherapistMode && defaultTherapistId) {
    return null
  }

  return (
    <AsyncWrapper
      loading={loading}
      error={error}
      data={therapists}
      skeletonProps={{
        title: t("selectDoctor"),
        variant: "card",
      }}
      errorProps={{
        title: t("selectDoctor"),
        description: t("errorLoadingTherapists"),
        onRetry: handleRetry,
        variant: "card",
      }}
    >
      <Card className="surface-panel">
        <CardContent className="pt-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">{t("selectDoctor")}</h3>
          <RadioGroup
            value={data.therapistId || ""}
            onValueChange={handleSelect}
            className="space-y-3"
          >
            {therapists.map((therapist) => {
              const fullName = `${therapist.firstName} ${therapist.lastName}`.trim()

              return (
                <div key={therapist.id} className="relative">
                  <RadioGroupItem value={therapist.id} id={therapist.id} className="sr-only" />
                  <Label
                    htmlFor={therapist.id}
                    className={cn(
                      "flex w-full cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all duration-200 hover:border-primary/25 hover:bg-primary/6",
                      data.therapistId === therapist.id
                        ? "interactive-selected"
                        : "border-border/80 bg-card/70",
                    )}
                  >
                    <Avatar className="h-12 w-12 border">
                      <AvatarImage src={therapist.profileImage} alt={fullName} />
                      <AvatarFallback>
                        {fullName
                          .split(" ")
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((name) => name[0])
                          .join("") || <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">{fullName}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {therapist.bio || t("therapist")}
                      </p>
                      {therapist.specialties?.length ? (
                        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                          <Stethoscope className="h-3.5 w-3.5" />
                          <span>{therapist.specialties.join(", ")}</span>
                        </div>
                      ) : null}
                    </div>
                  </Label>
                </div>
              )
            })}
          </RadioGroup>
        </CardContent>
      </Card>
    </AsyncWrapper>
  )
}
