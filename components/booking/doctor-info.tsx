import { Avatar, AvatarIconFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { useBookingWizard } from "@/contexts"
import { useTherapist } from "@/hooks"
import { isSingleTherapistModeEnabled } from "@/lib/config/features"

import { Fingerprint } from "lucide-react"

export function DoctorInfo() {
  const { data, publicTherapist, publicTherapistLoading, publicTherapistError } = useBookingWizard()
  const isSingleTherapistMode = isSingleTherapistModeEnabled()
  const { therapist, loading, error } = useTherapist(
    !isSingleTherapistMode ? (data.therapistId || undefined) : undefined
  )
  const sourceTherapist = isSingleTherapistMode ? publicTherapist : therapist
  const sourceLoading = isSingleTherapistMode ? publicTherapistLoading : loading
  const sourceError = isSingleTherapistMode ? publicTherapistError : error

  // Si está cargando, mostrar skeleton
  if (sourceLoading) {
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
  if (sourceError || !sourceTherapist) {
    return null
  }

  // Crear el objeto doctor con los datos del terapeuta de la API
  const doctor = {
    name: `${sourceTherapist.firstName} ${sourceTherapist.lastName}`,
    specialty: sourceTherapist.specialties[0] || "Especialista",
    image: sourceTherapist.profileImage,
    bio: sourceTherapist.bio,
  }
  return (
    <Card className="surface-panel mb-6">
      <CardContent className="flex items-center gap-4 ">
        <Avatar className="h-16 w-16">
          <AvatarImage src={doctor.image || undefined} alt={doctor.name} />
          <AvatarIconFallback iconClassName="size-6" />
        </Avatar>

        <div className="flex-1">
          <div className="mb-1">
            <h3 className="text-lg font-semibold text-foreground">{doctor.name}</h3>
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
