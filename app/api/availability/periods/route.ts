import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";

import { createAvailabilityPeriod, listAvailabilityPeriods } from "@/services";
import { canAccessAvailability, canManageTherapistData, hasRole } from "@/lib/auth/authorization";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const requestedTherapistId = searchParams.get("therapistId") || undefined;
    const locationId = searchParams.get("locationId") || undefined;
    const month = searchParams.get("month") || undefined;
    const therapistId = hasRole(prismaUser, UserRole.Admin)
      ? requestedTherapistId
      : prismaUser.id;

    if (
      requestedTherapistId &&
      !canManageTherapistData(prismaUser, requestedTherapistId)
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const periods = await listAvailabilityPeriods({
      therapistId,
      locationId,
      month,
    });

    return NextResponse.json({
      success: true,
      data: periods,
    });
  } catch (error) {
    console.error("Error listing availability periods:", error);
    return NextResponse.json(
      { success: false, error: "Error listing availability periods" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const requestedTherapistId = body.therapistId || prismaUser.id;
    if (!canManageTherapistData(prismaUser, requestedTherapistId)) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    body.therapistId = hasRole(prismaUser, UserRole.Admin)
      ? requestedTherapistId
      : prismaUser.id;
    const period = await createAvailabilityPeriod(body);

    return NextResponse.json(
      { success: true, data: period },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating availability period:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error creating availability period",
      },
      { status: 400 },
    );
  }
}
