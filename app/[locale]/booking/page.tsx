import { PublicSiteUnavailableSplash } from "@/components/common/public-site-unavailable-splash"
import { BookingWizard } from "@/components/booking/booking-wizard"
import { BookingWizardProvider } from "@/contexts/booking-wizard-context"
import { ThemeStyleBridge } from "@/components/company/theme-style-bridge"
import { MedicalFooter } from "@/components/layout/footer"
import { MedicalHeader } from "@/components/layout/header"
import { getCompanyThemeStyle } from "@/lib/company/company-theme"
import { isPublicSiteUnavailableError } from "@/services/company.service"
import { getPublicCompanyProfile } from "@/services/public-profile.service"

export default async function BookingPage() {
  try {
    const publicCompany = await getPublicCompanyProfile()
    const publicThemeStyle = getCompanyThemeStyle(
      publicCompany?.landingPageConfig,
      "public",
    )

    return (
      <BookingWizardProvider>
        <div
          className="app-page-gradient app-page-gradient-sticky-safe flex min-h-screen flex-col bg-background text-foreground"
          style={publicThemeStyle}
        >
          <ThemeStyleBridge style={publicThemeStyle} />
          <MedicalHeader sticky={false} />
          <main className="flex-1 pt-4 sm:pt-5">
            <BookingWizard />
          </main>
          <MedicalFooter />
        </div>
      </BookingWizardProvider>
    )
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
}
