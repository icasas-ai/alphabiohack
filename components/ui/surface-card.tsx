import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const surfaceCardVariants = cva("", {
  variants: {
    variant: {
      default: "",
      panel: "surface-panel",
      glass:
        "border-white/35 bg-white/62 shadow-[0_22px_65px_-34px_rgba(15,23,42,0.38)] backdrop-blur-xl dark:border-white/10 dark:bg-white/8 dark:shadow-[0_24px_70px_-34px_rgba(2,6,23,0.7)]",
      elevated:
        "border-border/70 bg-card shadow-[0_24px_65px_-34px_rgba(15,23,42,0.34)] dark:shadow-[0_22px_60px_-30px_rgba(2,6,23,0.65)]",
      highlight: "surface-brand-tint",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

function SurfaceCard({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof Card> & VariantProps<typeof surfaceCardVariants>) {
  return (
    <Card
      className={cn(surfaceCardVariants({ variant }), className)}
      {...props}
    />
  )
}

function GlassCard({
  className,
  ...props
}: React.ComponentProps<typeof Card>) {
  return <SurfaceCard variant="glass" className={className} {...props} />
}

function PanelCard({
  className,
  ...props
}: React.ComponentProps<typeof Card>) {
  return <SurfaceCard variant="panel" className={className} {...props} />
}

export { GlassCard, PanelCard, SurfaceCard, surfaceCardVariants }
