import { PST_TZ, dateKeyInTZ } from "@/lib/utils/timezone";

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { resolveManagedTherapistIdForUser } from "@/services";

function toPSTRange(date: Date) {
  // Construir inicio/fin de día en PST y convertir a UTC para comparar con DB
  const localeDate = new Date(date);
  const y = localeDate.getUTCFullYear();
  const m = localeDate.getUTCMonth();
  const d = localeDate.getUTCDate();
  const startPST = new Date(Date.UTC(y, m, d, 8, 0, 0, 0)); // 00:00 PST = 08:00 UTC
  const endPST = new Date(Date.UTC(y, m, d, 8 + 23, 59, 59, 999));
  return { start: startPST, end: endPST };
}

function monthRangePST(date: Date) {
  // Primer y último día del mes en PST
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();
  const first = new Date(Date.UTC(y, m, 1));
  const last = new Date(Date.UTC(y, m + 1, 0));
  const start = toPSTRange(first).start;
  const end = toPSTRange(last).end;
  return { start, end };
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const { prismaUser } = await getCurrentUser();
    const therapistId =
      url.searchParams.get("therapistId") ||
      (await resolveManagedTherapistIdForUser(prismaUser)) ||
      "";

    if (!therapistId) {
      return NextResponse.json(
        { success: false, error: "Missing therapistId" },
        { status: 400 }
      );
    }

    // Rango opcional from/to (ISO), con normalización PST → rangos UTC
    const fromParam = url.searchParams.get("from");
    const toParam = url.searchParams.get("to");
    const todayRange = toPSTRange(new Date());
    const rangeStart =
      fromParam ? toPSTRange(new Date(fromParam)).start : undefined;
    const rangeEnd = toParam ? toPSTRange(new Date(toParam)).end : undefined;

    const [appointmentsToday, bookingsAll, recentPatientsAgg] =
      await Promise.all([
        prisma.booking.findMany({
          where: {
            therapistId,
            bookingSchedule: { gte: todayRange.start, lte: todayRange.end },
          },
          include: { service: true, location: true, patient: true },
          orderBy: { bookingSchedule: "asc" },
        }),
        prisma.booking.findMany({
          where: {
            therapistId,
            ...(rangeStart && rangeEnd ?
              { bookingSchedule: { gte: rangeStart, lte: rangeEnd } }
            : {}),
          },
          include: { service: true, location: true, patient: true },
          orderBy: { bookingSchedule: "asc" },
          take: 50,
        }),
        prisma.booking.groupBy({
          by: ["email"],
          where: { therapistId },
          _max: { bookingSchedule: true },
          orderBy: { _max: { bookingSchedule: "desc" } },
          take: 6,
        }),
      ]);

    const totalPatientsByEmail = await prisma.booking.groupBy({
      by: ["email"],
      where: { therapistId },
      _count: { email: true },
    });

    const kpis = {
      totalPatients: totalPatientsByEmail.length,
      patientsToday: Array.from(
        new Set(appointmentsToday.map((b) => b.email.toLowerCase()))
      ).length,
      appointmentsToday: appointmentsToday.length,
      hoursToday:
        appointmentsToday.reduce(
          (sum, b) => sum + (b.service?.duration || 0),
          0
        ) / 60,
    };

    const appointments = bookingsAll.slice(0, 10).map((b) => ({
      id: b.id,
      date: dateKeyInTZ(b.bookingSchedule as unknown as Date, PST_TZ),
      time: new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: PST_TZ,
      }).format(b.bookingSchedule as unknown as Date),
      name:
        b.patient?.firstname ?
          `${b.patient.firstname} ${b.patient.lastname ?? ""}`.trim()
        : `${b.firstname} ${b.lastname}`.trim(),
      service: b.service?.description,
      location: b.location?.title,
      status: b.status,
    }));

    const upcoming = appointments[0] || null;

    // Weekly overview (last 7 days or provided range)
    const defaultStart = toPSTRange(
      new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
    ).start;
    const defaultEnd = toPSTRange(new Date()).end;
    const ws = {
      start: rangeStart || defaultStart,
      end: rangeEnd || defaultEnd,
    };

    const weeklyBookings = await prisma.booking.findMany({
      where: {
        therapistId,
        bookingSchedule: { gte: ws.start, lte: ws.end },
      },
      select: { bookingSchedule: true, status: true },
    });

    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles",
      weekday: "short",
    });
    const order: string[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const counts: Record<string, number> = Object.fromEntries(
      order.map((d) => [d, 0])
    );
    for (const b of weeklyBookings) {
      const key = formatter.format(b.bookingSchedule as unknown as Date);
      if (counts[key] !== undefined) counts[key] += 1;
    }
    // Build daily series for selected range
    const bookingsInRange = weeklyBookings;
    const dayFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles",
      month: "2-digit",
      day: "2-digit",
    });
    const countsByLabel: Record<string, number> = {};
    const pendingByLabel: Record<string, number> = {};
    const completedByLabel: Record<string, number> = {};
    for (const b of bookingsInRange) {
      const label = dayFormatter.format(b.bookingSchedule as unknown as Date);
      countsByLabel[label] = (countsByLabel[label] || 0) + 1;
      const status = (b.status || "").toLowerCase();
      if (status === "pending")
        pendingByLabel[label] = (pendingByLabel[label] || 0) + 1;
      if (status === "completed")
        completedByLabel[label] = (completedByLabel[label] || 0) + 1;
    }
    const daily: Array<{ day: string; value: number }> = [];
    const isoForDay = (d: Date) => dateKeyInTZ(d as unknown as Date, PST_TZ);
    const seriesAppointmentsDaily: Array<{ date: string; value: number }> = [];
    const seriesPendingDaily: Array<{ date: string; value: number }> = [];
    const seriesCompletedDaily: Array<{ date: string; value: number }> = [];
    for (
      let d = new Date(ws.start.getTime());
      d <= ws.end;
      d = new Date(d.getTime() + 24 * 60 * 60 * 1000)
    ) {
      const label = dayFormatter.format(d);
      daily.push({ day: label, value: countsByLabel[label] || 0 });
      const iso = isoForDay(d);
      seriesAppointmentsDaily.push({
        date: iso,
        value: countsByLabel[label] || 0,
      });
      seriesPendingDaily.push({ date: iso, value: pendingByLabel[label] || 0 });
      seriesCompletedDaily.push({
        date: iso,
        value: completedByLabel[label] || 0,
      });
    }
    const weeklyOverview = daily;

    // Status counts in current range
    const statusCounts = weeklyBookings.reduce<Record<string, number>>(
      (acc, b) => {
        const s = b.status || "Unknown";
        acc[s] = (acc[s] || 0) + 1;
        return acc;
      },
      {}
    );

    // KPI: appointments in selected range and delta vs previous equivalent period
    const currentCount = bookingsInRange.length;
    const rangeDurationMs = ws.end.getTime() - ws.start.getTime() + 1;
    const prevEnd = new Date(ws.start.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - rangeDurationMs + 1);
    const prevCount = await prisma.booking.count({
      where: { therapistId, bookingSchedule: { gte: prevStart, lte: prevEnd } },
    });
    const deltaPercent =
      prevCount === 0 ?
        currentCount > 0 ?
          100
        : 0
      : Math.round(((currentCount - prevCount) / prevCount) * 1000) / 10; // one decimal

    // KPI: completed appointments in selected range and delta vs previous equivalent period
    const currentCompleted = await prisma.booking.count({
      where: {
        therapistId,
        bookingSchedule: { gte: ws.start, lte: ws.end },
        status: "Completed",
      },
    });
    const prevCompleted = await prisma.booking.count({
      where: {
        therapistId,
        bookingSchedule: { gte: prevStart, lte: prevEnd },
        status: "Completed",
      },
    });
    const completedDeltaPercent =
      prevCompleted === 0 ?
        currentCompleted > 0 ?
          100
        : 0
      : Math.round(
          ((currentCompleted - prevCompleted) / prevCompleted) * 1000
        ) / 10;

    // Unique patients by email within current range and previous equivalent range
    const currentUniquePatients = (
      await prisma.booking.groupBy({
        by: ["email"],
        where: { therapistId, bookingSchedule: { gte: ws.start, lte: ws.end } },
        _count: { email: true },
      })
    ).length;
    const prevUniquePatients = (
      await prisma.booking.groupBy({
        by: ["email"],
        where: {
          therapistId,
          bookingSchedule: { gte: prevStart, lte: prevEnd },
        },
        _count: { email: true },
      })
    ).length;
    const patientsDeltaPercent =
      prevUniquePatients === 0 ?
        currentUniquePatients > 0 ?
          100
        : 0
      : Math.round(
          ((currentUniquePatients - prevUniquePatients) / prevUniquePatients) *
            1000
        ) / 10;

    const recentPatients = await Promise.all(
      recentPatientsAgg.map(async (g) => {
        const email = g.email as string;
        const user = await prisma.user.findUnique({ where: { email } });
        // Try to get a name either from the user or the latest booking
        let name = "";
        if (user) {
          name = `${user.firstname} ${user.lastname}`.trim();
        } else {
          const lastBooking = await prisma.booking.findFirst({
            where: { therapistId, email },
            orderBy: { bookingSchedule: "desc" },
            select: { firstname: true, lastname: true },
          });
          name =
            `${lastBooking?.firstname ?? ""} ${
              lastBooking?.lastname ?? ""
            }`.trim() || email;
        }
        return {
          id: user ? user.id : email,
          name,
          lastAppointment:
            g._max.bookingSchedule ?
              dateKeyInTZ(g._max.bookingSchedule as unknown as Date, PST_TZ)
            : null,
          code: user ? user.id.slice(0, 6) : email.split("@")[0].slice(0, 6),
        };
      })
    );

    // Totales adicionales y usuarios vs mes anterior
    const totalAllTime = await prisma.booking.count({ where: { therapistId } });
    const now = new Date();
    const currentMonth = monthRangePST(now);
    const previousMonth = monthRangePST(
      new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1))
    );
    const pendingThisMonth = await prisma.booking.count({
      where: {
        therapistId,
        status: "Pending",
        bookingSchedule: { gte: currentMonth.start, lte: currentMonth.end },
      },
    });
    const usersAllTime = (
      await prisma.booking.groupBy({
        by: ["email"],
        where: { therapistId },
        _count: { email: true },
      })
    ).length;
    const usersPrevMonth = (
      await prisma.booking.groupBy({
        by: ["email"],
        where: {
          therapistId,
          bookingSchedule: { gte: previousMonth.start, lte: previousMonth.end },
        },
        _count: { email: true },
      })
    ).length;
    const usersDeltaVsPrevMonth =
      usersPrevMonth === 0 ?
        usersAllTime > 0 ?
          100
        : 0
      : Math.round(((usersAllTime - usersPrevMonth) / usersPrevMonth) * 1000) /
        10;

    return NextResponse.json({
      success: true,
      data: {
        kpis,
        kpisRange: {
          appointments: { value: currentCount, deltaPercent },
          completed: {
            value: currentCompleted,
            deltaPercent: completedDeltaPercent,
          },
          patients: {
            value: currentUniquePatients,
            deltaPercent: patientsDeltaPercent,
          },
          totals: { value: totalAllTime, deltaPercent: 0 },
          pendingThisMonth: { value: pendingThisMonth, deltaPercent: 0 },
          usersTotalVsPrevMonth: {
            value: usersAllTime,
            deltaPercent: usersDeltaVsPrevMonth,
          },
        },
        range: {
          from: ws.start.toISOString(),
          to: ws.end.toISOString(),
        },
        appointments,
        upcoming,
        weeklyOverview,
        series: {
          appointmentsDaily: seriesAppointmentsDaily,
          pendingDaily: seriesPendingDaily,
          completedDaily: seriesCompletedDaily,
        },
        statusCounts,
        recentPatients: recentPatients.filter(Boolean),
        invoices: [],
      },
    });
  } catch (error) {
    console.error("Error fetching therapist dashboard:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
