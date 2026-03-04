import type { BookingFormData } from "@/contexts";
import type { CreateBookingRequest } from "@/types";

import { combineDateAndTimeToUtc } from "@/lib/utils/timezone";

type WizardBookingRequestSource = Pick<
  BookingFormData,
  | "appointmentType"
  | "locationId"
  | "specialtyId"
  | "selectedServiceIds"
  | "selectedDate"
  | "selectedTime"
  | "therapistId"
  | "sessionDurationMinutes"
  | "basicInfo"
  | "status"
  | "patientId"
>;

type StaffBookingRequestSource = {
  bookingType: CreateBookingRequest["bookingType"];
  locationId: string;
  specialtyId?: string;
  serviceId?: string;
  bookedDurationMinutes?: number;
  firstname: string;
  lastname: string;
  phone: string;
  email: string;
  givenConsent: boolean;
  therapistId?: string;
  patientId?: string;
  bookingNotes?: string;
  status?: CreateBookingRequest["status"];
  selectedDate: Date;
  selectedTime: string;
};

export function buildBookingScheduleIsoForTimezone(
  date: Date,
  timeHHmm: string,
  timezone: string,
): string {
  return combineDateAndTimeToUtc(date, timeHHmm, timezone).toISOString();
}

export function buildCreateBookingRequestFromWizard(
  formData: WizardBookingRequestSource,
  timezone: string,
): CreateBookingRequest {
  return {
    bookingType: formData.appointmentType,
    locationId: formData.locationId!,
    specialtyId: formData.specialtyId || undefined,
    serviceId: formData.selectedServiceIds?.[0] || undefined,
    bookedDurationMinutes: formData.sessionDurationMinutes || undefined,
    firstname: formData.basicInfo.firstName,
    lastname: formData.basicInfo.lastName,
    phone: formData.basicInfo.phone,
    email: formData.basicInfo.email,
    givenConsent: formData.basicInfo.givenConsent,
    therapistId: formData.therapistId || undefined,
    patientId: formData.patientId || undefined,
    bookingNotes: formData.basicInfo.bookingNotes || undefined,
    bookingSchedule: buildBookingScheduleIsoForTimezone(
      formData.selectedDate!,
      formData.selectedTime,
      timezone,
    ),
    status: formData.status,
  };
}

export function buildCreateBookingRequestFromStaff(
  formData: StaffBookingRequestSource,
  timezone: string,
): CreateBookingRequest {
  return {
    bookingType: formData.bookingType,
    locationId: formData.locationId,
    specialtyId: formData.specialtyId || undefined,
    serviceId: formData.serviceId || undefined,
    bookedDurationMinutes: formData.bookedDurationMinutes || undefined,
    firstname: formData.firstname,
    lastname: formData.lastname,
    phone: formData.phone,
    email: formData.email,
    givenConsent: formData.givenConsent,
    therapistId: formData.therapistId || undefined,
    patientId: formData.patientId || undefined,
    bookingNotes: formData.bookingNotes || undefined,
    bookingSchedule: buildBookingScheduleIsoForTimezone(
      formData.selectedDate,
      formData.selectedTime,
      timezone,
    ),
    status: formData.status,
  };
}
