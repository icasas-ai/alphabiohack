import { NextResponse } from "next/server";

import {
  deleteAvailabilityPeriod,
  getAvailabilityExcludedDateOwnership,
  getAvailabilityPeriodOwnership,
  restoreAvailabilityExcludedDate,
} from "@/services";
import { canAccessAvailability, canManageTherapistData } from "@/lib/auth/authorization";
import { getCurrentUser } from "@/lib/auth/session";

export async function DELETE(
  _request: Request,
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
    const period = await getAvailabilityPeriodOwnership(id);
    if (!period) {
      return NextResponse.json(
        { success: false, error: "Availability period not found" },
        { status: 404 },
      );
    }

    if (!canManageTherapistData(prismaUser, period.therapistId)) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    await deleteAvailabilityPeriod(id);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error deleting availability period:", error);
    return NextResponse.json(
      { success: false, error: "Error deleting availability period" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
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
    const body = await request.json();

    if (body?.action !== "restore-excluded-date" || !body?.excludedDateId) {
      return NextResponse.json(
        { success: false, error: "Unsupported action" },
        { status: 400 },
      );
    }

    const excludedDate = await getAvailabilityExcludedDateOwnership(body.excludedDateId);
    if (!excludedDate) {
      return NextResponse.json(
        { success: false, error: "Excluded date not found" },
        { status: 404 },
      );
    }

    if (excludedDate.availabilityPeriodId !== id) {
      return NextResponse.json(
        { success: false, error: "Excluded date does not belong to this period" },
        { status: 400 },
      );
    }

    if (!canManageTherapistData(prismaUser, excludedDate.therapistId)) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const day = await restoreAvailabilityExcludedDate(body.excludedDateId);

    return NextResponse.json({
      success: true,
      data: day,
    });
  } catch (error) {
    console.error("Error restoring excluded date:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error restoring excluded date",
      },
      { status: 400 },
    );
  }
}
