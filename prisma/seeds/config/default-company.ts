import { DEFAULT_SEED_COMPANY_CONTENT } from "@/prisma/seeds/config/default-company-content";

export const DEFAULT_SEED_COMPANY = {
  id: "default-company",
  slug: "default-company",
  name: "AlphaBioHack Practice",
  logo: null,
  publicEmail: "therapist@example.com",
  publicPhone: "+15551234567",
  publicDescription: DEFAULT_SEED_COMPANY_CONTENT.en.publicDescription,
  publicSummary: DEFAULT_SEED_COMPANY_CONTENT.en.publicSummary,
  publicSpecialty: DEFAULT_SEED_COMPANY_CONTENT.en.publicSpecialty,
  defaultTimezone: "America/Los_Angeles",
  weekdaysHours: "9:00 AM - 6:00 PM",
  saturdayHours: "9:00 AM - 2:00 PM",
  sundayHours: "Closed",
  facebook: null,
  instagram: null,
  linkedin: null,
  twitter: null,
  tiktok: null,
  youtube: null,
  website: null,
} as const;
