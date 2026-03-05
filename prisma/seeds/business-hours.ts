import {
  DaysOfWeek,
  BusinessHours as PrismaBusinessHours,
  PrismaClient,
  Location as PrismaLocation,
} from "@/lib/prisma-client";

type DayConfig = {
  day: DaysOfWeek;
  slots: Array<{ start: string; end: string }>;
  isActive: boolean;
};

const DEFAULT_WEEK: DayConfig[] = [
  {
    day: DaysOfWeek.Monday,
    isActive: true,
    slots: [{ start: "09:00", end: "17:00" }],
  },
  {
    day: DaysOfWeek.Tuesday,
    isActive: true,
    slots: [{ start: "09:00", end: "17:00" }],
  },
  {
    day: DaysOfWeek.Wednesday,
    isActive: true,
    slots: [{ start: "09:00", end: "17:00" }],
  },
  {
    day: DaysOfWeek.Thursday,
    isActive: true,
    slots: [{ start: "09:00", end: "17:00" }],
  },
  {
    day: DaysOfWeek.Friday,
    isActive: true,
    slots: [{ start: "09:00", end: "17:00" }],
  },
  {
    day: DaysOfWeek.Saturday,
    isActive: true,
    slots: [{ start: "10:00", end: "14:00" }],
  },
  { day: DaysOfWeek.Sunday, isActive: false, slots: [] },
];

export async function seedDefaultBusinessHours(
  prisma: PrismaClient,
  locations: Partial<PrismaLocation>[] | []
): Promise<Partial<PrismaBusinessHours>[]> {
  if (locations.length === 0) {
    console.log("No locations found. Nothing to seed.");
    return [];
  }

  const existing = await prisma.businessHours.findMany({
    select: { id: true, locationId: true, dayOfWeek: true },
  });

  if (existing.length !== 0) {
    console.log("Business hours already seeded. Nothing to seed.");
    return existing;
  }

  for (const loc of locations) {
    console.log(`→ Seeding location ${loc.title} (${loc.id})`);
    for (const cfg of DEFAULT_WEEK) {
      const bh = await prisma.businessHours.upsert({
        where: {
          locationId_dayOfWeek: {
            locationId: loc.id as string,
            dayOfWeek: cfg.day,
          },
        },
        update: { isActive: cfg.isActive },
        create: {
          location: { connect: { id: loc.id as string } },
          dayOfWeek: cfg.day,
          isActive: cfg.isActive,
        },
      });

      for (const slot of cfg.slots) {
        await prisma.timeSlot.upsert({
          where: {
            businessHoursId_startTime_endTime: {
              businessHoursId: bh.id,
              startTime: slot.start,
              endTime: slot.end,
            },
          },
          update: { isActive: true },
          create: {
            businessHoursId: bh.id,
            startTime: slot.start,
            endTime: slot.end,
            isActive: true,
          },
        });
      }
    }
    console.log(`→ Location ${loc.title} (${loc.id}) seeded successfully`);
  }
  console.log("Business hours seeded successfully");
  const created = await prisma.businessHours.findMany({
    select: { id: true, locationId: true, dayOfWeek: true },
  });
  return created;
}
