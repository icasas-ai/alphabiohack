import { CompanyMembershipRole, UserRole } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function findPrimaryCompanyMembershipForUser(userId: string) {
  return prisma.companyMembership.findFirst({
    where: { userId },
    include: {
      company: true,
    },
    orderBy: [
      {
        role: "asc",
      },
      {
        createdAt: "asc",
      },
    ],
  });
}

export async function findCompanyContextForUser(userId: string) {
  return prisma.companyMembership.findFirst({
    where: { userId },
    include: {
      company: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function findFirstTherapistMembershipForCompany(companyId: string) {
  return prisma.companyMembership.findFirst({
    where: {
      companyId,
      role: {
        in: [CompanyMembershipRole.Therapist, CompanyMembershipRole.Owner],
      },
      user: {
        role: {
          has: UserRole.Therapist,
        },
      },
    },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function upsertCompanyMembership(
  companyId: string,
  userId: string,
  role: CompanyMembershipRole,
) {
  return prisma.companyMembership.upsert({
    where: {
      companyId_userId: {
        companyId,
        userId,
      },
    },
    update: {
      role,
    },
    create: {
      companyId,
      userId,
      role,
    },
  });
}
