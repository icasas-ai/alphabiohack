import { Prisma } from "@/lib/prisma-client";

import { prisma } from "@/lib/prisma";

export async function createServiceRecord<TInclude extends object>(
  data: Prisma.ServiceUncheckedCreateInput,
  include: TInclude,
) {
  return prisma.service.create({
    data,
    include,
  });
}

export async function createManyServices(data: Prisma.ServiceCreateManyInput[]) {
  return prisma.service.createMany({ data });
}

export async function findServiceByIdWithInclude<TInclude extends object>(id: string, include: TInclude) {
  return prisma.service.findUnique({
    where: { id },
    include,
  });
}

export async function findServices<TWhere extends object | undefined, TInclude extends object>(
  where: TWhere,
  include: TInclude,
  orderBy: object,
  take?: number,
) {
  return prisma.service.findMany({
    where: where ?? undefined,
    include,
    orderBy,
    ...(take ? { take } : {}),
  });
}

export async function countServices(where: object) {
  return prisma.service.count({ where });
}

export async function updateServiceRecord(
  id: string,
  data: Prisma.ServiceUncheckedUpdateInput,
) {
  return prisma.service.update({
    where: { id },
    data,
  });
}

export async function deleteServiceRecord(id: string) {
  return prisma.service.delete({
    where: { id },
  });
}
