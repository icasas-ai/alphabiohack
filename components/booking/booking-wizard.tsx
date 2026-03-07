"use client";

import { BookingStepper } from "./booking-stepper";
import { Card } from "@/components/ui/card";
import { CurrentSelectionSummary } from "./current-selection-summary";
import { DoctorInfo } from "./doctor-info";
import { StepFour } from "./steps/step-four";
import { StepOne } from "./steps/step-one";
import { StepThree } from "./steps/step-three";
import { StepTwo } from "./steps/step-two";
import { StepZero } from "./steps/step-zero";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useBookingWizard } from "@/contexts";
import { usePathname, useRouter } from "@/i18n/navigation";
import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";

const steps = [StepZero, StepOne, StepTwo, StepThree, StepFour];

export function BookingWizard() {
  const [step, setStep] = useState(0);
  const [stepDirection, setStepDirection] = useState<1 | -1>(1);
  const [isStepperCompact, setIsStepperCompact] = useState(false);
  const [stickyStackHeight, setStickyStackHeight] = useState(0);
  const t = useTranslations('Booking');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { data, canProceedToStep } = useBookingWizard();
  const prefersReducedMotion = useReducedMotion();
  const consumedRedirectStep = useRef(false);
  const stickySentinelRef = useRef<HTMLDivElement | null>(null);
  const wizardTopRef = useRef<HTMLDivElement | null>(null);
  const maxStepIndex = steps.length - 1;

  const scrollToPageTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [prefersReducedMotion]);

  const goToStep = (nextStep: number, { scrollFirst = false } = {}) => {
    const boundedNextStep = Math.max(0, Math.min(maxStepIndex, nextStep));

    setStepDirection(boundedNextStep >= step ? 1 : -1);
    setStep(boundedNextStep);

    if (scrollFirst) {
      requestAnimationFrame(() => {
        scrollToPageTop();
      });
    }
  };

  useEffect(() => {
    if (consumedRedirectStep.current) {
      return;
    }

    const requestedStep = searchParams.get("step");
    const hasPreselectedLocation = Boolean(searchParams.get("locationId"));
    const canAutoAdvanceFromQuery =
      requestedStep === null || requestedStep === "1";

    if (
      step !== 0 ||
      !hasPreselectedLocation ||
      !canAutoAdvanceFromQuery
    ) {
      return;
    }

    if (canProceedToStep(0)) {
      consumedRedirectStep.current = true;
      setStepDirection(1);
      setStep(1);
      router.replace({
        pathname,
        query: {
          locationId: searchParams.get("locationId") || "",
        },
      });
    }
  }, [canProceedToStep, data.locationId, data.therapistId, pathname, router, searchParams, step]);

  useEffect(() => {
    const stickySentinel = stickySentinelRef.current
    const stickyWrapper = wizardTopRef.current
    if (!stickySentinel || !stickyWrapper) {
      return
    }

    const syncCompactState = () => {
      const stickyTop = Number.parseFloat(window.getComputedStyle(stickyWrapper).top) || 0
      const nextCompact = stickySentinel.getBoundingClientRect().top <= stickyTop
      setIsStepperCompact((current) => (current === nextCompact ? current : nextCompact))
    }

    syncCompactState()
    window.addEventListener("scroll", syncCompactState, { passive: true })
    window.addEventListener("resize", syncCompactState)

    return () => {
      window.removeEventListener("scroll", syncCompactState)
      window.removeEventListener("resize", syncCompactState)
    }
  }, [])

  useEffect(() => {
    const stickyWrapper = wizardTopRef.current
    if (!stickyWrapper) {
      return
    }

    const syncStickyHeight = () => {
      const nextHeight = stickyWrapper.getBoundingClientRect().height
      setStickyStackHeight((current) => (Math.abs(current - nextHeight) < 1 ? current : nextHeight))
    }

    syncStickyHeight()

    const resizeObserver = new ResizeObserver(() => {
      syncStickyHeight()
    })

    resizeObserver.observe(stickyWrapper)
    window.addEventListener("resize", syncStickyHeight)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", syncStickyHeight)
    }
  }, [])

  const StepComponent = steps[step];
  const summaryLevel = step === 1 ? 1 : step === 2 ? 2 : null;
  const showSideContext = step <= 2;
  const stepItems = steps.map((_, index) => {
    const status: "complete" | "current" | "upcoming" =
      index < step ? "complete" : index === step ? "current" : "upcoming";

    return {
      id: index,
      name: [
        t('appointmentType'),
        t('service'),
        t('dateTime'),
        t('basicInformation'),
        t('confirmationStep')
      ][index],
      status
    };
  });

  return (
    <div className="w-full">
      <div ref={stickySentinelRef} aria-hidden="true" />
      <div
        ref={wizardTopRef}
        className="sticky top-[var(--visible-header-offset,0px)] z-40"
        style={{ scrollMarginTop: "var(--visible-header-offset, 0px)" }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <BookingStepper steps={stepItems} compact={isStepperCompact} />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div
          className={cn(
            "gap-6",
            showSideContext ? "grid xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start" : "block",
          )}
        >
          <div className="min-w-0 space-y-6">
            {showSideContext ? (
              <div className="xl:hidden">
                <DoctorInfo />
                {summaryLevel ? <CurrentSelectionSummary level={summaryLevel} compact /> : null}
              </div>
            ) : null}

            <Card className="surface-panel w-full">
              <LazyMotion features={domAnimation}>
                <AnimatePresence initial={false} mode="wait">
                  <m.div
                    key={step}
                    initial={
                      prefersReducedMotion
                        ? { opacity: 0 }
                        : { opacity: 0, x: stepDirection * 36, filter: "blur(4px)" }
                    }
                    animate={
                      prefersReducedMotion
                        ? { opacity: 1 }
                        : {
                            opacity: 1,
                            x: 0,
                            filter: "blur(0px)",
                            transition: {
                              duration: 0.32,
                              ease: [0.22, 1, 0.36, 1],
                            },
                          }
                    }
                    exit={
                      prefersReducedMotion
                        ? { opacity: 0 }
                        : {
                            opacity: 0,
                            x: stepDirection * -24,
                            filter: "blur(3px)",
                            transition: {
                              duration: 0.22,
                              ease: [0.4, 0, 1, 1],
                            },
                          }
                    }
                  >
                    <StepComponent
                      onNext={() => void goToStep(step + 1, { scrollFirst: true })}
                      onBack={() => void goToStep(step - 1)}
                      isFirst={step === 0}
                    />
                  </m.div>
                </AnimatePresence>
              </LazyMotion>
            </Card>
          </div>

          {showSideContext ? (
            <aside
              className="hidden xl:block xl:sticky space-y-4 transition-[top] duration-200 ease-out"
              style={{ top: `calc(var(--visible-header-offset, 0px) + ${stickyStackHeight + 24}px)` }}
            >
              <DoctorInfo />
              {summaryLevel ? <CurrentSelectionSummary level={summaryLevel} /> : null}
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}
