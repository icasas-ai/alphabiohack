import { BookingStatus, Prisma } from "@prisma/client";

import { combineDateAndTimeToUtc, formatBookingToLocalStrings } from "@/lib/utils/timezone";
import { prisma } from "@/lib/prisma";

export interface AvailabilityTimeRangeInput {
  startTime: string;
  endTime: string;
  isActive?: boolean;
}

export interface AvailabilityDayOverrideInput {
  date: string;
  isAvailable?: boolean;
  sessionDurationMinutes?: number;
  notes?: string;
  timeRanges?: AvailabilityTimeRangeInput[];
}

export interface CreateAvailabilityPeriodInput {
  therapistId: string;
  locationId: string;
  title?: string;
  notes?: string;
  startDate: string;
  endDate: string;
  excludedDates?: string[];
  sessionDurationMinutes: number;
  timeRanges: AvailabilityTimeRangeInput[];
  dayOverrides?: AvailabilityDayOverrideInput[];
}

function mapDayTemplate(
  date: string,
  input: CreateAvailabilityPeriodInput,
  overridesByDate: Map<string, AvailabilityDayOverrideInput>,
) {
  const override = overridesByDate.get(date);

  return {
    override,
    isAvailable: override?.isAvailable ?? true,
    sessionDurationMinutes:
      override?.sessionDurationMinutes || input.sessionDurationMinutes,
    notes: override?.notes,
    timeRanges: override?.timeRanges || input.timeRanges,
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;

function parseDateOnly(value: string | Date) {
  if (value instanceof Date) {
    return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  }

  return new Date(`${value}T00:00:00.000Z`);
}

function formatDateOnly(value: Date) {
  return value.toISOString().slice(0, 10);
}

function buildDefaultAvailabilityTitle(locationTitle: string, startDate: string, endDate: string) {
  if (startDate === endDate) {
    return `${locationTitle} | ${startDate}`;
  }

  return `${locationTitle} | ${startDate} to ${endDate}`;
}

function getMonthBounds(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const start = new Date(Date.UTC(year, monthNumber - 1, 1));
  const end = new Date(Date.UTC(year, monthNumber, 0));
  return { start, end };
}

function enumerateDates(startDate: string, endDate: string) {
  const dates: string[] = [];
  for (
    let cursor = parseDateOnly(startDate);
    cursor.getTime() <= parseDateOnly(endDate).getTime();
    cursor = new Date(cursor.getTime() + DAY_MS)
  ) {
    dates.push(formatDateOnly(cursor));
  }

  return dates;
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function generateSlotTimes(
  timeRanges: AvailabilityTimeRangeInput[],
  sessionDurationMinutes: number,
) {
  const slots: string[] = [];

  for (const range of timeRanges) {
    if (range.isActive === false) continue;

    const start = timeToMinutes(range.startTime);
    const end = timeToMinutes(range.endTime);

    for (
      let cursor = start;
      cursor + sessionDurationMinutes <= end;
      cursor += sessionDurationMinutes
    ) {
      slots.push(minutesToTime(cursor));
    }
  }

  return slots;
}

function validateUniqueTimeRanges(
  timeRanges: AvailabilityTimeRangeInput[],
  contextLabel = "time ranges",
) {
  const seen = new Set<string>();

  for (const range of timeRanges) {
    if (!range.startTime || !range.endTime) continue;

    const key = `${range.startTime}-${range.endTime}`;
    if (seen.has(key)) {
      throw new Error(`Duplicate ${contextLabel} are not allowed: ${range.startTime} - ${range.endTime}`);
    }

    seen.add(key);
  }
}

async function getLocationTimezone(locationId: string) {
  const location = await prisma.location.findUnique({
    where: { id: locationId },
    select: { timezone: true },
  });

  return location?.timezone || "America/Los_Angeles";
}

async function getBookedTimesForDay(
  therapistId: string,
  locationId: string,
  date: string,
  timezone: string,
) {
  const targetDate = parseDateOnly(date);
  const bookings = await prisma.booking.findMany({
    where: {
      therapistId,
      locationId,
      status: {
        not: BookingStatus.Cancelled,
      },
      bookingSchedule: {
        gte: new Date(targetDate.getTime() - DAY_MS),
        lte: new Date(targetDate.getTime() + DAY_MS * 2),
      },
    },
    select: {
      bookingSchedule: true,
    },
  });

  const bookedTimes = new Set<string>();

  for (const booking of bookings) {
    const local = formatBookingToLocalStrings(booking.bookingSchedule, timezone);
    if (local.dateString === date) {
      bookedTimes.add(local.timeString);
    }
  }

  return bookedTimes;
}

export async function createAvailabilityPeriod(input: CreateAvailabilityPeriodInput) {
  if (!input.therapistId || !input.locationId) {
    throw new Error("Therapist and location are required");
  }

  if (input.sessionDurationMinutes <= 0) {
    throw new Error("Session duration must be greater than zero");
  }

  if (!input.timeRanges.length) {
    throw new Error("At least one time range is required");
  }

  validateUniqueTimeRanges(input.timeRanges, "time ranges");

  for (const override of input.dayOverrides || []) {
    if (override.timeRanges?.length) {
      validateUniqueTimeRanges(override.timeRanges, `time ranges for ${override.date}`);
    }
  }

  const allDates = enumerateDates(input.startDate, input.endDate);
  const excluded = new Set(input.excludedDates || []);
  const overridesByDate = new Map(
    (input.dayOverrides || []).map((override) => [override.date, override]),
  );
  const candidateDates = allDates.filter((date) => !excluded.has(date));

  const existingDays = await prisma.availabilityDay.findMany({
    where: {
      therapistId: input.therapistId,
      locationId: input.locationId,
      date: {
        in: candidateDates.map(parseDateOnly),
      },
    },
    select: { date: true },
  });

  if (existingDays.length > 0) {
    throw new Error(
      `Availability already exists for: ${existingDays.map((day) => formatDateOnly(day.date)).join(", ")}`,
    );
  }

  return prisma.$transaction(async (tx) => {
    const location = await tx.location.findUnique({
      where: { id: input.locationId },
      select: { title: true },
    });

    const period = await tx.availabilityPeriod.create({
      data: {
        therapistId: input.therapistId,
        locationId: input.locationId,
        title:
          input.title?.trim() ||
          buildDefaultAvailabilityTitle(
            location?.title || "Availability",
            input.startDate,
            input.endDate,
          ),
        notes: input.notes,
        startDate: parseDateOnly(input.startDate),
        endDate: parseDateOnly(input.endDate),
      },
    });

    for (const date of candidateDates) {
      const template = mapDayTemplate(date, input, overridesByDate);

      const day = await tx.availabilityDay.create({
        data: {
          availabilityPeriodId: period.id,
          therapistId: input.therapistId,
          locationId: input.locationId,
          date: parseDateOnly(date),
          isAvailable: template.isAvailable,
          sessionDurationMinutes: template.sessionDurationMinutes,
          notes: template.notes,
        },
      });

      if (template.isAvailable) {
        await tx.availabilityTimeRange.createMany({
          data: template.timeRanges.map((range) => ({
            availabilityDayId: day.id,
            startTime: range.startTime,
            endTime: range.endTime,
            isActive: range.isActive ?? true,
          })),
        });
      }
    }

    for (const date of excluded) {
      if (!allDates.includes(date)) continue;

      const template = mapDayTemplate(date, input, overridesByDate);
      const excludedDate = await tx.availabilityExcludedDate.create({
        data: {
          availabilityPeriodId: period.id,
          therapistId: input.therapistId,
          locationId: input.locationId,
          date: parseDateOnly(date),
          sessionDurationMinutes: template.sessionDurationMinutes,
          notes: template.notes,
        },
      });

      if (template.timeRanges.length) {
        await tx.availabilityExcludedTimeRange.createMany({
          data: template.timeRanges.map((range) => ({
            availabilityExcludedDateId: excludedDate.id,
            startTime: range.startTime,
            endTime: range.endTime,
            isActive: range.isActive ?? true,
          })),
        });
      }
    }

    return tx.availabilityPeriod.findUnique({
      where: { id: period.id },
      include: {
        therapist: {
          select: { id: true, firstname: true, lastname: true },
        },
        location: {
          select: { id: true, title: true, timezone: true },
        },
        days: {
          include: {
            timeRanges: {
              orderBy: { startTime: "asc" },
            },
          },
          orderBy: { date: "asc" },
        },
        excludedDates: {
          include: {
            timeRanges: {
              orderBy: { startTime: "asc" },
            },
          },
          orderBy: { date: "asc" },
        },
      },
    });
  });
}

export async function listAvailabilityPeriods({
  therapistId,
  locationId,
  month,
}: {
  therapistId?: string;
  locationId?: string;
  month?: string;
}) {
  const where: Prisma.AvailabilityPeriodWhereInput = {};

  if (therapistId) where.therapistId = therapistId;
  if (locationId) where.locationId = locationId;

  let dayDateFilter: Prisma.DateTimeFilter | undefined;
  let excludedDateFilter: Prisma.DateTimeFilter | undefined;
  if (month) {
    const { start, end } = getMonthBounds(month);
    where.startDate = { lte: end };
    where.endDate = { gte: start };
    dayDateFilter = { gte: start, lte: end };
    excludedDateFilter = { gte: start, lte: end };
  }

  return prisma.availabilityPeriod.findMany({
    where,
    include: {
      therapist: {
        select: { id: true, firstname: true, lastname: true, email: true },
      },
      location: {
        select: { id: true, title: true, timezone: true },
      },
      days: {
        where: dayDateFilter ? { date: dayDateFilter } : undefined,
        include: {
          timeRanges: {
            orderBy: { startTime: "asc" },
          },
        },
        orderBy: { date: "asc" },
      },
      excludedDates: {
        where: excludedDateFilter ? { date: excludedDateFilter } : undefined,
        include: {
          timeRanges: {
            orderBy: { startTime: "asc" },
          },
        },
        orderBy: { date: "asc" },
      },
    },
    orderBy: { startDate: "asc" },
  });
}

export async function deleteAvailabilityPeriod(id: string) {
  return prisma.availabilityPeriod.delete({
    where: { id },
  });
}

export async function getAvailabilityPeriodOwnership(id: string) {
  return prisma.availabilityPeriod.findUnique({
    where: { id },
    select: {
      id: true,
      therapistId: true,
    },
  });
}

export async function getAvailabilityExcludedDateOwnership(id: string) {
  return prisma.availabilityExcludedDate.findUnique({
    where: { id },
    select: {
      id: true,
      therapistId: true,
      availabilityPeriodId: true,
    },
  });
}

export async function restoreAvailabilityExcludedDate(id: string) {
  return prisma.$transaction(async (tx) => {
    const excludedDate = await tx.availabilityExcludedDate.findUnique({
      where: { id },
      include: {
        timeRanges: {
          orderBy: { startTime: "asc" },
        },
      },
    });

    if (!excludedDate) {
      throw new Error("Excluded date not found");
    }

    const existingDay = await tx.availabilityDay.findFirst({
      where: {
        therapistId: excludedDate.therapistId,
        locationId: excludedDate.locationId,
        date: excludedDate.date,
      },
      select: { id: true },
    });

    if (existingDay) {
      throw new Error("Availability already exists for this date");
    }

    const day = await tx.availabilityDay.create({
      data: {
        availabilityPeriodId: excludedDate.availabilityPeriodId,
        therapistId: excludedDate.therapistId,
        locationId: excludedDate.locationId,
        date: excludedDate.date,
        isAvailable: true,
        sessionDurationMinutes: excludedDate.sessionDurationMinutes,
        notes: excludedDate.notes,
      },
    });

    if (excludedDate.timeRanges.length) {
      await tx.availabilityTimeRange.createMany({
        data: excludedDate.timeRanges.map((range) => ({
          availabilityDayId: day.id,
          startTime: range.startTime,
          endTime: range.endTime,
          isActive: range.isActive,
        })),
      });
    }

    await tx.availabilityExcludedDate.delete({
      where: { id },
    });

    return tx.availabilityDay.findUnique({
      where: { id: day.id },
      include: {
        timeRanges: {
          orderBy: { startTime: "asc" },
        },
      },
    });
  });
}

export async function getAvailabilityDayOwnership(id: string) {
  return prisma.availabilityDay.findUnique({
    where: { id },
    select: {
      id: true,
      therapistId: true,
    },
  });
}

export async function updateAvailabilityDay(
  id: string,
  input: {
    isAvailable: boolean;
    sessionDurationMinutes: number;
    notes?: string;
    timeRanges: AvailabilityTimeRangeInput[];
  },
) {
  validateUniqueTimeRanges(input.timeRanges, "time ranges");

  return prisma.$transaction(async (tx) => {
    const day = await tx.availabilityDay.update({
      where: { id },
      data: {
        isAvailable: input.isAvailable,
        sessionDurationMinutes: input.sessionDurationMinutes,
        notes: input.notes,
      },
    });

    await tx.availabilityTimeRange.deleteMany({
      where: { availabilityDayId: id },
    });

    if (input.isAvailable && input.timeRanges.length) {
      await tx.availabilityTimeRange.createMany({
        data: input.timeRanges.map((range) => ({
          availabilityDayId: id,
          startTime: range.startTime,
          endTime: range.endTime,
          isActive: range.isActive ?? true,
        })),
      });
    }

    return tx.availabilityDay.findUnique({
      where: { id: day.id },
      include: {
        timeRanges: {
          orderBy: { startTime: "asc" },
        },
      },
    });
  });
}

export async function getAvailabilityMonthSummary({
  therapistId,
  locationId,
  month,
}: {
  therapistId: string;
  locationId: string;
  month: string;
}) {
  const { start, end } = getMonthBounds(month);
  const timezone = await getLocationTimezone(locationId);
  const days = await prisma.availabilityDay.findMany({
    where: {
      therapistId,
      locationId,
      date: {
        gte: start,
        lte: end,
      },
    },
    include: {
      timeRanges: {
        where: { isActive: true },
        orderBy: { startTime: "asc" },
      },
    },
    orderBy: { date: "asc" },
  });

  const summaryDays = [];

  for (const day of days) {
    const date = formatDateOnly(day.date);
    const bookedTimes = await getBookedTimesForDay(therapistId, locationId, date, timezone);
    const generatedSlots = day.isAvailable
      ? generateSlotTimes(day.timeRanges, day.sessionDurationMinutes)
      : [];
    const remainingSlots = generatedSlots.filter((slot) => !bookedTimes.has(slot));

    summaryDays.push({
      id: day.id,
      date,
      isAvailable: day.isAvailable,
      sessionDurationMinutes: day.sessionDurationMinutes,
      totalSlots: generatedSlots.length,
      bookedSlots: generatedSlots.length - remainingSlots.length,
      remainingSlots: remainingSlots.length,
      hasAvailability: remainingSlots.length > 0,
      timeRanges: day.timeRanges,
    });
  }

  return {
    month,
    totalDays: summaryDays.length,
    availableDays: summaryDays.filter((day) => day.hasAvailability).length,
    totalRemainingSlots: summaryDays.reduce((sum, day) => sum + day.remainingSlots, 0),
    days: summaryDays,
  };
}

export async function getAvailabilityDaySlots({
  therapistId,
  locationId,
  date,
}: {
  therapistId: string;
  locationId: string;
  date: string;
}) {
  const timezone = await getLocationTimezone(locationId);
  const day = await prisma.availabilityDay.findFirst({
    where: {
      therapistId,
      locationId,
      date: parseDateOnly(date),
    },
    include: {
      timeRanges: {
        where: { isActive: true },
        orderBy: { startTime: "asc" },
      },
    },
  });

  if (!day || !day.isAvailable) {
    return {
      date,
      sessionDurationMinutes: 0,
      slots: [],
    };
  }

  const bookedTimes = await getBookedTimesForDay(therapistId, locationId, date, timezone);
  const generatedSlots = generateSlotTimes(day.timeRanges, day.sessionDurationMinutes);

  return {
    date,
    sessionDurationMinutes: day.sessionDurationMinutes,
    slots: generatedSlots.map((slot) => ({
      value: slot,
      isAvailable: !bookedTimes.has(slot),
    })),
  };
}

export async function isAvailabilitySlotBookable({
  therapistId,
  locationId,
  date,
  time,
}: {
  therapistId: string;
  locationId: string;
  date: string;
  time: string;
}) {
  const timezone = await getLocationTimezone(locationId);
  const slots = await getAvailabilityDaySlots({
    therapistId,
    locationId,
    date,
  });

  const matched = slots.slots.find((slot) => slot.value === time);
  if (!matched?.isAvailable) {
    return {
      isAvailable: false,
      reason: "slot_unavailable",
      sessionDurationMinutes: slots.sessionDurationMinutes,
    };
  }

  const bookingSchedule = combineDateAndTimeToUtc(parseDateOnly(date), time, timezone);
  const existingBooking = await prisma.booking.findFirst({
    where: {
      therapistId,
      bookingSchedule,
      status: {
        not: BookingStatus.Cancelled,
      },
    },
  });

  return {
    isAvailable: !existingBooking,
    bookingSchedule,
    existingBooking,
    reason: existingBooking ? "booking_conflict" : null,
    sessionDurationMinutes: slots.sessionDurationMinutes,
  };
}
