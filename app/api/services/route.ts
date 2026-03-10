import { NextRequest, NextResponse } from "next/server";
import {
  createMultipleServices,
  createService,
  getAllServices,
  getCheapestServices,
  getPrimaryCompanyIdForUser,
  resolveScopedCompanyId,
  getMostExpensiveServices,
  getMostPopularServices,
  getServicesByDuration,
  getServicesByDurationRange,
  getServicesByPriceRange,
  getServicesBySpecialty,
  searchServicesByDescription,
  serviceExists,
} from "@/services";
import { getCurrentUser } from "@/lib/auth/session";

// GET /api/services - Obtener servicios
export async function GET(request: NextRequest) {
  try {
    const { prismaUser } = await getCurrentUser();
    const companyId = await resolveScopedCompanyId(prismaUser?.id);
    const { searchParams } = new URL(request.url);
    const specialtyId = searchParams.get("specialtyId");
    const search = searchParams.get("search");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const duration = searchParams.get("duration");
    const minDuration = searchParams.get("minDuration");
    const maxDuration = searchParams.get("maxDuration");
    const popular = searchParams.get("popular");
    const expensive = searchParams.get("expensive");
    const cheapest = searchParams.get("cheapest");
    const limit = searchParams.get("limit");

    let services;

    if (specialtyId) {
      services = await getServicesBySpecialty(specialtyId, companyId || undefined);
    } else if (search) {
      services = await searchServicesByDescription(search, companyId || undefined);
    } else if (minPrice && maxPrice) {
      services = await getServicesByPriceRange(
        parseFloat(minPrice),
        parseFloat(maxPrice),
        companyId || undefined,
      );
    } else if (duration) {
      services = await getServicesByDuration(parseInt(duration), companyId || undefined);
    } else if (minDuration && maxDuration) {
      services = await getServicesByDurationRange(
        parseInt(minDuration),
        parseInt(maxDuration),
        companyId || undefined,
      );
    } else if (popular === "true") {
      const limitNum = limit ? parseInt(limit) : 10;
      services = await getMostPopularServices(limitNum, companyId || undefined);
    } else if (expensive === "true") {
      const limitNum = limit ? parseInt(limit) : 10;
      services = await getMostExpensiveServices(limitNum, companyId || undefined);
    } else if (cheapest === "true") {
      const limitNum = limit ? parseInt(limit) : 10;
      services = await getCheapestServices(limitNum, companyId || undefined);
    } else {
      services = await getAllServices(companyId || undefined);
    }

    return NextResponse.json({ success: true, data: services });
  } catch (error) {
    console.error("Error getting services:", error);
    return NextResponse.json(
      { success: false, error: "Error getting services" },
      { status: 500 }
    );
  }
}

// POST /api/services - Crear servicio
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
    if (
      !body.description ||
      !body.cost ||
      !body.duration ||
      !body.specialtyId
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Si es un array, crear múltiples servicios
    if (Array.isArray(body)) {
      const services = await createMultipleServices(body, companyId);
      return NextResponse.json(
        { success: true, data: services },
        { status: 201 }
      );
    }

    // Verificar si el servicio ya existe
    const exists = await serviceExists(body.description, body.specialtyId, companyId);
    if (exists) {
      return NextResponse.json(
        { success: false, error: "Service already exists for this specialty" },
        { status: 409 }
      );
    }

    const service = await createService(body, companyId);
    return NextResponse.json({ success: true, data: service }, { status: 201 });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      { success: false, error: "Error creating service" },
      { status: 500 }
    );
  }
}
