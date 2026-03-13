import { NextRequest, NextResponse } from "next/server";
import {
  deleteLocation,
  getLocationBookings,
  getLocationById,
  updateLocation,
} from "@/services";
import { errorResponse, successResponse } from "@/services/api-errors.service";
import { canManageLocations } from "@/lib/auth/authorization";
import { getCurrentUser } from "@/lib/auth/session";
import { normalizeWhitespace } from "@/lib/validation/form-fields";

interface LocationResponseData {
  location: unknown;
  bookings?: unknown[];
}

// GET /api/locations/[id] - Obtener ubicación por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const includeBookings = searchParams.get("includeBookings");

    const location = await getLocationById(id);

    if (!location) {
      const { body, status } = errorResponse("not_found", null, 404);
      return NextResponse.json(body, { status });
    }

    let responseData: LocationResponseData = { location };

    // Si se solicitan las citas
    if (includeBookings === "true") {
      const { prismaUser } = await getCurrentUser();
      if (!canManageLocations(prismaUser)) {
        return NextResponse.json(
          { success: false, error: "Forbidden" },
          { status: 403 }
        );
      }

      const bookings = await getLocationBookings(id);
      responseData = {
        ...responseData,
        bookings,
      };
    }

    return NextResponse.json(successResponse(responseData));
  } catch (error) {
    console.error("Error getting location:", error);
    const { body, status } = errorResponse("internal_error", null, 500);
    return NextResponse.json(body, { status });
  }
}

// PUT /api/locations/[id] - Actualizar ubicación
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { prismaUser } = await getCurrentUser();
    if (!canManageLocations(prismaUser)) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const normalizedTitle =
      body.title !== undefined ? normalizeWhitespace(body.title) : undefined;
    const normalizedAddress =
      body.address !== undefined ? normalizeWhitespace(body.address) : undefined;

    // Verificar que la ubicación existe
    const existingLocation = await getLocationById(id);
    if (!existingLocation) {
      const { body, status } = errorResponse("not_found", null, 404);
      return NextResponse.json(body, { status });
    }

    if (body.title !== undefined && !normalizedTitle) {
      return NextResponse.json(
        { success: false, error: "Location title is required." },
        { status: 400 }
      );
    }

    if (body.address !== undefined && !normalizedAddress) {
      return NextResponse.json(
        { success: false, error: "Location address is required." },
        { status: 400 }
      );
    }

    const updatedLocation = await updateLocation(id, {
      ...body,
      ...(normalizedTitle !== undefined ? { title: normalizedTitle } : {}),
      ...(normalizedAddress !== undefined ? { address: normalizedAddress } : {}),
      ...(typeof body.description === "string" ? { description: body.description.trim() } : {}),
    });
    return NextResponse.json(
      successResponse(updatedLocation, "locations.update.success")
    );
  } catch (error) {
    console.error("Error updating location:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    const { body, status } = errorResponse("internal_error", null, 500);
    return NextResponse.json(body, { status });
  }
}

// DELETE /api/locations/[id] - Eliminar ubicación
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { prismaUser } = await getCurrentUser();
    if (!canManageLocations(prismaUser)) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Verificar que la ubicación existe
    const existingLocation = await getLocationById(id);
    if (!existingLocation) {
      const { body, status } = errorResponse("not_found", null, 404);
      return NextResponse.json(body, { status });
    }

    // Permitir eliminación aunque existan reservas: el servicio hace borrado en cascada manual

    await deleteLocation(id);
    return NextResponse.json(
      successResponse({ id }, "locations.delete.success")
    );
  } catch (error) {
    console.error("Error deleting location:", error);
    const { body, status } = errorResponse("internal_error", null, 500);
    return NextResponse.json(body, { status });
  }
}
