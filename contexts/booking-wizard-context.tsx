"use client";

import { BookingStatus, BookingType } from "@/lib/prisma-browser";
import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { usePublicTherapist } from "@/hooks";
import type { Therapist } from "@/types";
import { isSingleTherapistModeEnabled } from "@/lib/config/features";
import {
  isValidEmailInput,
  isValidPhoneInput,
  normalizeWhitespace,
} from "@/lib/validation/form-fields";
import { useTranslations } from "next-intl";

// Tipos para los datos del formulario
export interface BookingFormData {
  // Paso 1: Tipo de cita y ubicación
  appointmentType: BookingType;
  locationId: string | null;
  
  // Paso 2: Especialidad y servicios
  specialtyId: string | null;
  selectedServiceIds: string[];
  
  // Paso 3: Fecha y hora
  selectedDate: Date | null;
  selectedTime: string;
  therapistId: string | null;
  selectedTherapist: Therapist | null;
  sessionDurationMinutes: number | null;
  
  // Paso 4: Información básica
  basicInfo: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    givenConsent: boolean;
    bookingNotes: string;
  };
  
  // Paso 5: Confirmación
  status: BookingStatus;

  patientId?: string;
  
  // Booking creado
  createdBooking: unknown | null;
}

// Tipo para el contexto
export interface BookingWizardContextType {
  data: BookingFormData;
  publicTherapist: Therapist | null;
  publicTherapistLoading: boolean;
  publicTherapistError: string | null;
  update: (updates: Partial<BookingFormData>) => void;
  reset: () => void;
  setData: React.Dispatch<React.SetStateAction<BookingFormData>>;
  // Validaciones
  canProceedToStep: (step: number) => boolean;
  getStepValidation: (step: number) => { isValid: boolean; errors: string[] };
}

// Valores por defecto
const defaultFormData: BookingFormData = {
  appointmentType: BookingType.DirectVisit,
  locationId: null,
  specialtyId: null,
  selectedServiceIds: [],
  selectedDate: null,
  selectedTime: "",
  therapistId: null, // Se establecerá automáticamente si está en modo terapeuta único
  selectedTherapist: null,
  sessionDurationMinutes: null,
  basicInfo: {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    givenConsent: false,
    bookingNotes: "",
  },
  status: BookingStatus.Pending,
  createdBooking: null,
};

// Crear el contexto
const BookingWizardContext = createContext<BookingWizardContextType | undefined>(undefined);

// Provider del contexto
export function BookingWizardProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<BookingFormData>(defaultFormData);
  const t = useTranslations('Booking.Validation');
  const isSingleTherapistMode = isSingleTherapistModeEnabled();
  const {
    therapist: publicTherapist,
    loading: publicTherapistLoading,
    error: publicTherapistError,
  } = usePublicTherapist();
  const searchParams = useSearchParams();
  const initializedLocationFromQuery = useRef(false);

  useEffect(() => {
    const defaultTherapistId = publicTherapist?.id;
    if (isSingleTherapistMode && defaultTherapistId) {
      setData((prev) => {
        const shouldKeepCurrentTherapistId = Boolean(prev.therapistId);
        const nextTherapistId = shouldKeepCurrentTherapistId
          ? prev.therapistId
          : defaultTherapistId;
        const nextSelectedTherapist = publicTherapist || prev.selectedTherapist;

        if (
          prev.therapistId === nextTherapistId &&
          prev.selectedTherapist?.id === nextSelectedTherapist?.id
        ) {
          return prev;
        }

        return {
          ...prev,
          therapistId: nextTherapistId,
          selectedTherapist: nextSelectedTherapist || null,
        };
      });
    }
  }, [
    data.therapistId,
    isSingleTherapistMode,
    publicTherapist,
    publicTherapist?.id,
  ]);

  useEffect(() => {
    if (initializedLocationFromQuery.current) {
      return;
    }

    const locationId = searchParams.get("locationId");

    initializedLocationFromQuery.current = true;

    if (!locationId || data.locationId === locationId) {
      return;
    }

    setData((prev) => ({
      ...prev,
      locationId,
      selectedDate: null,
      selectedTime: "",
      sessionDurationMinutes: null,
    }));
  }, [data.locationId, searchParams]);

  const update = useCallback((updates: Partial<BookingFormData>) => {
    setData(prev => ({
      ...prev,
      ...updates,
      // Si se actualiza basicInfo, hacer merge con el objeto existente
      ...(updates.basicInfo && {
        basicInfo: { ...prev.basicInfo, ...updates.basicInfo }
      }),
      ...(updates.therapistId !== undefined &&
        updates.therapistId !== prev.therapistId &&
        updates.selectedTherapist === undefined && {
          selectedTherapist: null
        }),
      // Si no se especifica therapistId y estamos en modo terapeuta único, usar el por defecto
      ...(updates.therapistId === undefined &&
        isSingleTherapistMode && {
          therapistId: prev.therapistId || publicTherapist?.id
        })
    }));
  }, [isSingleTherapistMode, publicTherapist?.id]);

  const reset = useCallback(() => {
    setData(defaultFormData);
  }, []);

  const normalizedFirstName = normalizeWhitespace(data.basicInfo.firstName);
  const normalizedLastName = normalizeWhitespace(data.basicInfo.lastName);
  const hasValidPhone = isValidPhoneInput(data.basicInfo.phone);
  const hasValidEmail = isValidEmailInput(data.basicInfo.email);

  // Validaciones por paso con i18n
  const canProceedToStep = useCallback((step: number): boolean => {
    switch (step) {
      case 0: // Selección de tipo de cita y ubicación
        return Boolean(
          data.appointmentType &&
            data.locationId &&
            (isSingleTherapistMode || data.therapistId),
        );
      case 1: // Selección de servicios
        return Boolean(data.locationId && data.selectedServiceIds.length > 0);
      case 2: // Selección de fecha y hora
        return Boolean(data.locationId && data.selectedServiceIds.length > 0 && data.selectedDate && data.selectedTime);
      case 3: // Información básica
        return Boolean(
          data.locationId &&
            data.selectedServiceIds.length > 0 &&
            data.selectedDate &&
            data.selectedTime &&
            normalizedFirstName &&
            normalizedLastName &&
            hasValidPhone &&
            hasValidEmail &&
            data.basicInfo.givenConsent,
        );
      case 4: // Confirmación
        return Boolean(
          data.locationId &&
            data.selectedServiceIds.length > 0 &&
            data.selectedDate &&
            data.selectedTime &&
            normalizedFirstName &&
            normalizedLastName &&
            hasValidPhone &&
            hasValidEmail &&
            data.basicInfo.givenConsent,
        );
      default:
        return false;
    }
  }, [data, hasValidEmail, hasValidPhone, isSingleTherapistMode, normalizedFirstName, normalizedLastName]);

  const getStepValidation = useCallback((step: number): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    switch (step) {
      case 0:
        if (!isSingleTherapistMode && !data.therapistId) errors.push(t('selectTherapist'));
        if (!data.appointmentType) errors.push(t('selectAppointmentType'));
        if (!data.locationId) errors.push(t('selectLocation'));
        break;
      case 1:
        if (!data.locationId) errors.push(t('selectLocation'));
        if (data.selectedServiceIds.length === 0) errors.push(t('selectAtLeastOneService'));
        break;
      case 2:
        if (!data.locationId) errors.push(t('selectLocation'));
        if (data.selectedServiceIds.length === 0) errors.push(t('selectAtLeastOneService'));
        if (!data.selectedDate) errors.push(t('selectDate'));
        if (!data.selectedTime) errors.push(t('selectTime'));
        break;
      case 3:
        if (!data.locationId) errors.push(t('selectLocation'));
        if (data.selectedServiceIds.length === 0) errors.push(t('selectAtLeastOneService'));
        if (!data.selectedDate) errors.push(t('selectDate'));
        if (!data.selectedTime) errors.push(t('selectTime'));
        if (!normalizedFirstName) errors.push(t('enterFirstName'));
        if (!normalizedLastName) errors.push(t('enterLastName'));
        if (!data.basicInfo.phone) {
          errors.push(t('enterPhone'));
        } else if (!hasValidPhone) {
          errors.push(t('invalidPhone'));
        }
        if (!data.basicInfo.email) {
          errors.push(t('enterEmail'));
        } else if (!hasValidEmail) {
          errors.push(t('invalidEmail'));
        }
        if (!data.basicInfo.givenConsent) errors.push(t('acceptSmsConsent'));
        break;
      case 4:
        if (!data.locationId) errors.push(t('selectLocation'));
        if (data.selectedServiceIds.length === 0) errors.push(t('selectAtLeastOneService'));
        if (!data.selectedDate) errors.push(t('selectDate'));
        if (!data.selectedTime) errors.push(t('selectTime'));
        if (!normalizedFirstName) errors.push(t('enterFirstName'));
        if (!normalizedLastName) errors.push(t('enterLastName'));
        if (!data.basicInfo.phone) {
          errors.push(t('enterPhone'));
        } else if (!hasValidPhone) {
          errors.push(t('invalidPhone'));
        }
        if (!data.basicInfo.email) {
          errors.push(t('enterEmail'));
        } else if (!hasValidEmail) {
          errors.push(t('invalidEmail'));
        }
        if (!data.basicInfo.givenConsent) errors.push(t('acceptSmsConsent'));
        break;
    }
    
    return { isValid: errors.length === 0, errors };
  }, [data, hasValidEmail, hasValidPhone, isSingleTherapistMode, normalizedFirstName, normalizedLastName, t]);

  const contextValue = useMemo(
    () => ({
      data,
      publicTherapist,
      publicTherapistLoading,
      publicTherapistError,
      update,
      reset,
      setData,
      canProceedToStep,
      getStepValidation,
    }),
    [
      data,
      publicTherapist,
      publicTherapistLoading,
      publicTherapistError,
      update,
      reset,
      setData,
      canProceedToStep,
      getStepValidation,
    ]
  );

  return (
    <BookingWizardContext.Provider value={contextValue}>
      {children}
    </BookingWizardContext.Provider>
  );
}

// Hook para usar el contexto
export function useBookingWizard() {
  const context = useContext(BookingWizardContext);
  if (context === undefined) {
    throw new Error("useBookingWizard must be used within a BookingWizardProvider");
  }
  return context;
}
