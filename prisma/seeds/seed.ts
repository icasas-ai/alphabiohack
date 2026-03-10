import {
  seedDefaultBookings,
  seedDefaultCompany,
  seedDefaultLocations,
  seedDefaultServices,
  seedDefaultSpecialties,
  seedDefaultUsers,
} from "@/prisma/seeds";

import { prisma } from "@/lib/prisma";

export async function main() {
  const users = await seedDefaultUsers(prisma);
  const company = await seedDefaultCompany(prisma, users);
  const locations = await seedDefaultLocations(prisma, company.id);
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
