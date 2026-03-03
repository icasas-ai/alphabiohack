import {
  CompanyMembershipRole,
  PrismaClient,
  User as PrismaUser,
  UserRole,
} from "@prisma/client";

import { DEFAULT_SEED_COMPANY } from "@/prisma/seeds/config/default-company";

function getMembershipRole(user: Pick<PrismaUser, "role">) {
  if (user.role.includes(UserRole.Admin)) {
    return CompanyMembershipRole.Owner;
  }
  if (user.role.includes(UserRole.Therapist)) {
    return CompanyMembershipRole.Therapist;
  }
  if (user.role.includes(UserRole.FrontDesk)) {
    return CompanyMembershipRole.FrontDesk;
  }
  return CompanyMembershipRole.Patient;
}

export async function seedDefaultCompany(
  prisma: PrismaClient,
  usersInput?: Partial<PrismaUser>[],
) {
  const users =
    usersInput && usersInput.length > 0
      ? usersInput
      : await prisma.user.findMany({
          select: {
            id: true,
            email: true,
            firstname: true,
            lastname: true,
            role: true,
          },
        });

  const publicTherapist =
    users.find((user) => (user.role as UserRole[] | undefined)?.includes(UserRole.Therapist)) ??
    users[0];

  const company = await prisma.company.upsert({
    where: {
      slug: DEFAULT_SEED_COMPANY.slug,
    },
    update: {
      ...DEFAULT_SEED_COMPANY,
      publicTherapistId: publicTherapist?.id || null,
      publicEmail: publicTherapist?.email || DEFAULT_SEED_COMPANY.publicEmail,
    },
    create: {
      ...DEFAULT_SEED_COMPANY,
      publicTherapistId: publicTherapist?.id || null,
      publicEmail: publicTherapist?.email || DEFAULT_SEED_COMPANY.publicEmail,
    },
    select: {
      id: true,
      slug: true,
      name: true,
      publicTherapistId: true,
    },
  });

  for (const user of users) {
    if (!user.id || !user.role) continue;

    await prisma.companyMembership.upsert({
      where: {
        companyId_userId: {
          companyId: company.id,
          userId: user.id,
        },
      },
      update: {
        role: getMembershipRole(user as Pick<PrismaUser, "role">),
      },
      create: {
        companyId: company.id,
        userId: user.id,
        role: getMembershipRole(user as Pick<PrismaUser, "role">),
      },
    });
  }

  return company;
}
