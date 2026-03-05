"use client";

import { BasicInformationForm } from "../basic-information-form";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { useAppToast } from "@/hooks/use-app-toast";
import { useBookingWizard } from "@/contexts";
import { useCreateBooking } from "@/hooks";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface StepThreeProps {
  onNext: () => void;
  onBack: () => void;
  readonly isFirst: boolean;
}

export function StepThree({ onNext, onBack }: StepThreeProps) {
  const { data, update, canProceedToStep } = useBookingWizard();
  const { createBooking, loading: creatingBooking, error: createError } = useCreateBooking();
  const t = useTranslations('Booking');
  const tReq = useTranslations('Requests');
  const tErrors = useTranslations('ApiErrors');
  const toast = useAppToast();
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  
  const handleCreateBooking = async () => {
    setHasAttemptedSubmit(true);

    if (!canProceedToStep(3)) {
      return;
    }

    try {
      const res = await createBooking(data);
      if (!res.success) {
        const err = new Error('Request failed');
        throw Object.assign(err, { errorCode: res.error });
      }
      const successKey = (res as { successCode?: string })?.successCode;
      toast.success(successKey ? tReq(successKey) : tReq('bookings.create.success'));
      update({ createdBooking: res.data });
      setHasAttemptedSubmit(false);
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

      <BasicInformationForm showValidation={hasAttemptedSubmit} />

      <div className="space-y-3 pt-4">
        <div className="flex justify-between items-center space-x-2">
        <Button onClick={onBack} variant="outline" className="cursor-pointer">
          {t('back')}
        </Button>
        <Button
          onClick={handleCreateBooking}
          disabled={creatingBooking}
          className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
        >
          {creatingBooking ? t('loading') : t('confirmBooking')}
        </Button>
        </div>
      </div>
    </CardContent>
  );
}
