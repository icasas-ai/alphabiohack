/**
 * Componente Presentacional de Ayuda Urgente
 * 
 * Componente reutilizable para la sección de ayuda urgente.
 */

"use client";

import { Mail, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface UrgentHelpProps {
  className?: string;
  phoneNumber?: string | null;
  emailAddress?: string | null;
}

export function UrgentHelp({
  className,
  phoneNumber,
  emailAddress,
}: UrgentHelpProps) {
  const t = useTranslations('Contact');

  const handleCallClick = () => {
    const resolvedPhoneNumber = (phoneNumber || t('phoneNumber')).replace(/[^\d+]/g, '');
    window.location.href = `tel:${resolvedPhoneNumber}`;
  };

  const handleEmailClick = () => {
    const resolvedEmailAddress = emailAddress || t('emailAddress');
    window.location.href = `mailto:${resolvedEmailAddress}`;
  };

  return (
    <div className={`${className || ''}`}>
      <div className="overflow-hidden rounded-[24px] border border-border/70 bg-accent/10 p-7 text-card-foreground">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-primary/72">
              {t('subtitle')}
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {t('urgentHelp.title')}
            </h3>
            <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
              {t('urgentHelp.description')}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              className="h-11 rounded-full px-5"
              onClick={handleCallClick}
            >
              <Phone className="h-4 w-4" />
              <span>{t('urgentHelp.callNow')}</span>
            </Button>
            <Button
              variant="outline"
              className="h-11 rounded-full border-primary/18 bg-background/70 px-5 text-foreground hover:bg-background"
              onClick={handleEmailClick}
            >
              <Mail className="h-4 w-4" />
              <span>{t('urgentHelp.sendEmail')}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
