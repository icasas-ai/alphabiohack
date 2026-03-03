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

export function StepFour({ onBack }: StepFourProps) {
  const { reset } = useBookingWizard();
  const router = useRouter();
  const t = useTranslations('Booking');

  const handleNext = () => {
    reset();
    router.push("/");
  }

  return (
    <CardContent className="space-y-6">
      <BookingConfirmation />

      <div className="flex justify-between items-center space-x-2 pt-4">
        <Button onClick={onBack} variant="outline" className="cursor-pointer">
          {t('back')}
        </Button>
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
