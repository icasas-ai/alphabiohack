import { PublicSiteUnavailableSplash } from "@/components/common/public-site-unavailable-splash"
import { BookingWizard } from "@/components/booking/booking-wizard"
import { BookingWizardProvider } from "@/contexts/booking-wizard-context"
import { MedicalFooter } from "@/components/layout/footer"
import { MedicalHeader } from "@/components/layout/header"
import { isPublicSiteUnavailableError } from "@/services/company.service"
import { getPublicCompanyProfile } from "@/services/public-profile.service"

export default async function BookingPage() {
  try {
    await getPublicCompanyProfile()
  } catch (error) {
    if (isPublicSiteUnavailableError(error)) {
      return (
        <div className="app-page-gradient app-page-gradient-sticky-safe flex min-h-screen flex-col bg-background text-foreground">
          <MedicalHeader sticky={false} />
          <main className="flex-1">
            <PublicSiteUnavailableSplash />
          </main>
          <MedicalFooter />
        </div>
      )
    }

    throw error
  }

  return (
    <BookingWizardProvider>
      <div className="app-page-gradient app-page-gradient-sticky-safe flex min-h-screen flex-col bg-background text-foreground">
        <MedicalHeader sticky={false} />
        <main className="flex-1 pt-4 sm:pt-5">
          <BookingWizard />
        </main>
        <MedicalFooter />
      </div>
    </BookingWizardProvider>
  )
}
