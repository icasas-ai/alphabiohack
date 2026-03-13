import { BookingStatus, BookingType } from "@/lib/prisma-client";
import { describe, expect, it } from "vitest";

import {
  buildCreateBookingRequestFromStaff,
  buildCreateBookingRequestFromWizard,
} from "@/lib/utils/booking-request";
import { parseDateStringInTimeZone } from "@/lib/utils/timezone";

describe("buildCreateBookingRequestFromWizard", () => {
  it("maps wizard data into a normalized booking request using the office timezone", () => {
    const officeDate = parseDateStringInTimeZone("2026-03-02", "America/Chicago");

    const result = buildCreateBookingRequestFromWizard(
      {
        appointmentType: BookingType.DirectVisit,
        locationId: "loc_1",
        specialtyId: "spec_1",
        selectedServiceIds: ["svc_1"],
        selectedDate: officeDate,
        selectedTime: "10:00",
        therapistId: "therapist_1",
        sessionDurationMinutes: 60,
        basicInfo: {
          firstName: "Jane",
          lastName: "Doe",
          phone: "+15555555555",
          email: "jane@example.com",
          givenConsent: true,
          bookingNotes: "Prefers morning appointments",
        },
        status: BookingStatus.Pending,
        patientId: "patient_1",
      },
      "America/Chicago",
    );

    expect(result).toMatchObject({
      bookingType: BookingType.DirectVisit,
      locationId: "loc_1",
      specialtyId: "spec_1",
      serviceId: "svc_1",
      bookedDurationMinutes: 60,
      firstname: "Jane",
      lastname: "Doe",
      phone: "+15555555555",
      email: "jane@example.com",
      givenConsent: true,
      therapistId: "therapist_1",
      patientId: "patient_1",
      bookingNotes: "Prefers morning appointments",
      status: BookingStatus.Pending,
    });

    expect(result.bookingSchedule).toBe("2026-03-02T16:00:00.000Z");
  });

  it("maps front desk booking data into a normalized booking request using the office timezone", () => {
    const officeDate = parseDateStringInTimeZone("2026-03-02", "America/Chicago");

    const result = buildCreateBookingRequestFromStaff(
      {
        bookingType: BookingType.DirectVisit,
        locationId: "loc_1",
        specialtyId: "spec_1",
        serviceId: "svc_1",
        bookedDurationMinutes: 60,
        firstname: "Jane",
        lastname: "Doe",
        phone: "+15555555555",
        email: "jane@example.com",
        givenConsent: false,
        therapistId: "therapist_1",
        bookingNotes: "Front desk created booking",
        status: BookingStatus.Confirmed,
        selectedDate: officeDate,
        selectedTime: "14:00",
      },
      "America/Chicago",
    );

    expect(result).toMatchObject({
      bookingType: BookingType.DirectVisit,
      locationId: "loc_1",
      specialtyId: "spec_1",
      serviceId: "svc_1",
      bookedDurationMinutes: 60,
      firstname: "Jane",
      lastname: "Doe",
      phone: "+15555555555",
      email: "jane@example.com",
      givenConsent: false,
      therapistId: "therapist_1",
      bookingNotes: "Front desk created booking",
      status: BookingStatus.Confirmed,
    });

    expect(result.bookingSchedule).toBe("2026-03-02T20:00:00.000Z");
  });
});
