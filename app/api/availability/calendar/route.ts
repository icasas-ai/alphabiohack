import { NextRequest, NextResponse } from "next/server";

import { getAvailabilityDaySlots, getAvailabilityMonthSummary } from "@/services";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const therapistId = searchParams.get("therapistId");
    const locationId = searchParams.get("locationId");
    const month = searchParams.get("month");
    const date = searchParams.get("date");

    if (!therapistId || !locationId) {
      return NextResponse.json(
        { success: false, error: "therapistId and locationId are required" },
        { status: 400 },
      );
    }

    if (date) {
      const slots = await getAvailabilityDaySlots({
        therapistId,
        locationId,
        date,
      });

      return NextResponse.json({
        success: true,
        data: slots,
      });
    }

    if (!month) {
      return NextResponse.json(
        { success: false, error: "month or date is required" },
        { status: 400 },
      );
    }

    const summary = await getAvailabilityMonthSummary({
      therapistId,
      locationId,
      month,
    });

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Error loading availability calendar:", error);
    return NextResponse.json(
      { success: false, error: "Error loading availability calendar" },
      { status: 500 },
    );
  }
}
