"use client";

import { BookingConfirmation } from "../booking-confirmation";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { useBookingWizard } from "@/contexts";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface StepFourProps {
  onNext: () => void;
  onBack: () => void;
  readonly isFirst: boolean;
}

export function StepFour({}: StepFourProps) {
  const { reset } = useBookingWizard();
  const router = useRouter();
  const t = useTranslations('Booking');

  const handleNext = () => {
    reset();
    router.push("/");
  }

  return (
    <CardContent className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">{t('step5Title')}</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {t('step5Description')}
        </p>
      </div>

      <BookingConfirmation />

      <div className="flex justify-end items-center pt-4">
        <Button
          onClick={handleNext}
          className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
        >
          {t('confirm')}
        </Button>
      </div>
    </CardContent>
  );
}
