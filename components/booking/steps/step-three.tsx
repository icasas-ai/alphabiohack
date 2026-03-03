"use client";

import { BasicInformationForm } from "../basic-information-form";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { useAppToast } from "@/hooks/use-app-toast";
import { useBookingWizard } from "@/contexts";
import { useCreateBooking } from "@/hooks";
import { useTranslations } from "next-intl";

interface StepThreeProps {
  onNext: () => void;
  onBack: () => void;
  readonly isFirst: boolean;
}

export function StepThree({ onNext, onBack }: StepThreeProps) {
  const { data, update, canProceedToStep, getStepValidation } = useBookingWizard();
  const { createBooking, loading: creatingBooking, error: createError } = useCreateBooking();
  const t = useTranslations('Booking');
  const tReq = useTranslations('Requests');
  const tErrors = useTranslations('ApiErrors');
  const toast = useAppToast();
  
  const isDisabled = !canProceedToStep(3) || creatingBooking;
  const validation = getStepValidation(3);

  const handleCreateBooking = async () => {
    try {
      const res = await createBooking(data);
      if (!res.success) {
        const err = new Error('Request failed');
        throw Object.assign(err, { errorCode: res.error });
      }
      const successKey = (res as { successCode?: string })?.successCode;
      toast.success(successKey ? tReq(successKey) : tReq('bookings.create.success'));
      update({ createdBooking: res.data });
      onNext();
    } catch (err) {
      const code = (err as { errorCode?: string })?.errorCode;
      if (code) toast.error(tErrors(code));
      else toast.error(tReq('bookings.create.error'));
    }
  };

  return (
    <CardContent className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">{t('step4Title')}</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {t('step4Description')}
        </p>
        
        {createError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-800 dark:text-red-300">
              {t('error')}: {createError}
            </p>
          </div>
        )}
      </div>

      <BasicInformationForm />

      <div className="space-y-3 pt-4">
        {isDisabled && !creatingBooking && validation.errors.length > 0 ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm font-medium text-amber-900">{t('confirmDisabledHint')}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {validation.errors.map((error) => (
                <span
                  key={error}
                  className="inline-flex rounded-full border border-amber-200 bg-background px-2.5 py-1 text-xs text-amber-900"
                >
                  {error}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex justify-between items-center space-x-2">
        <Button onClick={onBack} variant="outline" className="cursor-pointer">
          {t('back')}
        </Button>
        <Button
          onClick={handleCreateBooking}
          disabled={isDisabled}
          className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
        >
          {creatingBooking ? t('loading') : t('confirmBooking')}
        </Button>
        </div>
      </div>
    </CardContent>
  );
}
