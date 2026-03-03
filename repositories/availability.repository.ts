import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type AvailabilityClient = Prisma.TransactionClient | typeof prisma;

export async function createAvailabilityPeriodRecord(
  tx: AvailabilityClient,
  data: Prisma.AvailabilityPeriodUncheckedCreateInput,
) {
  return tx.availabilityPeriod.create({ data });
}

export async function createAvailabilityDayRecord(
  tx: AvailabilityClient,
  data: Prisma.AvailabilityDayUncheckedCreateInput,
) {
  return tx.availabilityDay.create({ data });
}

export async function createAvailabilityExcludedDateRecord(
  tx: AvailabilityClient,
  data: Prisma.AvailabilityExcludedDateUncheckedCreateInput,
) {
  return tx.availabilityExcludedDate.create({ data });
}

export async function createAvailabilityTimeRanges(
  tx: AvailabilityClient,
  data: Prisma.AvailabilityTimeRangeCreateManyInput[],
) {
  return tx.availabilityTimeRange.createMany({ data });
}

export async function createAvailabilityExcludedTimeRanges(
  tx: AvailabilityClient,
  data: Prisma.AvailabilityExcludedTimeRangeCreateManyInput[],
) {
  return tx.availabilityExcludedTimeRange.createMany({ data });
}

export async function findAvailabilityPeriodOwnership(id: string) {
  return prisma.availabilityPeriod.findUnique({
    where: { id },
    select: {
      id: true,
      therapistId: true,
    },
  });
}

export async function findAvailabilityExcludedDateOwnership(id: string) {
  return prisma.availabilityExcludedDate.findUnique({
    where: { id },
    select: {
      id: true,
      therapistId: true,
      availabilityPeriodId: true,
    },
  });
}

export async function findAvailabilityDayOwnership(id: string) {
  return prisma.availabilityDay.findUnique({
    where: { id },
    select: {
      id: true,
      therapistId: true,
    },
  });
}

export async function deleteAvailabilityPeriodRecord(id: string) {
  return prisma.availabilityPeriod.delete({
    where: { id },
  });
}
