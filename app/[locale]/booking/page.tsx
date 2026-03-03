import { BookingWizard } from "@/components/booking/booking-wizard"
import { BookingWizardProvider } from "@/contexts/booking-wizard-context"
import { MedicalFooter } from "@/components/layout/footer"
import { MedicalHeader } from "@/components/layout/header"

export default function BookingPage() {
  return (
    <BookingWizardProvider>
      <div className="min-h-screen">
        <MedicalHeader />
        <main className="py-8 min-h-[calc(100vh-100px)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
            <BookingWizard />
          </div>
        </main>
        <MedicalFooter />
      </div>
    </BookingWizardProvider>
  )
}
