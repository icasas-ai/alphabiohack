"use client";

import { AppointmentTypeSelector } from "../appointment-type-selector";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { ClinicSelector } from "../clinic-selector";
import { TherapistSelector } from "../therapist-selector";
import { useBookingWizard } from "@/contexts";
import { useTranslations } from "next-intl";

interface StepZeroProps {
  onNext: () => void;
  onBack: () => void;
  readonly isFirst: boolean;
}

export function StepZero({ onNext, onBack, isFirst }: StepZeroProps) {
  const { canProceedToStep, getStepValidation } = useBookingWizard();
  const isDisabled = !canProceedToStep(0);
  const validation = getStepValidation(0);
  const t = useTranslations('Booking');

  return (
    <CardContent className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">{t('step1Title')}</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {t('step1Description')}
        </p>
        
        {!validation.isValid && validation.errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">{t('completeFields')}</p>
            <ul className="mt-1 text-sm text-red-700 dark:text-red-300/90">
              {validation.errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <TherapistSelector />
        <AppointmentTypeSelector />
        <ClinicSelector />
      </div>

      <div className="flex justify-between items-center space-x-2 pt-4">
        <Button onClick={onBack} variant="outline" disabled={isFirst} className="cursor-pointer hover:bg-secondary">
          {t('back')}
        </Button>
        <Button
          onClick={onNext}
          disabled={isDisabled}
          className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
        >
          {t('continue')}
        </Button>
      </div>
    </CardContent>
  );
}
