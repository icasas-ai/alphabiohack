import { PrismaClient, User as PrismaUser } from "@prisma/client";

import { DEFAULT_SEED_USERS } from "@/prisma/seeds/config/default-users";

export async function seedDefaultUsers(
  prisma: PrismaClient
): Promise<Partial<PrismaUser>[]> {
  const existing = await prisma.user.findMany({
    select: { id: true, email: true, role: true },
  });

  console.log(`Found ${existing.length} users`);

  if (existing.length !== 0) {
    console.log("Users already seeded. Nothing to seed.");
    return existing;
  }

  console.log("Seeding default users...");

  await prisma.user.createMany({
    data: DEFAULT_SEED_USERS,
  });

  const created = await prisma.user.findMany({
    select: { id: true, email: true, role: true },
  });

  console.log("Default users seeded successfully");
  return created;
}
