import { NextRequest, NextResponse } from "next/server";
import {
  createLocation,
  findNearbyLocations,
  getAllLocations,
  getPrimaryCompanyIdForUser,
  resolveScopedCompanyId,
  searchLocationsByAddress,
  searchLocationsByTitle,
} from "@/services";
import { errorResponse, successResponse } from "@/services/api-errors.service";
import { getCurrentUser } from "@/lib/auth/session";

// GET /api/locations - Obtener todas las ubicaciones
export async function GET(request: NextRequest) {
  try {
    const { prismaUser } = await getCurrentUser();
    const companyId = await resolveScopedCompanyId(prismaUser?.id);
    const { searchParams } = new URL(request.url);
    const title = searchParams.get("title");
    const address = searchParams.get("address");
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    const radius = searchParams.get("radius");

    let locations;

    if (title) {
      locations = await searchLocationsByTitle(title, companyId || undefined);
    } else if (address) {
      locations = await searchLocationsByAddress(address, companyId || undefined);
    } else if (lat && lon) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);
      const radiusKm = radius ? parseFloat(radius) : 10;

      if (isNaN(latitude) || isNaN(longitude)) {
        const { body, status } = errorResponse(
          "validation.invalidCoordinates",
          null,
          400
        );
        return NextResponse.json(body, { status });
      }

      locations = await findNearbyLocations(
        latitude,
        longitude,
        radiusKm,
        companyId || undefined,
      );
    } else {
      locations = await getAllLocations(companyId || undefined);
    }

    return NextResponse.json(successResponse(locations));
  } catch (error) {
    console.error("Error getting locations:", error);
    const { body, status } = errorResponse("internal_error", null, 500);
    return NextResponse.json(body, { status });
  }
}

// POST /api/locations - Crear ubicación
export async function POST(request: NextRequest) {
  try {
    const { prismaUser } = await getCurrentUser();
    const companyId = await getPrimaryCompanyIdForUser(prismaUser?.id || "");
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: "No company context found for this user." },
        { status: 409 }
      );
    }

    const body = await request.json();

    // Validaciones básicas
    if (!body.address || !body.title) {
      const { body: err, status } = errorResponse(
        "validation.required",
        null,
        400
      );
      return NextResponse.json(err, { status });
    }

    const location = await createLocation(body, companyId);
    return NextResponse.json(
      successResponse(location, "locations.create.success"),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating location:", error);
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
