"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type StickyWizardShellState = {
  compact: boolean
  stickyHeaderHeight: number
}

type StickyWizardShellSlot =
  | React.ReactNode
  | ((state: StickyWizardShellState) => React.ReactNode)

interface StickyWizardShellProps extends React.ComponentProps<"div"> {
  header: StickyWizardShellSlot
  children: React.ReactNode
  sidebar?: StickyWizardShellSlot
  headerStickyClassName?: string
  headerContainerClassName?: string
  contentContainerClassName?: string
  contentGridClassName?: string
  sidebarClassName?: string
  sidebarOffset?: number
}

function resolveSlot(
  slot: StickyWizardShellSlot | undefined,
  state: StickyWizardShellState,
) {
  if (typeof slot === "function") {
    return slot(state)
  }

  return slot ?? null
}

export function StickyWizardShell({
  header,
  children,
  sidebar,
  className,
  headerStickyClassName,
  headerContainerClassName,
  contentContainerClassName,
  contentGridClassName,
  sidebarClassName,
  sidebarOffset = 24,
  ...props
}: StickyWizardShellProps) {
  const [compact, setCompact] = React.useState(false)
  const [stickyHeaderHeight, setStickyHeaderHeight] = React.useState(0)
  const stickySentinelRef = React.useRef<HTMLDivElement | null>(null)
  const stickyHeaderRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    const stickySentinel = stickySentinelRef.current
    const stickyHeader = stickyHeaderRef.current
    if (!stickySentinel || !stickyHeader) {
      return
    }

    const syncCompactState = () => {
      const stickyTop = Number.parseFloat(window.getComputedStyle(stickyHeader).top) || 0
      const nextCompact = stickySentinel.getBoundingClientRect().top <= stickyTop
      setCompact((current) => (current === nextCompact ? current : nextCompact))
    }

    syncCompactState()
    window.addEventListener("scroll", syncCompactState, { passive: true })
    window.addEventListener("resize", syncCompactState)

    return () => {
      window.removeEventListener("scroll", syncCompactState)
      window.removeEventListener("resize", syncCompactState)
    }
  }, [])

  React.useEffect(() => {
    const stickyHeader = stickyHeaderRef.current
    if (!stickyHeader) {
      return
    }

    const syncStickyHeight = () => {
      const nextHeight = stickyHeader.getBoundingClientRect().height
      setStickyHeaderHeight((current) => (Math.abs(current - nextHeight) < 1 ? current : nextHeight))
    }

    syncStickyHeight()

    const resizeObserver = new ResizeObserver(() => {
      syncStickyHeight()
    })

    resizeObserver.observe(stickyHeader)
    window.addEventListener("resize", syncStickyHeight)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", syncStickyHeight)
    }
  }, [])

  const state = React.useMemo(
    () => ({
      compact,
      stickyHeaderHeight,
    }),
    [compact, stickyHeaderHeight],
  )

  return (
    <div className={cn("w-full", className)} {...props}>
      <div ref={stickySentinelRef} aria-hidden="true" />

      <div
        ref={stickyHeaderRef}
        className={cn(
          "sticky top-[var(--visible-header-offset,0px)] z-40",
          headerStickyClassName,
        )}
        style={{ scrollMarginTop: "var(--visible-header-offset, 0px)" }}
      >
        <div className={cn("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", headerContainerClassName)}>
          {resolveSlot(header, state)}
        </div>
      </div>

      <div className={cn("mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8", contentContainerClassName)}>
        <div
          className={cn(
            "gap-6",
            sidebar ? "grid xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start" : "block",
            contentGridClassName,
          )}
        >
          <div className="min-w-0 space-y-6">{children}</div>

          {sidebar ? (
            <aside
              className={cn(
                "hidden space-y-4 transition-[top] duration-200 ease-out xl:sticky xl:block",
                sidebarClassName,
              )}
              style={{ top: `calc(var(--visible-header-offset, 0px) + ${stickyHeaderHeight + sidebarOffset}px)` }}
            >
              {resolveSlot(sidebar, state)}
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  )
}
