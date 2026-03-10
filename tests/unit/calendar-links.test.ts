import { describe, expect, it } from "vitest";

import { buildICS } from "@/lib/utils/calendar-links";
import { parseDateStringInTimeZone } from "@/lib/utils/timezone";

describe("buildICS", () => {
  it("includes the office timezone in the invite payload", () => {
    const officeDate = parseDateStringInTimeZone("2026-03-02", "America/Chicago");

    const result = buildICS(
      {
        uid: "booking-1@test",
        organizerEmail: "office@example.com",
        attendeeEmail: "client@example.com",
        title: "Appointment with Dr. Smith",
        description: "Bring previous lab work",
        location: "Chicago Office",
        date: officeDate,
        startTimeHHmm: "14:00",
        endTimeHHmm: "15:00",
      },
      "America/Chicago",
    );

    expect(result).toContain("X-WR-TIMEZONE:America/Chicago");
    expect(result).toContain("UID:booking-1@test");
    expect(result).toContain("DTSTART;TZID=America/Chicago:20260302T140000");
    expect(result).toContain("DTEND;TZID=America/Chicago:20260302T150000");
    expect(result).not.toContain("DTEND:20260302T150000");
  });
});
