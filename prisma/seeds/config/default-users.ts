import { UserRole } from "@prisma/client";

export type SeedUser = {
  email: string;
  supabaseId: string;
  firstname: string;
  lastname: string;
  avatar: string;
  password: string;
  role: UserRole[];
};

export const DEFAULT_SEED_USER_PASSWORD = "AlphaBioHack123!";

export const DEFAULT_SEED_USERS: SeedUser[] = [
  {
    email: "omar@montycode.dev",
    supabaseId: "a94c7581-bebf-4f1c-8fc3-031c1aff2741",
    firstname: "Omar",
    lastname: "Monty",
    avatar:
      "https://bwqlvbnkfkrchjdbbcfl.supabase.co/storage/v1/object/public/avatars/a94c7581-bebf-4f1c-8fc3-031c1aff2741/monty_profile.jpg",
    password: DEFAULT_SEED_USER_PASSWORD,
    role: [UserRole.Admin, UserRole.Therapist],
  },
  {
    email: "patient@myalphapulse.com",
    supabaseId: "e2ab1f51-f7a0-4901-84ab-bbce09ccbfe6",
    firstname: "Juan",
    lastname: "Pérez",
    avatar:
      "https://bwqlvbnkfkrchjdbbcfl.supabase.co/storage/v1/object/public/avatars/default/464623970_122112828386562541_2139823631881943910_n.jpg",
    password: DEFAULT_SEED_USER_PASSWORD,
    role: [UserRole.Patient],
  },
  {
    email: "therapist@example.com",
    supabaseId: "local-seed-therapist",
    firstname: "John",
    lastname: "Doe",
    avatar: "https://example.com/avatar.jpg",
    password: DEFAULT_SEED_USER_PASSWORD,
    role: [UserRole.Therapist],
  },
];
