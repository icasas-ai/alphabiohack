import {
  PrismaClient,
  Service as PrismaService,
  Specialty as PrismaSpecialty,
} from "@prisma/client";

const DEFAULT_SERVICES = [
  {
    description: "Consulta inicial de evaluación",
    cost: 90.0,
    duration: 15,
  },
];

export async function seedDefaultServices(
  prisma: PrismaClient,
  companyId: string,
  specialtiesInput?: Partial<PrismaSpecialty>[]
): Promise<Partial<PrismaService>[]> {
  let specialties = specialtiesInput;
  if (!specialties || specialties.length === 0) {
    specialties = await prisma.specialty.findMany({
      where: { companyId },
      select: { id: true, name: true },
    });
  }

  console.log(`Found ${specialties.length} specialties`);

  const existing = await prisma.service.findMany({
    where: { companyId },
    select: { id: true, description: true },
  });
  console.log(`Found ${existing.length} services`);

  if (existing.length !== 0) {
    console.log("Services already seeded. Nothing to seed.");
    return existing;
  }

  console.log("Seeding default services...");

  for (const specialty of specialties) {
    if (!specialty.id) continue;
    for (const service of DEFAULT_SERVICES) {
      await prisma.service.create({
        data: {
          ...service,
          companyId,
          specialtyId: specialty.id as string,
        },
      });
    }
  }

  const created = await prisma.service.findMany({
    where: { companyId },
    select: { id: true, description: true },
  });

  console.log("Default services seeded successfully");
  return created;
}
