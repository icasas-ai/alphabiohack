import { NextRequest, NextResponse } from "next/server";

import { updateAvailabilityDay } from "@/services";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
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
