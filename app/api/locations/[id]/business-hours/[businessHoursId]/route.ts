import { NextRequest, NextResponse } from "next/server";
import { errorResponse, successResponse } from "@/services/api-errors.service";

import type { UpdateBusinessHoursData } from "@/types";
import { prisma } from "@/lib/prisma";

// GET /api/locations/[id]/business-hours/[businessHoursId] - Obtener un horario específico de la ubicación
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; businessHoursId: string }> }
) {
  try {
    const { id: locationId, businessHoursId } = await params;

    const businessHours = await prisma.businessHours.findFirst({
      where: {
        id: businessHoursId,
        locationId,
      },
      include: {
        location: true,
        timeSlots: {
          where: {
            isActive: true,
          },
          orderBy: {
            startTime: "asc",
          },
        },
      },
    });

    if (!businessHours) {
      const { body, status } = errorResponse("not_found", null, 404);
      return NextResponse.json(body, { status });
    }

    return NextResponse.json(successResponse(businessHours));
  } catch (error) {
    console.error("Error fetching business hours:", error);
    const { body, status } = errorResponse("internal_error", null, 500);
    return NextResponse.json(body, { status });
  }
}

// PUT /api/locations/[id]/business-hours/[businessHoursId] - Actualizar un horario específico de la ubicación
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; businessHoursId: string }> }
) {
  try {
    const { id: locationId, businessHoursId } = await params;
    const body: UpdateBusinessHoursData = await request.json();

    const currentBusinessHours = await prisma.businessHours.findFirst({
      where: {
        id: businessHoursId,
        locationId,
      },
      select: {
        id: true,
      },
    });

    if (!currentBusinessHours) {
      const { body: errorBody, status } = errorResponse("not_found", null, 404);
      return NextResponse.json(errorBody, { status });
    }

    const businessHours = await prisma.businessHours.update({
      where: {
        id: businessHoursId,
      },
      data: {
        dayOfWeek: body.dayOfWeek,
        isActive: body.isActive,
      },
      include: {
        location: true,
        timeSlots: {
          where: {
            isActive: true,
          },
          orderBy: {
            startTime: "asc",
          },
        },
      },
    });

    return NextResponse.json(
      successResponse(businessHours, "businessHours.update.success")
    );
  } catch (error) {
    console.error("Error updating business hours:", error);
    const { body, status } = errorResponse("internal_error", null, 500);
    return NextResponse.json(body, { status });
  }
}

// DELETE /api/locations/[id]/business-hours/[businessHoursId] - Eliminar un horario específico de la ubicación
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; businessHoursId: string }> }
) {
  try {
    const { id: locationId, businessHoursId } = await params;

    const currentBusinessHours = await prisma.businessHours.findFirst({
      where: {
        id: businessHoursId,
        locationId,
      },
      select: {
        id: true,
      },
    });

    if (!currentBusinessHours) {
      const { body, status } = errorResponse("not_found", null, 404);
      return NextResponse.json(body, { status });
    }

    await prisma.businessHours.delete({
      where: {
        id: businessHoursId,
      },
    });

    return NextResponse.json(
      successResponse({ id: businessHoursId }, "businessHours.delete.success")
    );
  } catch (error) {
    console.error("Error deleting business hours:", error);
    const { body, status } = errorResponse("internal_error", null, 500);
    return NextResponse.json(body, { status });
  }
}
