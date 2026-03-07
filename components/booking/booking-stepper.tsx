import { Check } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useMemo } from "react"

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
  const currentStepIndex = useMemo(
    () => steps.findIndex((step) => step.status === "current"),
    [steps],
  )
  const isSuccessState = currentStepIndex === steps.length - 1
  const progressValue = useMemo(() => {
    const completedSteps = steps.filter((step) => step.status === "complete").length
    
    // Mostrar progreso completo si el paso actual es el 5
    return currentStepIndex === steps.length - 1
      ? 100
      : ((completedSteps + (currentStepIndex >= 0 ? 0.5 : 0)) / steps.length) * 100
  }, [currentStepIndex, steps])

  return (
    <nav
      aria-label="Progress"
      className={cn(
        "rounded-[1.75rem] border border-border/70 bg-background/95 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.35)] ring-1 ring-black/5 backdrop-blur transition-[padding,border-radius,box-shadow,background-color] duration-200 ease-out",
        compact ? "py-2.5" : "py-3.5",
      )}
    >
      <div className={cn("transition-[margin] duration-200 ease-out", compact ? "mb-2.5" : "mb-3.5")}>
        <Progress
          value={progressValue}
          className={cn(
            "h-2",
            isSuccessState &&
              "bg-emerald-500/15 [&_[data-slot=progress-indicator]]:bg-emerald-500",
          )}
        />
      </div>

      <ol className="flex items-start justify-center space-x-4 md:space-x-8">
        {steps.map((step, stepIdx) => (
          <li key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors text-center",
                  step.status === "complete"
                    ? isSuccessState
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "bg-primary border-primary text-primary-foreground"
                    : step.status === "current"
                      ? isSuccessState
                        ? "bg-emerald-500 border-emerald-500 text-white shadow-[0_10px_25px_-14px_rgba(34,197,94,0.85)]"
                        : "border-primary text-primary bg-background"
                      : "border-muted-foreground/30 text-muted-foreground bg-background",
                )}
              >
                {step.status === "complete" || (step.id === 4 && step.status === "current") ? <Check className="h-5 w-5" /> : step.id + 1}
              </div>
              <span
                className={cn(
                  "mt-2 max-w-[4.75rem] text-center leading-tight transition-[font-size,line-height,color,transform,opacity] duration-200 ease-out sm:max-w-[5.5rem]",
                  step.status === "current"
                    ? compact
                      ? isSuccessState
                        ? "text-[12px] font-semibold text-emerald-600 sm:text-[13px] dark:text-emerald-400"
                        : "text-[12px] font-semibold text-primary sm:text-[13px]"
                      : isSuccessState
                        ? "text-[13px] font-semibold text-emerald-600 sm:text-[15px] dark:text-emerald-400"
                        : "text-[13px] font-semibold text-primary sm:text-[15px]"
                    : step.status === "complete"
                      ? compact
                        ? isSuccessState
                          ? "text-[9px] font-medium text-emerald-700 sm:text-[10px] dark:text-emerald-300"
                          : "text-[9px] font-medium text-foreground sm:text-[10px]"
                        : isSuccessState
                          ? "text-[10px] font-medium text-emerald-700 sm:text-[12px] dark:text-emerald-300"
                          : "text-[10px] font-medium text-foreground sm:text-[12px]"
                      : compact
                        ? "text-[9px] font-medium text-muted-foreground sm:text-[10px]"
                        : "text-[10px] font-medium text-muted-foreground sm:text-[12px]",
                )}
              >
                {step.name}
              </span>
            </div>
            {stepIdx < steps.length - 1 && <div className="hidden md:block w-16 h-0.5 bg-border ml-4" />}
          </li>
        ))}
      </ol>
    </nav>
  )
}
