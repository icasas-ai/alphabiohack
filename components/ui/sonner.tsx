"use client"

import type { CSSProperties } from "react"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ style, ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={{
        "--normal-bg": "hsl(0 0% 100% / 0.96)",
        "--normal-text": "hsl(222 47% 11%)",
        "--normal-border": "hsl(214 32% 91%)",
        "--success-bg": "hsl(142 69% 96%)",
        "--success-text": "hsl(142 72% 24%)",
        "--success-border": "hsl(142 53% 84%)",
        "--info-bg": "hsl(204 100% 96%)",
        "--info-text": "hsl(215 70% 33%)",
        "--info-border": "hsl(204 84% 86%)",
        "--warning-bg": "hsl(48 100% 95%)",
        "--warning-text": "hsl(28 82% 30%)",
        "--warning-border": "hsl(42 94% 82%)",
        "--error-bg": "hsl(0 100% 97%)",
        "--error-text": "hsl(0 72% 38%)",
        "--error-border": "hsl(0 86% 89%)",
        ...style,
      } as CSSProperties}
      {...props}
    />
  )
}

export { Toaster }
