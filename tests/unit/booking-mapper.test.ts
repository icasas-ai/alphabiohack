import { BookingStatus, BookingType } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { mapBookingFormDataToCreateData } from "@/services/booking.service";
import { parseDateStringInTimeZone } from "@/lib/utils/timezone";

describe("mapBookingFormDataToCreateData", () => {
  it("maps wizard data into a booking payload using the office timezone", () => {
    const officeDate = parseDateStringInTimeZone("2026-03-02", "America/Chicago");

    const result = mapBookingFormDataToCreateData(
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

    expect(result.bookingSchedule.toISOString()).toBe("2026-03-02T16:00:00.000Z");
  });
});
