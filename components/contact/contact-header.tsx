/**
 * Componente Presentacional del Header de Contacto
 * 
 * Componente reutilizable para el encabezado de la página de contacto.
 */

"use client";

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface ContactHeaderProps {
  className?: string;
}

export function ContactHeader({ className }: ContactHeaderProps) {
  const t = useTranslations('Contact');

  return (
    <div className={cn("mx-auto max-w-3xl text-center", className)}>
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-primary/72">
        {t('subtitle')}
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-[3.4rem]">
        {t('title')}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
        {t('description')}
      </p>
    </div>
  );
}
