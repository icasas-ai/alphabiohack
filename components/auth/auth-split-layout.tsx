"use client";

import type { ReactNode } from "react";

import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

type AuthSplitLayoutProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration"
> & {
  hero: ReactNode;
  form: ReactNode;
};

export function AuthSplitLayout({
  hero,
  form,
  className,
  ...props
}: AuthSplitLayoutProps) {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1] as const,
        staggerChildren: prefersReducedMotion ? 0 : 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial="hidden"
        animate="show"
        variants={containerVariants}
        className={cn("grid gap-6 lg:grid-cols-[1.08fr_minmax(0,0.92fr)]", className)}
        {...props}
      >
        <m.div variants={itemVariants}>{hero}</m.div>
        <m.div variants={itemVariants} className="flex items-center justify-center">
          {form}
        </m.div>
      </m.div>
    </LazyMotion>
  );
}
