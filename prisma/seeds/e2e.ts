import {
  BookingStatus,
  BookingType,
  CompanyMembershipRole,
  UserRole,
} from "@/lib/prisma-client";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";
import { generateBookingNumber } from "@/lib/utils/booking-number";
import { PST_TZ, combineDateAndTimeToUtc } from "@/lib/utils/timezone";

const DEFAULT_PASSWORD = "E2E-pass-1234";
const COMPANY_SLUG = "e2e-default-company";
const TARGET_USERS = 12;
const TARGET_LOCATIONS = 10;
const TARGET_SPECIALTIES = 10;
const TARGET_SERVICES = 10;
const TARGET_BOOKINGS_PAST = 10;
const TARGET_BOOKINGS_FUTURE = 10;
const TARGET_AVAILABILITY_PERIODS = 10;

type UserSeed = {
  id: string;
  email: string;
  role: UserRole[];
};

function daysFromNow(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

async function ensureCompany() {
  const existing = await prisma.company.findUnique({
    where: { slug: COMPANY_SLUG },
    select: { id: true },
  });

  if (existing) {
    return existing.id;
  }

  const created = await prisma.company.create({
    data: {
      slug: COMPANY_SLUG,
      name: "E2E Validation Company",
      publicEmail: "e2e+company@alphabiohack.local",
      publicPhone: "+15550000000",
      publicDescription: "E2E seed company for high-volume validation.",
      publicSummary: "Contains synthetic records to validate end-to-end flows.",
      publicSpecialty: "E2E Testing",
      defaultTimezone: PST_TZ,
      weekdaysHours: "9:00 AM - 6:00 PM",
      saturdayHours: "9:00 AM - 2:00 PM",
      sundayHours: "Closed",
    },
    select: { id: true },
  });

  return created.id;
}

async function ensureUsers(companyId: string): Promise<UserSeed[]> {
  const existing = await prisma.user.findMany({
    where: {
      email: {
        startsWith: "e2e.user+",
      },
    },
    select: { id: true, email: true, role: true },
    orderBy: { email: "asc" },
  });

  const missing = Math.max(0, TARGET_USERS - existing.length);

  for (let i = 0; i < missing; i += 1) {
    const index = existing.length + i + 1;
    let role: UserRole[] = [UserRole.Patient];

    if (index <= 2) role = [UserRole.Therapist];
    if (index === 3) role = [UserRole.Admin, UserRole.Therapist];
    if (index === 4) role = [UserRole.FrontDesk];

    const created = await prisma.user.create({
      data: {
        email: `e2e.user+${index}@alphabiohack.local`,
        supabaseId: `e2e-user-${index}`,
        firstname: `E2E${index}`,
        lastname: "User",
        role,
        passwordHash: hashPassword(DEFAULT_PASSWORD),
      },
      select: { id: true, role: true },
    });

    const membershipRole =
      role.includes(UserRole.Admin)
        ? CompanyMembershipRole.Owner
        : role.includes(UserRole.Therapist)
          ? CompanyMembershipRole.Therapist
          : role.includes(UserRole.FrontDesk)
            ? CompanyMembershipRole.FrontDesk
            : CompanyMembershipRole.Patient;

    await prisma.companyMembership.upsert({
      where: {
        companyId_userId: {
          companyId,
          userId: created.id,
        },
      },
      update: { role: membershipRole },
      create: {
        companyId,
        userId: created.id,
        role: membershipRole,
      },
    });
  }

  const users = await prisma.user.findMany({
    where: { email: { startsWith: "e2e.user+" } },
    select: { id: true, email: true, role: true },
    orderBy: { email: "asc" },
    take: TARGET_USERS,
  });

  const therapist = users.find((user) => user.role.includes(UserRole.Therapist));
  if (therapist) {
    await prisma.company.update({
      where: { id: companyId },
      data: { publicTherapistId: therapist.id },
    });
  }

  return users;
}

async function ensureLocations(companyId: string) {
  const existing = await prisma.location.findMany({
    where: {
      companyId,
      title: { startsWith: "E2E Location " },
    },
    select: { id: true, timezone: true },
    orderBy: { title: "asc" },
  });

  const missing = Math.max(0, TARGET_LOCATIONS - existing.length);

  for (let i = 0; i < missing; i += 1) {
    const index = existing.length + i + 1;

    await prisma.location.create({
      data: {
        companyId,
        title: `E2E Location ${index}`,
        address: `${100 + index} E2E Street, Phoenix, AZ`,
        description: `E2E validation location ${index}`,
        timezone: PST_TZ,
      },
    });
  }

  return prisma.location.findMany({
    where: { companyId, title: { startsWith: "E2E Location " } },
    select: { id: true, timezone: true },
    orderBy: { title: "asc" },
    take: TARGET_LOCATIONS,
  });
}

async function ensureSpecialties(companyId: string) {
  const existing = await prisma.specialty.findMany({
    where: {
      companyId,
      name: { startsWith: "E2E Specialty " },
    },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const missing = Math.max(0, TARGET_SPECIALTIES - existing.length);

  for (let i = 0; i < missing; i += 1) {
    const index = existing.length + i + 1;

    await prisma.specialty.create({
      data: {
        companyId,
        name: `E2E Specialty ${index}`,
        description: `Synthetic specialty ${index} for e2e validations.`,
      },
    });
  }

  return prisma.specialty.findMany({
    where: {
      companyId,
      name: { startsWith: "E2E Specialty " },
    },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
    take: TARGET_SPECIALTIES,
  });
}

async function ensureServices(companyId: string, specialties: { id: string }[]) {
  const existing = await prisma.service.findMany({
    where: {
      companyId,
      description: { startsWith: "E2E Service " },
    },
    select: { id: true },
    orderBy: { description: "asc" },
  });

  const missing = Math.max(0, TARGET_SERVICES - existing.length);

  for (let i = 0; i < missing; i += 1) {
    const index = existing.length + i + 1;
    const specialty = specialties[i % specialties.length];

    await prisma.service.create({
      data: {
        companyId,
        specialtyId: specialty.id,
        description: `E2E Service ${index}`,
        cost: 75 + index * 5,
        duration: 30 + (index % 4) * 15,
      },
    });
  }

  return prisma.service.findMany({
    where: {
      companyId,
      description: { startsWith: "E2E Service " },
    },
    select: { id: true, duration: true, specialtyId: true },
    orderBy: { description: "asc" },
    take: TARGET_SERVICES,
  });
}

async function ensureBookings(params: {
  companyId: string;
  users: UserSeed[];
  locations: { id: string; timezone: string }[];
  services: { id: string; duration: number; specialtyId: string }[];
}) {
  const { companyId, users, locations, services } = params;

  const therapists = users.filter((user) => user.role.includes(UserRole.Therapist));
  const patients = users.filter((user) => user.role.includes(UserRole.Patient));
  const fallbackPatient = users[0];

  const existing = await prisma.booking.findMany({
    where: {
      companyId,
      email: {
        startsWith: "e2e.booking+",
      },
    },
    select: { id: true, bookingSchedule: true },
  });

  const now = new Date();
  const pastCount = existing.filter((booking) => booking.bookingSchedule < now).length;
  const futureCount = existing.filter((booking) => booking.bookingSchedule >= now).length;

  const toCreatePast = Math.max(0, TARGET_BOOKINGS_PAST - pastCount);
  const toCreateFuture = Math.max(0, TARGET_BOOKINGS_FUTURE - futureCount);

  for (let i = 0; i < toCreatePast; i += 1) {
    const offset = i + 1;
    const scheduleDate = daysFromNow(-offset * 2);
    const location = locations[i % locations.length];
    const service = services[i % services.length];
    const therapist = therapists[i % therapists.length] ?? users[0];
    const patient = patients[i % patients.length] ?? fallbackPatient;

    await prisma.booking.create({
      data: {
        companyId,
        bookingNumber: generateBookingNumber(scheduleDate),
        bookingType: BookingType.DirectVisit,
        locationId: location.id,
        specialtyId: service.specialtyId,
        serviceId: service.id,
        bookedDurationMinutes: service.duration,
        firstname: `Past${offset}`,
        lastname: "Patient",
        phone: `+155501${(1000 + offset).toString().slice(-4)}`,
        email: `e2e.booking+past${offset}@alphabiohack.local`,
        givenConsent: true,
        therapistId: therapist.id,
        patientId: patient.id,
        bookingNotes: "Synthetic past booking for E2E validation.",
        bookingSchedule: combineDateAndTimeToUtc(scheduleDate, "10:00", location.timezone),
        status: BookingStatus.Completed,
      },
    });
  }

  for (let i = 0; i < toCreateFuture; i += 1) {
    const offset = i + 1;
    const scheduleDate = daysFromNow(offset * 2);
    const location = locations[i % locations.length];
    const service = services[i % services.length];
    const therapist = therapists[i % therapists.length] ?? users[0];
    const patient = patients[i % patients.length] ?? fallbackPatient;

    await prisma.booking.create({
      data: {
        companyId,
        bookingNumber: generateBookingNumber(scheduleDate),
        bookingType: BookingType.VideoCall,
        locationId: location.id,
        specialtyId: service.specialtyId,
        serviceId: service.id,
        bookedDurationMinutes: service.duration,
        firstname: `Future${offset}`,
        lastname: "Patient",
        phone: `+155509${(1000 + offset).toString().slice(-4)}`,
        email: `e2e.booking+future${offset}@alphabiohack.local`,
        givenConsent: true,
        therapistId: therapist.id,
        patientId: patient.id,
        bookingNotes: "Synthetic future booking for E2E validation.",
        bookingSchedule: combineDateAndTimeToUtc(scheduleDate, "14:00", location.timezone),
        status: BookingStatus.Confirmed,
      },
    });
  }
}

async function ensureAvailability(params: {
  companyId: string;
  therapistId: string;
  locationId: string;
}) {
  const { companyId, therapistId, locationId } = params;

  const existing = await prisma.availabilityPeriod.findMany({
    where: {
      companyId,
      title: { startsWith: "E2E Period " },
    },
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });

  const missing = Math.max(0, TARGET_AVAILABILITY_PERIODS - existing.length);

  for (let i = 0; i < missing; i += 1) {
    const index = existing.length + i + 1;
    const startDate = daysFromNow(index * 7);
    const endDate = daysFromNow(index * 7 + 2);

    const period = await prisma.availabilityPeriod.create({
      data: {
        companyId,
        therapistId,
        locationId,
        title: `E2E Period ${index}`,
        notes: "Synthetic availability period for e2e.",
        startDate,
        endDate,
      },
      select: { id: true },
    });

    const day = await prisma.availabilityDay.create({
      data: {
        availabilityPeriodId: period.id,
        companyId,
        therapistId,
        locationId,
        date: startDate,
        sessionDurationMinutes: 60,
        notes: "E2E available day",
      },
      select: { id: true },
    });

    await prisma.availabilityTimeRange.createMany({
      data: [
        {
          availabilityDayId: day.id,
          startTime: "09:00",
          endTime: "12:00",
        },
        {
          availabilityDayId: day.id,
          startTime: "13:00",
          endTime: "17:00",
        },
      ],
    });
  }
}

export async function main() {
  console.log("🌱 Starting e2e seed...");

  const companyId = await ensureCompany();
  const users = await ensureUsers(companyId);
  const locations = await ensureLocations(companyId);
  const specialties = await ensureSpecialties(companyId);
  const services = await ensureServices(companyId, specialties);

  await ensureBookings({ companyId, users, locations, services });

  const therapistId =
    users.find((user) => user.role.includes(UserRole.Therapist))?.id ?? users[0]?.id;
  const locationId = locations[0]?.id;

  if (therapistId && locationId) {
    await ensureAvailability({
      companyId,
      therapistId,
      locationId,
    });
  }

  const summary = await Promise.all([
    prisma.user.count({ where: { email: { startsWith: "e2e.user+" } } }),
    prisma.location.count({ where: { companyId, title: { startsWith: "E2E Location " } } }),
    prisma.specialty.count({ where: { companyId, name: { startsWith: "E2E Specialty " } } }),
    prisma.service.count({ where: { companyId, description: { startsWith: "E2E Service " } } }),
    prisma.booking.count({ where: { companyId, email: { startsWith: "e2e.booking+" } } }),
    prisma.availabilityPeriod.count({ where: { companyId, title: { startsWith: "E2E Period " } } }),
  ]);

  console.log("✅ E2E seed complete");
  console.table({
    users: summary[0],
    locations: summary[1],
    specialties: summary[2],
    services: summary[3],
    bookings: summary[4],
    availabilityPeriods: summary[5],
  });
}

main()
  .catch((error) => {
    console.error("❌ E2E seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
