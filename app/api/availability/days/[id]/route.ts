import { NextRequest, NextResponse } from "next/server";

import { getAvailabilityDayOwnership, updateAvailabilityDay } from "@/services";
import { canAccessAvailability, canManageTherapistData } from "@/lib/auth/authorization";
import { getCurrentUser } from "@/lib/auth/session";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { prismaUser } = await getCurrentUser();
    if (!prismaUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    if (!canAccessAvailability(prismaUser)) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const targetDay = await getAvailabilityDayOwnership(id);
    if (!targetDay) {
      return NextResponse.json(
        { success: false, error: "Availability day not found" },
        { status: 404 },
      );
    }

    if (!canManageTherapistData(prismaUser, targetDay.therapistId)) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const day = await updateAvailabilityDay(id, body);

    return NextResponse.json({
      success: true,
      data: day,
    });
  } catch (error) {
    console.error("Error updating availability day:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error updating availability day",
      },
      { status: 400 },
    );
  }
}
