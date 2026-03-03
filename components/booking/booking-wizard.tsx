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
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useBookingWizard } from "@/contexts";
import { usePathname, useRouter } from "@/i18n/navigation";

const steps = [StepZero, StepOne, StepTwo, StepThree, StepFour];

export function BookingWizard() {
  const [step, setStep] = useState(0);
  const t = useTranslations('Booking');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { data, canProceedToStep } = useBookingWizard();
  const consumedRedirectStep = useRef(false);
  const wizardTopRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (consumedRedirectStep.current) {
      return;
    }

    const requestedStep = searchParams.get("step");
    const hasPreselectedLocation = Boolean(searchParams.get("locationId"));

    if (step !== 0 || !hasPreselectedLocation || requestedStep !== "1") {
      return;
    }

    if (canProceedToStep(0)) {
      consumedRedirectStep.current = true;
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
    wizardTopRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [step]);

  const StepComponent = steps[step];
  const summaryLevel = step === 1 ? 1 : step === 2 ? 2 : null;
  const showSideContext = step <= 2;

  return (
    <div ref={wizardTopRef} className="w-full p-2 mx-auto">
      <BookingStepper 
        steps={steps.map((_, index) => ({
          id: index,
          name: [
            t('appointmentType'),
            t('specialty'), 
            t('dateTime'),
            t('basicInformation'),
            t('confirmationStep')
          ][index],
          status: index < step ? "complete" : index === step ? "current" : "upcoming"
        }))} 
      />
      
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

          <Card className="w-full bg-muted">
            <StepComponent
              onNext={() => setStep((s) => s + 1)}
              onBack={() => setStep((s) => s - 1)}
              isFirst={step === 0}
            />
          </Card>
        </div>

        {showSideContext ? (
          <aside className="hidden xl:block xl:sticky xl:top-24 space-y-4">
            <DoctorInfo />
            {summaryLevel ? <CurrentSelectionSummary level={summaryLevel} /> : null}
          </aside>
        ) : null}
      </div>
    </div>
  );
}
