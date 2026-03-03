import { NextRequest, NextResponse } from "next/server";
import {
  deleteLocation,
  getLocationBookings,
  getLocationBusinessHours,
  getLocationById,
  updateLocation,
} from "@/services";
import { errorResponse, successResponse } from "@/services/api-errors.service";

interface LocationResponseData {
  location: unknown;
  businessHours?: unknown[];
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
    const includeBusinessHours = searchParams.get("includeBusinessHours");
    const includeBookings = searchParams.get("includeBookings");

    const location = await getLocationById(id);

    if (!location) {
      const { body, status } = errorResponse("not_found", null, 404);
      return NextResponse.json(body, { status });
    }

    let responseData: LocationResponseData = { location };

    // Si se solicitan los horarios de atención
    if (includeBusinessHours === "true") {
      const businessHours = await getLocationBusinessHours(id);
      responseData = {
        ...responseData,
        businessHours,
      };
    }

    // Si se solicitan las citas
    if (includeBookings === "true") {
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
    const { id } = await params;
    const body = await request.json();

    // Verificar que la ubicación existe
    const existingLocation = await getLocationById(id);
    if (!existingLocation) {
      const { body, status } = errorResponse("not_found", null, 404);
      return NextResponse.json(body, { status });
    }

    const updatedLocation = await updateLocation(id, body);
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
