import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { useBookingWizard } from "@/contexts"
import { useTherapist, useTherapistConfig } from "@/hooks"

import { Badge } from "@/components/ui/badge"
import { Fingerprint } from "lucide-react"

export function DoctorInfo() {
  const { defaultTherapistId } = useTherapistConfig()
  const { data } = useBookingWizard()
  const { therapist, loading, error } = useTherapist(data.therapistId || defaultTherapistId || undefined)

  // Si está cargando, mostrar skeleton
  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="flex items-center gap-4 pt-6">
          <div className="h-16 w-16 bg-muted rounded-full animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
            <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Si hay error o no hay terapeuta, no mostrar nada
  if (error || !therapist) {
    return null
  }

  // Crear el objeto doctor con los datos del terapeuta de la API
  const doctor = {
    name: `${therapist.firstName} ${therapist.lastName}`,
    specialty: therapist.specialties[0] || "Especialista",
    rating: therapist.rating,
    image: therapist.profileImage,
    bio: therapist.bio,
  }
  return (
    <Card className="mb-6 bg-muted">
      <CardContent className="flex items-center gap-4 ">
        <Avatar className="h-16 w-16">
          <AvatarImage src={doctor.image || "/placeholder.svg"} alt={doctor.name} />
          <AvatarFallback>
            {doctor.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-foreground">{doctor.name}</h3>
            <Badge variant="default" className="bg-accent">
              ⭐ {doctor.rating}
            </Badge>
          </div>
          <p className="text-sm text-primary font-medium mb-2">{doctor.specialty}</p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Fingerprint className="h-4 w-4 text-primary" />
            <span>{doctor.bio}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
