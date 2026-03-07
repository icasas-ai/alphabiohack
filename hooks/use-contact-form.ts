/**
 * Custom Hook para el formulario de contacto
 *
 * Este hook maneja toda la lógica de estado y operaciones del formulario de contacto,
 * separando la lógica de negocio de la presentación.
 */

import { useApiI18n } from "./use-api-i18n";
import { useAppToast } from "@/hooks/use-app-toast";
import {
  isValidEmailInput,
  isValidPhoneInput,
  normalizeEmailInput,
  normalizePhoneInput,
  normalizeWhitespace,
} from "@/lib/validation/form-fields";
import { useState } from "react";
import { useTranslations } from "next-intl";

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  services: string;
  message: string;
}

export interface UseContactFormReturn {
  // Estado
  formData: ContactFormData;
  isLoading: boolean;
  fieldErrors: Partial<Record<keyof ContactFormData, string>>;

  // Acciones
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  resetForm: () => void;

  // Utilidades
  isFormValid: boolean;
  hasUnsavedChanges: boolean;
}

export function useContactForm(): UseContactFormReturn {
  const { apiCall } = useApiI18n();
  const toast = useAppToast();
  const tReq = useTranslations("Requests");
  const tErrors = useTranslations("ApiErrors");

  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    services: "",
    message: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {
    name:
      hasAttemptedSubmit && !formData.name.trim()
        ? tReq("contact.validation.nameRequired")
        : undefined,
    email:
      hasAttemptedSubmit && !formData.email.trim()
        ? tReq("contact.validation.emailRequired")
        : hasAttemptedSubmit && !isValidEmailInput(formData.email)
          ? tReq("contact.validation.invalidEmail")
          : undefined,
    phone:
      hasAttemptedSubmit && formData.phone.trim() && !isValidPhoneInput(formData.phone)
        ? tReq("contact.validation.invalidPhone")
        : undefined,
    message:
      hasAttemptedSubmit && !formData.message.trim()
        ? tReq("contact.validation.messageRequired")
        : undefined,
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const nextValue =
      name === "email"
        ? normalizeEmailInput(value)
        : name === "phone"
          ? normalizePhoneInput(value)
          : name === "name" || name === "services"
            ? normalizeWhitespace(value)
            : value;

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);
    setIsLoading(true);

    if (!isFormValid) {
      setIsLoading(false);
      return;
    }

    try {
      const result = await apiCall<unknown>("/api/contact", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          name: normalizeWhitespace(formData.name),
          email: normalizeEmailInput(formData.email),
          phone: normalizePhoneInput(formData.phone),
          services: normalizeWhitespace(formData.services),
          message: formData.message.trim(),
        }),
      });

      if (result.success) {
        toast.success(
          result.successCode
            ? tReq(result.successCode)
            : tReq("contact.submit.success")
        );
        resetForm();
      } else {
        toast.error(tErrors(result.errorCode));
      }
    } catch {
      toast.error(tReq("contact.submit.error"));
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      services: "",
      message: "",
    });
    setHasAttemptedSubmit(false);
  };

  // Validaciones computadas
  const isFormValid = Boolean(
    formData.name.trim() &&
      isValidEmailInput(formData.email) &&
      (!formData.phone.trim() || isValidPhoneInput(formData.phone)) &&
      formData.message.trim()
  );

  const hasUnsavedChanges = Boolean(
    formData.name ||
      formData.email ||
      formData.phone ||
      formData.services ||
      formData.message
  );

  return {
    // Estado
    formData,
    isLoading,
    fieldErrors,

    // Acciones
    handleInputChange,
    handleSubmit,
    resetForm,

    // Utilidades
    isFormValid,
    hasUnsavedChanges,
  };
}
