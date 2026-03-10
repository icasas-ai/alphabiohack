import { Stepper } from "@/components/ui/stepper"

interface Step {
  id: number
  name: string
  status: "complete" | "current" | "upcoming"
}

interface BookingStepperProps {
  steps: Step[]
  compact?: boolean
}

export function BookingStepper({ steps, compact = false }: BookingStepperProps) {
  return (
    <Stepper
      items={steps.map((step) => ({
        id: step.id,
        label: step.name,
        status: step.status,
      }))}
      compact={compact}
      ariaLabel="Progress"
    />
  )
}
