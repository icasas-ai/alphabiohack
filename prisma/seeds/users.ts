import { PrismaClient, User as PrismaUser, UserRole } from "@prisma/client";

const SINGLE_THERAPIST = process.env.SINGLE_THERAPIST!;
const SINGLE_THERAPIST_EMAIL = process.env.SINGLE_THERAPIST_EMAIL!;
const SINGLE_THERAPIST_SUPABASE_ID = process.env.SINGLE_THERAPIST_SUPABASE_ID!;
const SINGLE_THERAPIST_FIRSTNAME = process.env.SINGLE_THERAPIST_FIRSTNAME!;
const SINGLE_THERAPIST_LASTNAME = process.env.SINGLE_THERAPIST_LASTNAME!;
const SINGLE_THERAPIST_AVATAR = process.env.SINGLE_THERAPIST_AVATAR!;

const DEFAULT_USERS = [
  {
    email: "omar@montycode.dev",
    supabaseId: "a94c7581-bebf-4f1c-8fc3-031c1aff2741",
    firstname: "Omar",
    lastname: "Monty",
    avatar:
      "https://bwqlvbnkfkrchjdbbcfl.supabase.co/storage/v1/object/public/avatars/a94c7581-bebf-4f1c-8fc3-031c1aff2741/monty_profile.jpg",
    role: [UserRole.Admin, UserRole.Therapist],
  },
  {
    email: "patient@myalphapulse.com",
    supabaseId: "e2ab1f51-f7a0-4901-84ab-bbce09ccbfe6",
    firstname: "Juan",
    lastname: "Pérez",
    avatar:
      "https://bwqlvbnkfkrchjdbbcfl.supabase.co/storage/v1/object/public/avatars/default/464623970_122112828386562541_2139823631881943910_n.jpg",
    role: [UserRole.Patient],
  },
];

if (SINGLE_THERAPIST) {
  DEFAULT_USERS.push({
    email: SINGLE_THERAPIST_EMAIL,
    supabaseId: SINGLE_THERAPIST_SUPABASE_ID,
    firstname: SINGLE_THERAPIST_FIRSTNAME,
    lastname: SINGLE_THERAPIST_LASTNAME,
    avatar: SINGLE_THERAPIST_AVATAR,
    role: [UserRole.Therapist],
  });
}

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
    data: DEFAULT_USERS,
  });

  const created = await prisma.user.findMany({
    select: { id: true, email: true, role: true },
  });

  console.log("Default users seeded successfully");
  return created;
}
