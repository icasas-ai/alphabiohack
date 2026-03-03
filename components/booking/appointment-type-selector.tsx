"use client"

import { Building2, Home, Phone, Video } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import { BookingType } from "@prisma/client"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useAppointmentTypes } from "@/hooks"
import { useBookingWizard } from "@/contexts"
import { useTranslations } from "next-intl"

interface AppointmentTypeOption {
  id: string
  name: string
  icon: string
  bookingType: BookingType
}

const appointmentTypes: AppointmentTypeOption[] = [
  {
    id: "clinic",
    name: "clinic",
    icon: "🏥",
    bookingType: BookingType.DirectVisit,
  },
  {
    id: "video",
    name: "video",
    icon: "📹",
    bookingType: BookingType.VideoCall,
  },
  {
    id: "phone",
    name: "phone",
    icon: "📞",
    bookingType: BookingType.PhoneCall,
  },
  {
    id: "home",
    name: "home",
    icon: "🏠",
    bookingType: BookingType.HomeVisit,
  },
]

const iconMap = {
  "🏥": Building2,
  "📹": Video,
  "💻": Video,
  "📞": Phone,
  "🏠": Home,
}

export function AppointmentTypeSelector() {
  const { data, update } = useBookingWizard()
  const { isEnabled } = useAppointmentTypes()
  const t = useTranslations('Booking')
  
  // Filtrar tipos de citas habilitados por feature flags
  const enabledAppointmentTypes = appointmentTypes.filter(type => 
    isEnabled(type.bookingType)
  )
  
  const handleSelect = (typeId: string) => {
    const appointmentType = enabledAppointmentTypes.find(type => type.id === typeId)
    if (appointmentType) {
      update({ appointmentType: appointmentType.bookingType })
    }
  }

  // Encontrar el tipo seleccionado basado en el contexto
  const selectedTypeId = enabledAppointmentTypes.find(
    type => type.bookingType === data.appointmentType
  )?.id || enabledAppointmentTypes[0]?.id

  // Si no hay tipos habilitados, mostrar mensaje
  if (enabledAppointmentTypes.length === 0) {
    return (
      <Card className="surface-panel">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <p>{t('noAppointmentTypesAvailable')}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">{t('selectAppointmentType')}</h3>
        <RadioGroup value={selectedTypeId} onValueChange={handleSelect} className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {enabledAppointmentTypes.map((type) => {
            const IconComponent = iconMap[type.icon as keyof typeof iconMap] || Building2
            return (
              <div key={type.id} className="relative">
                <RadioGroupItem value={type.id} id={type.id} className="sr-only" />
                <Label
                  htmlFor={type.id}
                  className={cn(
                    "flex h-20 flex-col items-center justify-center gap-2 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:border-primary/25 hover:bg-primary/6 hover:text-foreground",
                    selectedTypeId === type.id
                      ? "interactive-selected text-primary shadow-md"
                      : "border-border/80 bg-card/70 text-foreground",
                  )}
                >
                  <IconComponent className="h-6 w-6" />
                  <span className="text-sm font-medium">{t(type.name)}</span>
                </Label>
              </div>
            )
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
