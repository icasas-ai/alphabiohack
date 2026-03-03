import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function createLocationRecord<TInclude extends object>(
  data: Prisma.LocationUncheckedCreateInput,
  include: TInclude,
) {
  return prisma.location.create({
    data,
    include,
  });
}

export async function findLocationByIdWithSelect<TSelect extends object>(id: string, select: TSelect) {
  return prisma.location.findUnique({
    where: { id },
    select,
  });
}

export async function findLocationByIdWithInclude<TInclude extends object>(id: string, include: TInclude) {
  return prisma.location.findUnique({
    where: { id },
    include,
  });
}

export async function findLocations<TInclude extends object>(
  where: object | undefined,
  include: TInclude,
  orderBy: object,
) {
  return prisma.location.findMany({
    where,
    include,
    orderBy,
  });
}

export async function findLocationsWithSelect<TSelect extends object>(
  where: object | undefined,
  select: TSelect,
  orderBy: object,
) {
  return prisma.location.findMany({
    where,
    select,
    orderBy,
  });
}

export async function updateLocationRecord<TInclude extends object>(
  id: string,
  data: Prisma.LocationUncheckedUpdateInput,
  include: TInclude,
) {
  return prisma.location.update({
    where: { id },
    data,
    include,
  });
}

export async function deleteLocationRecord(id: string) {
  return prisma.location.delete({
    where: { id },
  });
}
