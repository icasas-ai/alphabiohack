"use client";

import { BookingStepper } from "./booking-stepper";
import { CurrentSelectionSummary } from "./current-selection-summary";
import { DoctorInfo } from "./doctor-info";
import { StepFour } from "./steps/step-four";
import { StepOne } from "./steps/step-one";
import { StepThree } from "./steps/step-three";
import { StepTwo } from "./steps/step-two";
import { StepZero } from "./steps/step-zero";
import { StickyWizardShell } from "@/components/ui/sticky-wizard-shell";
import { SurfaceCard } from "@/components/ui/surface-card";
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
  const t = useTranslations('Booking');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { data, canProceedToStep } = useBookingWizard();
  const prefersReducedMotion = useReducedMotion();
  const consumedRedirectStep = useRef(false);
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
    <StickyWizardShell
      header={({ compact }) => (
        <BookingStepper steps={stepItems} compact={compact} />
      )}
      sidebar={
        showSideContext
          ? (
              <>
                <DoctorInfo />
                {summaryLevel ? <CurrentSelectionSummary level={summaryLevel} /> : null}
              </>
            )
          : undefined
      }
    >
      {showSideContext ? (
        <div className="xl:hidden">
          <DoctorInfo />
          {summaryLevel ? <CurrentSelectionSummary level={summaryLevel} compact /> : null}
        </div>
      ) : null}

      <SurfaceCard variant="panel" className="w-full">
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
      </SurfaceCard>
    </StickyWizardShell>
  );
}
