"use client";

import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence mode="popLayout" initial={false}>
        <m.div
          layout
          key={pathname}
          className={cn("w-full will-change-transform will-change-opacity", className)}
          style={{ transformOrigin: "50% 0%" }}
          initial={
            prefersReducedMotion
              ? { opacity: 0 }
              : { opacity: 0.08, y: 8, scale: 0.996 }
          }
          animate={
            prefersReducedMotion
              ? { opacity: 1 }
              : {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    duration: 0.36,
                    ease: [0.22, 1, 0.36, 1],
                  },
                }
          }
          exit={
            prefersReducedMotion
              ? { opacity: 0 }
              : {
                  opacity: 0,
                  y: -4,
                  scale: 1.004,
                  transition: {
                    duration: 0.2,
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
