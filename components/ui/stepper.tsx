import * as React from "react"
import { Check } from "lucide-react"

import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export type StepperItemStatus = "complete" | "current" | "upcoming"

export interface StepperItem {
  id: string | number
  label: string
  status: StepperItemStatus
  disabled?: boolean
}

interface StepperProps extends React.ComponentProps<"nav"> {
  items: StepperItem[]
  compact?: boolean
  ariaLabel?: string
  actions?: React.ReactNode
  onItemSelect?: (item: StepperItem, index: number) => void
}

export function Stepper({
  items,
  compact = false,
  ariaLabel = "Progress",
  actions,
  onItemSelect,
  className,
  ...props
}: StepperProps) {
  const currentStepIndex = React.useMemo(
    () => items.findIndex((item) => item.status === "current"),
    [items],
  )

  const isSuccessState = items.length > 0 && currentStepIndex === items.length - 1

  const progressValue = React.useMemo(() => {
    if (items.length === 0) {
      return 0
    }

    const completedSteps = items.filter((item) => item.status === "complete").length

    return isSuccessState
      ? 100
      : ((completedSteps + (currentStepIndex >= 0 ? 0.5 : 0)) / items.length) * 100
  }, [currentStepIndex, isSuccessState, items])

  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        "rounded-[1.75rem] border border-border/70 bg-background/95 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.35)] ring-1 ring-black/5 backdrop-blur transition-[padding,border-radius,box-shadow,background-color] duration-200 ease-out",
        compact ? "py-2.5" : "py-3.5",
        className,
      )}
      {...props}
    >
      {actions ? (
        <div
          className={cn(
            "flex items-center justify-end",
            compact ? "mb-2" : "mb-2.5",
          )}
        >
          {actions}
        </div>
      ) : null}

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
        {items.map((item, itemIdx) => (
          <li key={item.id} className="flex items-center">
            {onItemSelect && !item.disabled ? (
              <button
                type="button"
                onClick={() => onItemSelect(item, itemIdx)}
                aria-current={item.status === "current" ? "step" : undefined}
                className={cn(
                  "group flex flex-col items-center rounded-2xl px-1 text-center transition-[transform,opacity] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                  compact ? "py-0.5" : "py-1",
                  item.status !== "current" && "cursor-pointer hover:-translate-y-0.5",
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 text-center text-sm font-medium transition-colors",
                    item.status === "complete"
                      ? isSuccessState
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-primary bg-primary text-primary-foreground"
                      : item.status === "current"
                        ? isSuccessState
                          ? "border-emerald-500 bg-emerald-500 text-white shadow-[0_10px_25px_-14px_rgba(34,197,94,0.85)]"
                          : "border-primary bg-background text-primary"
                        : "border-muted-foreground/30 bg-background text-muted-foreground group-hover:border-primary/35 group-hover:text-foreground",
                  )}
                >
                  {item.status === "complete" || (isSuccessState && item.status === "current") ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    itemIdx + 1
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 max-w-[4.75rem] whitespace-pre-line text-center leading-tight transition-[font-size,line-height,color,transform,opacity] duration-200 ease-out sm:max-w-[5.5rem]",
                    item.status === "current"
                      ? compact
                        ? isSuccessState
                          ? "text-[12px] font-semibold text-emerald-600 sm:text-[13px] dark:text-emerald-400"
                          : "text-[12px] font-semibold text-primary sm:text-[13px]"
                        : isSuccessState
                          ? "text-[13px] font-semibold text-emerald-600 sm:text-[15px] dark:text-emerald-400"
                          : "text-[13px] font-semibold text-primary sm:text-[15px]"
                      : item.status === "complete"
                        ? compact
                          ? isSuccessState
                            ? "text-[9px] font-medium text-emerald-700 sm:text-[10px] dark:text-emerald-300"
                            : "text-[9px] font-medium text-foreground sm:text-[10px]"
                          : isSuccessState
                            ? "text-[10px] font-medium text-emerald-700 sm:text-[12px] dark:text-emerald-300"
                            : "text-[10px] font-medium text-foreground sm:text-[12px]"
                        : compact
                          ? "text-[9px] font-medium text-muted-foreground group-hover:text-foreground sm:text-[10px]"
                          : "text-[10px] font-medium text-muted-foreground group-hover:text-foreground sm:text-[12px]",
                  )}
                >
                  {item.label}
                </span>
              </button>
            ) : (
              <div
                aria-current={item.status === "current" ? "step" : undefined}
                className="flex flex-col items-center"
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 text-center text-sm font-medium transition-colors",
                    item.status === "complete"
                      ? isSuccessState
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-primary bg-primary text-primary-foreground"
                      : item.status === "current"
                        ? isSuccessState
                          ? "border-emerald-500 bg-emerald-500 text-white shadow-[0_10px_25px_-14px_rgba(34,197,94,0.85)]"
                          : "border-primary bg-background text-primary"
                        : "border-muted-foreground/30 bg-background text-muted-foreground",
                  )}
                >
                  {item.status === "complete" || (isSuccessState && item.status === "current") ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    itemIdx + 1
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 max-w-[4.75rem] whitespace-pre-line text-center leading-tight transition-[font-size,line-height,color,transform,opacity] duration-200 ease-out sm:max-w-[5.5rem]",
                    item.status === "current"
                      ? compact
                        ? isSuccessState
                          ? "text-[12px] font-semibold text-emerald-600 sm:text-[13px] dark:text-emerald-400"
                          : "text-[12px] font-semibold text-primary sm:text-[13px]"
                        : isSuccessState
                          ? "text-[13px] font-semibold text-emerald-600 sm:text-[15px] dark:text-emerald-400"
                          : "text-[13px] font-semibold text-primary sm:text-[15px]"
                      : item.status === "complete"
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
                  {item.label}
                </span>
              </div>
            )}
            {itemIdx < items.length - 1 ? (
              <div className="ml-4 hidden h-0.5 w-16 bg-border md:block" />
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  )
}
