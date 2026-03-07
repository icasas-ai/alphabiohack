export type BookingStatusValue =
  | "Pending"
  | "NeedsAttention"
  | "Confirmed"
  | "InProgress"
  | "Completed"
  | "Cancelled"
  | "NoShow";

export const BOOKING_STATUS_OPTIONS: BookingStatusValue[] = [
  "Pending",
  "NeedsAttention",
  "Confirmed",
  "InProgress",
  "Completed",
  "Cancelled",
  "NoShow",
];

export const BOOKING_STATUS_TRANSITIONS = Object.fromEntries(
  BOOKING_STATUS_OPTIONS.map((status) => [
    status,
    BOOKING_STATUS_OPTIONS.filter((option) => option !== status),
  ]),
) as Record<BookingStatusValue, BookingStatusValue[]>;

export function canCancelBookingStatus(status?: string) {
  return (
    status === "Pending" ||
    status === "NeedsAttention" ||
    status === "Confirmed" ||
    status === "InProgress"
  );
}
