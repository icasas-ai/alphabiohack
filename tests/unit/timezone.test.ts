import { describe, expect, it } from "vitest";

import {
  combineDateAndTimeToUtc,
  dateKeyInTZ,
  parseDateStringInTimeZone,
} from "@/lib/utils/timezone";

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
});
