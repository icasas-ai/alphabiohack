import {
  BookingStatus,
  BookingType,
  Booking as PrismaBooking,
  PrismaClient,
  Location as PrismaLocation,
  Service as PrismaService,
  User as PrismaUser,
} from "@/lib/prisma-client";
import { PST_TZ, combineDateAndTimeToUtc } from "@/lib/utils/timezone";

// Fechas de ejemplo
const now = new Date();
const pastDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
const futureDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

const futureDate2 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

export async function seedDefaultBookings(
  prisma: PrismaClient,
  deps?: {
    companyId?: string;
    users?: Partial<PrismaUser>[];
    locations?: Partial<PrismaLocation>[];
    services?: Partial<PrismaService>[];
  }
): Promise<Partial<PrismaBooking>[]> {
  const existing = await prisma.booking.findMany({
    where: deps?.companyId ? { companyId: deps.companyId } : undefined,
    select: { id: true },
  });
  console.log(`Found ${existing.length} bookings`);

  if (existing.length !== 0) {
    console.log("Bookings already seeded. Nothing to seed.");
    return existing;
  }

  let users = deps?.users;
  let locations = deps?.locations;
  let services = deps?.services;
  const companyId = deps?.companyId;

  if (!users || users.length === 0) {
    users = await prisma.user.findMany({ select: { id: true, role: true } });
  }
  if (!locations || locations.length === 0) {
    locations = await prisma.location.findMany({
      select: { id: true, title: true, timezone: true },
    });
  }
  if (!services || services.length === 0) {
    services = await prisma.service.findMany({ select: { id: true } });
  }

  if (users.length === 0 || locations.length === 0 || services.length === 0) {
    console.log(
      "Missing dependencies to seed bookings (users/locations/services)"
    );
    return [];
  }

  // Elegir algunos IDs para relaciones
  const location0 = locations[0]?.id as string | undefined;
  const location1 = (locations[1]?.id ?? locations[0]?.id) as
    | string
    | undefined;
  const location2 = (locations[2]?.id ?? locations[0]?.id) as
    | string
    | undefined;
  const tz0 =
    (locations.find((l) => l.id === location0) as any)?.timezone ?? PST_TZ;
  const tz1 =
    (locations.find((l) => l.id === location1) as any)?.timezone ?? PST_TZ;
  const tz2 =
    (locations.find((l) => l.id === location2) as any)?.timezone ?? PST_TZ;
  const therapistId = (users.find((u) => (u as any).role?.includes("Therapist"))
    ?.id ?? users[0].id) as string;
  const patientId = (users.find((u) => (u as any).role?.includes("Patient"))
    ?.id ?? users[0].id) as string;
  const serviceId = services[0].id as string;

  const toCreate = [
    {
      bookingType: BookingType.DirectVisit,
      companyId: companyId as string,
      locationId: location1 as string,
      firstname: "Carlos",
      lastname: "Silva",
      phone: "+52 55 3456 7890",
      email: "carlos.silva@email.com",
      givenConsent: true,
      therapistId,
      patientId,
      bookingNotes: "Consulta de fisioterapia",
      bookingSchedule: combineDateAndTimeToUtc(
        futureDate,
        "09:00",
        tz1
      ).toISOString(),
      status: BookingStatus.Confirmed,
      serviceId,
    },
    {
      bookingType: BookingType.VideoCall,
      companyId: companyId as string,
      locationId: location0 as string,
      firstname: "María",
      lastname: "García",
      phone: "+52 55 2345 6789",
      email: "maria.garcia@email.com",
      givenConsent: true,
      therapistId,
      patientId,
      bookingNotes: "Sesión de seguimiento",
      bookingSchedule: combineDateAndTimeToUtc(
        pastDate,
        "14:30",
        tz0
      ).toISOString(),
      status: BookingStatus.Completed,
      serviceId,
    },
    {
      bookingType: BookingType.HomeVisit,
      companyId: companyId as string,
      locationId: location2 as string,
      firstname: "Roberto",
      lastname: "Fernández",
      phone: "+52 55 5678 9012",
      email: "roberto.fernandez@email.com",
      givenConsent: true,
      therapistId,
      patientId,
      bookingNotes: "Visita domiciliaria",
      bookingSchedule: combineDateAndTimeToUtc(
        futureDate2,
        "11:30",
        tz2
      ).toISOString(),
      status: BookingStatus.Pending,
      serviceId,
    },
  ];

  for (const data of toCreate) {
    await prisma.booking.create({ data });
  }

  const created = await prisma.booking.findMany({ select: { id: true } });
  console.log("Default bookings seeded successfully");
  return created;
}
