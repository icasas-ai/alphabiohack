"use client";

import { AppointmentTypeSelector } from "../appointment-type-selector";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { ClinicSelector } from "../clinic-selector";
import { TherapistSelector } from "../therapist-selector";
import { useBookingWizard } from "@/contexts";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface StepZeroProps {
  onNext: () => void;
  onBack: () => void;
  readonly isFirst: boolean;
}

export function StepZero({ onNext, onBack, isFirst }: StepZeroProps) {
  const { canProceedToStep } = useBookingWizard();
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const t = useTranslations('Booking');

  const handleNext = () => {
    setHasAttemptedSubmit(true);
    if (!canProceedToStep(0)) {
      return;
    }
    onNext();
  };

  return (
    <CardContent className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">{t('step1Title')}</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {t('step1Description')}
        </p>
      </div>

      <div className="space-y-6">
        <TherapistSelector showValidation={hasAttemptedSubmit} />
        <AppointmentTypeSelector />
        <ClinicSelector showValidation={hasAttemptedSubmit} />
      </div>

      <div className="space-y-3 pt-4">
        <div className="flex justify-between items-center space-x-2">
          <Button onClick={onBack} variant="outline" disabled={isFirst} className="cursor-pointer hover:bg-secondary">
            {t('back')}
          </Button>
          <Button
            onClick={handleNext}
            className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
          >
            {t('continue')}
          </Button>
        </div>
      </div>
    </CardContent>
  );
}
