"use client";

import { AppointmentTypeSelector } from "../appointment-type-selector";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { ClinicSelector } from "../clinic-selector";
import { TherapistSelector } from "../therapist-selector";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
      </div>

      <div className="space-y-6">
        <TherapistSelector />
        <AppointmentTypeSelector />
        <ClinicSelector />
      </div>

      <div className="space-y-3 pt-4">
        {isDisabled && validation.errors.length > 0 ? (
          <Alert variant="warning">
            <AlertDescription>
              <p className="text-sm font-medium">{t('continueSelectionHint')}</p>
              <div className="mt-2 flex flex-wrap gap-2">
              {validation.errors.map((error) => (
                <Badge
                  key={error}
                  variant="warning"
                  className="rounded-full bg-white/80"
                >
                  {error}
                </Badge>
              ))}
              </div>
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="flex justify-between items-center space-x-2">
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
      </div>
    </CardContent>
  );
}
