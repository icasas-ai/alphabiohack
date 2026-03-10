"use client";

import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

interface LocalePageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

const protectedSegments = new Set([
  "account",
  "appointments",
  "availability",
  "bookings",
  "company",
  "dashboard",
  "locations",
  "personnel",
  "profile",
  "specialties",
]);

function getRouteSegment(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  return segments[1] ?? null;
}

export function LocalePageTransition({
  children,
  className,
}: LocalePageTransitionProps) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const routeSegment = getRouteSegment(pathname);
  const shouldAnimate = !routeSegment || !protectedSegments.has(routeSegment);

  if (!shouldAnimate) {
    return <>{children}</>;
  }

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence mode="sync" initial={false}>
        <m.div
          key={pathname}
          className={cn("w-full will-change-transform will-change-opacity", className)}
          style={{ transformOrigin: "50% 0%" }}
          initial={
            prefersReducedMotion
              ? { opacity: 0 }
              : { opacity: 0, y: 10, filter: "blur(6px)" }
          }
          animate={
            prefersReducedMotion
              ? { opacity: 1 }
              : {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  transition: {
                    duration: 0.42,
                    ease: [0.22, 1, 0.36, 1],
                  },
                }
          }
          exit={
            prefersReducedMotion
              ? { opacity: 0 }
              : {
                  opacity: 0,
                  y: -6,
                  filter: "blur(4px)",
                  transition: {
                    duration: 0.22,
                    ease: [0.4, 0, 0.2, 1],
                  },
                }
          }
        >
          {children}
        </m.div>
      </AnimatePresence>
    </LazyMotion>
  );
}
