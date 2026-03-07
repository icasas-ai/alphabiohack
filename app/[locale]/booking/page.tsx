import { BookingWizard } from "@/components/booking/booking-wizard"
import { BookingWizardProvider } from "@/contexts/booking-wizard-context"
import { MedicalFooter } from "@/components/layout/footer"
import { MedicalHeader } from "@/components/layout/header"

export default function BookingPage() {
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
