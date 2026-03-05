import { Prisma } from "@/lib/prisma-client";

import { prisma } from "@/lib/prisma";

export async function createBookingRecord(data: Prisma.BookingUncheckedCreateInput) {
  return prisma.booking.create({ data });
}

export async function findBookingByIdWithInclude<TInclude extends object>(id: string, include: TInclude) {
  return prisma.booking.findUnique({
    where: { id },
    include,
  });
}

export async function findBookings<TWhere extends object | undefined, TInclude extends object | undefined>(
  where: TWhere,
  include?: TInclude,
  orderBy?: object,
  take?: number,
) {
  return prisma.booking.findMany({
    where: where ?? undefined,
    ...(include ? { include } : {}),
    ...(orderBy ? { orderBy } : {}),
    ...(take ? { take } : {}),
  });
}

export async function updateBookingRecord(
  id: string,
  data: Prisma.BookingUncheckedUpdateInput,
) {
  return prisma.booking.update({
    where: { id },
    data,
  });
}
