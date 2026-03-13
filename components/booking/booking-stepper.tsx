import { Stepper } from "@/components/ui/stepper"

interface Step {
  id: number
  name: string
  status: "complete" | "current" | "upcoming"
  disabled?: boolean
}

interface BookingStepperProps {
  steps: Step[]
  compact?: boolean
  onStepSelect?: (stepIndex: number) => void
}

export function BookingStepper({
  steps,
  compact = false,
  onStepSelect,
}: BookingStepperProps) {
  return (
    <Stepper
      items={steps.map((step) => ({
        id: step.id,
        label: step.name,
        status: step.status,
        disabled: step.disabled,
      }))}
      compact={compact}
      ariaLabel="Progress"
      onItemSelect={
        onStepSelect ? (_, stepIndex) => onStepSelect(stepIndex) : undefined
      }
    />
  )
}
