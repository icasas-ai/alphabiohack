import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function createSpecialtyRecord(
  data: Prisma.SpecialtyUncheckedCreateInput,
) {
  return prisma.specialty.create({ data });
}

export async function findSpecialtyByIdWithInclude<TInclude extends object>(id: string, include: TInclude) {
  return prisma.specialty.findUnique({
    where: { id },
    include,
  });
}

export async function findFirstSpecialty<TWhere extends object, TInclude extends object>(
  where: TWhere,
  include: TInclude,
) {
  return prisma.specialty.findFirst({
    where,
    include,
  });
}

export async function findSpecialties<TWhere extends object | undefined, TInclude extends object>(
  where: TWhere,
  include: TInclude,
  orderBy: object,
  take?: number,
) {
  return prisma.specialty.findMany({
    where: where ?? undefined,
    include,
    orderBy,
    ...(take ? { take } : {}),
  });
}

export async function countSpecialties(where: object) {
  return prisma.specialty.count({ where });
}

export async function updateSpecialtyRecord(
  id: string,
  data: Prisma.SpecialtyUncheckedUpdateInput,
) {
  return prisma.specialty.update({
    where: { id },
    data,
  });
}

export async function deleteSpecialtyRecord(id: string) {
  return prisma.specialty.delete({
    where: { id },
  });
}
