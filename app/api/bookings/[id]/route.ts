import { NextRequest, NextResponse } from "next/server";
import {
  checkTimeSlotAvailability,
  deleteBooking,
  getBookingById,
  updateBooking,
} from "@/services";
import { UserRole } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/session";
import { canManageBookingAsOperator } from "@/lib/auth/authorization";

async function canAccessBooking(bookingId: string) {
  const { prismaUser } = await getCurrentUser();
  if (!prismaUser) {
    return { prismaUser: null, booking: null, allowed: false, status: 401 };
  }

  const booking = await getBookingById(bookingId);
  if (!booking) {
    return { prismaUser, booking: null, allowed: false, status: 404 as const };
  }

  const isAdmin = prismaUser.role.includes(UserRole.Admin);
  const isOperatorOwner = canManageBookingAsOperator(
    prismaUser,
    booking.therapistId
  );
  const isPatientOwner = prismaUser.email.toLowerCase() === booking.email.toLowerCase();

  return {
    prismaUser,
    booking,
    allowed: isAdmin || isOperatorOwner || isPatientOwner,
    status: isAdmin || isOperatorOwner || isPatientOwner ? 200 : 403,
  };
}

// GET /api/bookings/[id] - Obtener cita por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const access = await canAccessBooking(id);

    if (!access.allowed) {
      return NextResponse.json(
        {
          success: false,
          error:
            access.status === 401
              ? "Unauthorized"
              : access.status === 404
                ? "Booking not found"
                : "Forbidden",
        },
        { status: access.status }
      );
    }

    return NextResponse.json({ success: true, data: access.booking });
  } catch (error) {
    console.error("Error getting booking:", error);
    return NextResponse.json(
      { success: false, error: "Error getting booking" },
      { status: 500 }
    );
  }
}

// PUT /api/bookings/[id] - Actualizar cita
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const access = await canAccessBooking(id);
    if (!access.allowed || !access.booking) {
      return NextResponse.json(
        {
          success: false,
          error:
            access.status === 401
              ? "Unauthorized"
              : access.status === 404
                ? "Booking not found"
                : "Forbidden",
        },
        { status: access.status }
      );
    }

    const existingBooking = access.booking;

    // Si se está cambiando el terapeuta o el horario, verificar disponibilidad
    if (body.therapistId || body.bookingSchedule) {
      const therapistId = body.therapistId || existingBooking.therapistId;
      const bookingSchedule =
        body.bookingSchedule || existingBooking.bookingSchedule;

      if (therapistId) {
        const availability = await checkTimeSlotAvailability(
          therapistId,
          new Date(bookingSchedule)
        );

        if (
          !availability.isAvailable &&
          availability.existingBooking?.id !== id
        ) {
          return NextResponse.json(
            { success: false, error: "Time slot not available" },
            { status: 409 }
          );
        }
      }
    }

    const updatedBooking = await updateBooking(id, body);
    return NextResponse.json({ success: true, data: updatedBooking });
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { success: false, error: "Error updating booking" },
      { status: 500 }
    );
  }
}

// DELETE /api/bookings/[id] - Eliminar cita
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const access = await canAccessBooking(id);
    if (!access.allowed) {
      return NextResponse.json(
        {
          success: false,
          error:
            access.status === 401
              ? "Unauthorized"
              : access.status === 404
                ? "Booking not found"
                : "Forbidden",
        },
        { status: access.status }
      );
    }

    await deleteBooking(id);
    return NextResponse.json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json(
      { success: false, error: "Error deleting booking" },
      { status: 500 }
    );
  }
}
