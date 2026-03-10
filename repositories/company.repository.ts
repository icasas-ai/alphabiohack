import { Prisma } from "@/lib/prisma-client";

import { prisma } from "@/lib/prisma";

export async function findCompanyById(id: string) {
  return prisma.company.findUnique({
    where: { id },
  });
}

export async function findCompanyBySlug(slug: string) {
  return prisma.company.findUnique({
    where: { slug },
  });
}

export async function findCompanyWithSelect<TSelect extends object>(
  id: string,
  select: TSelect,
) {
  return prisma.company.findUnique({
    where: { id },
    select,
  });
}

export async function upsertCompanyBySlug<TSelect extends object>(
  slug: string,
  create: Prisma.CompanyUncheckedCreateInput,
  update: Prisma.CompanyUncheckedUpdateInput,
  select: TSelect,
) {
  return prisma.company.upsert({
    where: { slug },
    create,
    update,
    select,
  });
}
