import { NextRequest, NextResponse } from "next/server";

import { createAvailabilityPeriod, listAvailabilityPeriods } from "@/services";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const therapistId = searchParams.get("therapistId") || undefined;
    const locationId = searchParams.get("locationId") || undefined;
    const month = searchParams.get("month") || undefined;

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
    const body = await request.json();
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
