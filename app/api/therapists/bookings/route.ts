import { NextResponse } from "next/server";
import { getBookingsByTherapist } from "@/services/booking.service";
import { getCurrentUser } from "@/lib/auth/session";
import {
  canOperateAppointments,
} from "@/lib/auth/authorization";
import { resolveManagedTherapistIdForUser } from "@/services";

export async function GET() {
  try {
    const { prismaUser } = await getCurrentUser();
    if (!prismaUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!canOperateAppointments(prismaUser)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const therapistId = await resolveManagedTherapistIdForUser(prismaUser);
    if (!therapistId) {
      return NextResponse.json(
        { error: "No therapist is configured for this operator" },
        { status: 409 }
      );
    }

    const bookings = await getBookingsByTherapist(therapistId);

    return NextResponse.json({
      bookings,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
