import { PrismaClient, User as PrismaUser } from "@/lib/prisma-client";

import { DEFAULT_SEED_USERS } from "@/prisma/seeds/config/default-users";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

export async function seedDefaultUsers(
  prisma: PrismaClient
): Promise<Partial<PrismaUser>[]> {
  const existing = await prisma.user.findMany({
    select: { id: true, email: true, role: true, passwordHash: true },
  });

  console.log(`Found ${existing.length} users`);
  const existingByEmail = new Map(existing.map((user) => [user.email, user]));

  let createdCount = 0;
  let updatedPasswordCount = 0;

  for (const { password, ...user } of DEFAULT_SEED_USERS) {
    const existingUser = existingByEmail.get(user.email);

    if (!existingUser) {
      await prisma.user.create({
        data: {
          ...user,
          passwordHash: hashPassword(password),
        },
      });
      createdCount += 1;
      continue;
    }

    if (
      !existingUser.passwordHash ||
      !verifyPassword(password, existingUser.passwordHash)
    ) {
      await prisma.user.update({
        where: { email: user.email },
        data: {
          passwordHash: hashPassword(password),
        },
      });
      updatedPasswordCount += 1;
    }
  }

  if (createdCount === 0 && updatedPasswordCount === 0) {
    console.log("Users already seeded. Nothing to seed.");
  } else {
    console.log(
      `Seeded ${createdCount} users and refreshed passwords for ${updatedPasswordCount} users.`,
    );
  }

  const created = await prisma.user.findMany({
    select: { id: true, email: true, role: true },
  });

  console.log("Default users seeded successfully");
  return created;
}
