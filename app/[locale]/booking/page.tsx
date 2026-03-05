import { BookingWizard } from "@/components/booking/booking-wizard"
import { BookingWizardProvider } from "@/contexts/booking-wizard-context"
import { MedicalFooter } from "@/components/layout/footer"
import { MedicalHeader } from "@/components/layout/header"

export default function BookingPage() {
  return (
    <BookingWizardProvider>
      <div className="app-page-gradient flex min-h-screen flex-col bg-background text-foreground">
        <MedicalHeader />
        <main className="flex-1 py-8">
          <div className="mx-auto h-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <BookingWizard />
          </div>
        </main>
        <MedicalFooter />
      </div>
    </BookingWizardProvider>
  )
}
