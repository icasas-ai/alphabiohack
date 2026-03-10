import { randomBytes } from "node:crypto";

const BOOKING_NUMBER_PREFIX = "BK";
const BOOKING_NUMBER_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function formatBookingDatePart(date: Date) {
  const year = date.getUTCFullYear().toString().slice(-2);
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");

  return `${year}${month}${day}`;
}

function randomToken(length: number) {
  const bytes = randomBytes(length);

  return Array.from(bytes, (byte) => BOOKING_NUMBER_ALPHABET[byte % BOOKING_NUMBER_ALPHABET.length]).join("");
}

export function generateBookingNumber(date = new Date()) {
  return `${BOOKING_NUMBER_PREFIX}-${formatBookingDatePart(date)}-${randomToken(6)}`;
}
