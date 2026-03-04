import { describe, expect, it } from "vitest";

import {
  combineDateAndTimeToUtc,
  dateKeyInTZ,
  getTimeZoneDifferenceHours,
  parseDateStringInTimeZone,
} from "@/lib/utils/timezone";

import { buildBookingScheduleIsoForTimezone as buildBookingScheduleIso } from "@/lib/utils/booking-request";

describe("timezone utilities", () => {
  it("keeps date-only parsing on the same calendar day in the target timezone", () => {
    const parsed = parseDateStringInTimeZone("2026-03-02", "America/Chicago");

    expect(dateKeyInTZ(parsed, "America/Chicago")).toBe("2026-03-02");
  });

  it("combines a local office date and time into the correct UTC instant", () => {
    const officeDate = parseDateStringInTimeZone("2026-03-02", "America/Chicago");
    const utcDate = combineDateAndTimeToUtc(officeDate, "10:00", "America/Chicago");

    expect(utcDate.toISOString()).toBe("2026-03-02T16:00:00.000Z");
  });

  it("treats a selected 2:00 PM as local to the office timezone, not the browser timezone", () => {
    const chicagoDate = parseDateStringInTimeZone("2026-03-02", "America/Chicago");
    const tijuanaDate = parseDateStringInTimeZone("2026-03-02", "America/Tijuana");

    expect(buildBookingScheduleIso(chicagoDate, "14:00", "America/Chicago")).toBe(
      "2026-03-02T20:00:00.000Z",
    );
    expect(buildBookingScheduleIso(tijuanaDate, "14:00", "America/Tijuana")).toBe(
      "2026-03-02T22:00:00.000Z",
    );
  });

  it("computes the hour difference between the office and viewer timezones for the booking date", () => {
    const officeDate = parseDateStringInTimeZone("2026-03-02", "America/Chicago");

    expect(
      getTimeZoneDifferenceHours(
        "America/Chicago",
        "America/Tijuana",
        officeDate,
      ),
    ).toBe(2);
  });
});
