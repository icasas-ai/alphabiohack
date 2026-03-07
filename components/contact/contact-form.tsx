/**
 * Componente Presentacional del Formulario de Contacto
 *
 * Este componente solo se encarga de la presentación y usa el hook useContactForm
 * para manejar toda la lógica de negocio.
 */

"use client";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/form/form-field";
import { Loader2 } from "lucide-react";
import { useContactForm } from "@/hooks/use-contact-form";
import { useTranslations } from "next-intl";

interface ContactFormProps {
  readonly className?: string;
}

export function ContactForm({ className }: ContactFormProps) {
  const t = useTranslations("Contact");
  const { formData, isLoading, fieldErrors, handleInputChange, handleSubmit } =
    useContactForm();

  return (
    <form onSubmit={handleSubmit} className={`space-y-5 ${className || ""}`}>
      <FormField
        id="name"
        name="name"
        label={t("form.name")}
        placeholder={t("form.namePlaceholder")}
        value={formData.name}
        onChange={handleInputChange}
        error={fieldErrors.name}
        autoComplete="name"
        autoCapitalize="words"
        maxLength={120}
        required
      />

      {/* Email */}
      <FormField
        id="email"
        name="email"
        label={t("form.email")}
        inputType="email"
        placeholder={t("form.emailPlaceholder")}
        value={formData.email}
        onChange={handleInputChange}
        error={fieldErrors.email}
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        inputMode="email"
        required
      />

      {/* Teléfono */}
      <FormField
        id="phone"
        name="phone"
        label={t("form.phone")}
        inputType="tel"
        placeholder={t("form.phonePlaceholder")}
        value={formData.phone}
        onChange={handleInputChange}
        error={fieldErrors.phone}
        autoComplete="tel"
        inputMode="tel"
      />

      {/* Servicios */}
      <FormField
        id="services"
        name="services"
        label={t("form.services")}
        placeholder={t("form.servicesPlaceholder")}
        value={formData.services}
        onChange={handleInputChange}
        maxLength={160}
      />

      {/* Mensaje */}
      <FormField
        id="message"
        name="message"
        label={t("form.message")}
        placeholder={t("form.messagePlaceholder")}
        value={formData.message}
        onChange={handleInputChange}
        error={fieldErrors.message}
        required
        type="textarea"
        maxLength={2000}
      />

      {/* Botón de envío */}
      <Button
        type="submit"
        disabled={isLoading}
        className="h-12 w-full rounded-xl px-6 py-3 font-medium shadow-[0_14px_30px_-22px_rgba(13,70,115,0.45)]"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("form.submitting")}
          </>
        ) : (
          t("form.submit")
        )}
      </Button>
    </form>
  );
}
