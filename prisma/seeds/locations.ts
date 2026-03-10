import { PrismaClient, Location as PrismaLocation } from "@/lib/prisma-client";

import { PST_TZ } from "@/lib/utils/timezone";

const DEFAULT_LOCATIONS = [
  {
    title: "Location 1",
    address: "123 Main St, Anytown, USA",
    description: "Location 1",
    logo: "",
    lat: 0,
    lon: 0,
    timezone: PST_TZ,
  },

  {
    title: "Location 2",
    address: "123 Main St, Anytown, USA",
    description: "Location 2",
    logo: "",
    lat: 0,
    lon: 0,
    timezone: PST_TZ,
  },
  {
    title: "Location 3",
    address: "123 Main St, Anytown, USA",
    description: "Location 3",
    logo: "",
    lat: 0,
    lon: 0,
    timezone: PST_TZ,
  },
];

export async function seedDefaultLocations(
  prisma: PrismaClient,
  companyId: string,
): Promise<Partial<PrismaLocation>[]> {
  const existing = await prisma.location.findMany({
    where: { companyId },
    select: { id: true, title: true, timezone: true },
  });
  console.log(`Found ${existing.length} locations`);

  if (existing.length !== 0) {
    console.log("Locations already seeded. Nothing to seed.");
    return existing;
  }

  console.log("Seeding default locations...");

  await prisma.location.createMany({
    data: DEFAULT_LOCATIONS.map((location) => ({
      ...location,
      companyId,
    })),
  });

  const created = await prisma.location.findMany({
    where: { companyId },
    select: { id: true, title: true, timezone: true },
  });

  console.log("Default locations seeded successfully");
  return created;
}
