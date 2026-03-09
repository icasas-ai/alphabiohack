import { Prisma, UserRole } from "@/lib/prisma-client";

import { prisma } from "@/lib/prisma";

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function findUserByIdWithInclude<TInclude extends object>(id: string, include: TInclude) {
  return prisma.user.findUnique({
    where: { id },
    include,
  });
}

export async function findUserByIdWithSelect<TSelect extends object>(id: string, select: TSelect) {
  return prisma.user.findUnique({
    where: { id },
    select,
  });
}

export async function findUsersByRole(role: UserRole, companyId?: string) {
  return prisma.user.findMany({
    where: {
      role: {
        has: role,
      },
      ...(companyId
        ? {
            companyMemberships: {
              some: {
                companyId,
              },
            },
          }
        : {}),
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function createUserWithData<TSelect extends object>(
  data: Prisma.UserUncheckedCreateInput,
  select: TSelect,
) {
  return prisma.user.create({
    data,
    select,
  });
}
