import { NextRequest, NextResponse } from "next/server";

import { BookingStatus, UserRole } from "@/lib/prisma-client";
import { getCurrentUser } from "@/lib/auth/session";
import { BOOKING_STATUS_TRANSITIONS } from "@/lib/utils/booking-status";
import { prisma } from "@/lib/prisma";
import { updateBookingStatus } from "@/services";
import { canManageBookingAsOperator } from "@/lib/auth/authorization";
import { isAvailabilitySlotBookable } from "@/services/availability.service";

const TERMINAL_STATUSES = new Set<BookingStatus>([
  BookingStatus.Completed,
  BookingStatus.Cancelled,
  BookingStatus.NoShow,
]);

// PUT /api/bookings/[id]/status - Actualizar estado de una cita
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { prismaUser } = await getCurrentUser();
    if (!prismaUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const nextStatus = body.status as BookingStatus | undefined;

    if (!nextStatus) {
      return NextResponse.json(
        { success: false, error: "status is required" },
        { status: 400 }
      );
    }

    if (!Object.values(BookingStatus).includes(nextStatus)) {
      return NextResponse.json(
        { success: false, error: "Invalid booking status" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        therapistId: true,
        patientId: true,
        locationId: true,
        email: true,
        bookingSchedule: true,
        location: {
          select: {
            timezone: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    const isAdmin = prismaUser.role.includes(UserRole.Admin);
    const isPatientOwner = booking.patientId
      ? prismaUser.id === booking.patientId
      : prismaUser.email.toLowerCase() === booking.email.toLowerCase();

    if (isAdmin || canManageBookingAsOperator(prismaUser, booking.therapistId)) {
      const allowedTransitions =
        BOOKING_STATUS_TRANSITIONS[booking.status as keyof typeof BOOKING_STATUS_TRANSITIONS] || [];
      if (
        booking.status !== nextStatus &&
        !allowedTransitions.includes(nextStatus)
      ) {
        return NextResponse.json(
          {
            success: false,
            error: `Cannot move booking from ${booking.status} to ${nextStatus}`,
          },
          { status: 409 }
        );
      }

      if (booking.status === BookingStatus.Cancelled && nextStatus !== BookingStatus.Cancelled) {
        if (!booking.locationId || !booking.therapistId) {
          return NextResponse.json(
            {
              success: false,
              error: "This appointment is missing scheduling context. Choose a new time before restoring it.",
            },
            { status: 409 }
          );
        }

        const slotCheck = await isAvailabilitySlotBookable({
          therapistId: booking.therapistId,
          locationId: booking.locationId,
          bookingSchedule: booking.bookingSchedule,
        });

        if (!slotCheck.isAvailable) {
          return NextResponse.json(
            {
              success: false,
              error: "This slot is no longer available. Choose a new time before restoring the appointment.",
            },
            { status: 409 }
          );
        }
      }
    } else if (isPatientOwner) {
      if (
        nextStatus !== BookingStatus.Cancelled ||
        TERMINAL_STATUSES.has(booking.status)
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "You can only cancel an active appointment.",
          },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const updatedBooking = await updateBookingStatus(id, nextStatus);
    return NextResponse.json({ success: true, data: updatedBooking });
  } catch (error) {
    console.error("Error updating booking status:", error);
    return NextResponse.json(
      { success: false, error: "Error updating booking status" },
      { status: 500 }
    );
  }
}
