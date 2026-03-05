"use client";

import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { DateTimeSelector } from "../date-time-selector";
import { useBookingWizard } from "@/contexts";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface StepTwoProps {
  onNext: () => void;
  onBack: () => void;
  readonly isFirst: boolean;
}

export function StepTwo({ onNext, onBack }: StepTwoProps) {
  const { canProceedToStep } = useBookingWizard();
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const t = useTranslations('Booking');

  const handleNext = () => {
    setHasAttemptedSubmit(true);
    if (!canProceedToStep(2)) {
      return;
    }
    onNext();
  };

  return (
    <CardContent className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">{t('step3Title')}</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {t('step3Description')}
        </p>
      </div>

      <DateTimeSelector showValidation={hasAttemptedSubmit} />

      <div className="space-y-3 pt-4">
        <div className="flex justify-between items-center space-x-2">
        <Button onClick={onBack} variant="outline" className="cursor-pointer">
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
