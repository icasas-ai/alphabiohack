import { describe, expect, it } from "vitest";

import {
  BOOKING_STATUS_OPTIONS,
  BOOKING_STATUS_TRANSITIONS,
  canCancelBookingStatus,
} from "@/lib/utils/booking-status";

describe("booking status rules", () => {
  it("allows transitions to every status except the current one", () => {
    for (const status of BOOKING_STATUS_OPTIONS) {
      const transitions = BOOKING_STATUS_TRANSITIONS[status];

      expect(transitions).not.toContain(status);
      expect(transitions).toHaveLength(BOOKING_STATUS_OPTIONS.length - 1);
    }
  });

  it("only allows cancellation from active statuses", () => {
    expect(canCancelBookingStatus("Pending")).toBe(true);
    expect(canCancelBookingStatus("Confirmed")).toBe(true);
    expect(canCancelBookingStatus("InProgress")).toBe(true);

    expect(canCancelBookingStatus("Completed")).toBe(false);
    expect(canCancelBookingStatus("Cancelled")).toBe(false);
    expect(canCancelBookingStatus("NoShow")).toBe(false);
    expect(canCancelBookingStatus(undefined)).toBe(false);
  });
});
