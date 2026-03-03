import {
  seedDefaultBookings,
  seedDefaultBusinessHours,
  seedDefaultCompany,
  seedDefaultLocations,
  seedDefaultServices,
  seedDefaultSpecialties,
  seedDefaultUsers,
} from "@/prisma/seeds";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function main() {
  const users = await seedDefaultUsers(prisma);
  const company = await seedDefaultCompany(prisma, users);
  const locations = await seedDefaultLocations(prisma, company.id);
  await seedDefaultBusinessHours(prisma, locations);
  const specialties = await seedDefaultSpecialties(prisma, company.id);
  const services = await seedDefaultServices(prisma, company.id, specialties);
  await seedDefaultBookings(prisma, { companyId: company.id, users, locations, services });
}

main()
  .catch((error) => {
    console.error("❌ Error durante el seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
