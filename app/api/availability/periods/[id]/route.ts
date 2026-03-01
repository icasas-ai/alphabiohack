import { NextResponse } from "next/server";

import { deleteAvailabilityPeriod, restoreAvailabilityExcludedDate } from "@/services";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
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
    const { id } = await params;
    const body = await request.json();

    if (body?.action !== "restore-excluded-date" || !body?.excludedDateId) {
      return NextResponse.json(
        { success: false, error: "Unsupported action" },
        { status: 400 },
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
