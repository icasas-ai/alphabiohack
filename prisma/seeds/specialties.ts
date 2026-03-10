import { PrismaClient, Specialty as PrismaSpecialty } from "@/lib/prisma-client";

const DEFAULT_SPECIALTIES = [
  {
    name: "Alphabiotics",
    description:
      "Alphabiotics a hands-on, non-invasive technique involving a quick manual signal to the brain that aims to synchronize the left and right brain hemispheres, rebalance the nervous system from stress, and allow the body's innate healing wisdom to work.",
  },
];

export async function seedDefaultSpecialties(
  prisma: PrismaClient,
  companyId: string,
): Promise<Partial<PrismaSpecialty>[]> {
  const existing = await prisma.specialty.findMany({
    where: { companyId },
    select: { id: true, name: true },
  });
  console.log(`Found ${existing.length} specialties`);

  if (existing.length !== 0) {
    console.log("Specialties already seeded. Nothing to seed.");
    return existing;
  }

  console.log("Seeding default specialties...");

  await prisma.specialty.createMany({
    data: DEFAULT_SPECIALTIES.map((specialty) => ({
      ...specialty,
      companyId,
    })),
  });

  const created = await prisma.specialty.findMany({
    where: { companyId },
    select: { id: true, name: true },
  });

  console.log("Default specialties seeded successfully");
  return created;
}
