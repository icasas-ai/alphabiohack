import { NextRequest } from "next/server";
import {
  createSpecialty,
  getAllSpecialties,
  getPopularSpecialties,
  getPrimaryCompanyIdForUser,
  resolveScopedCompanyId,
  getSpecialtiesWithServices,
  getSpecialtyByName,
  searchSpecialtiesByName,
  specialtyExists,
} from "@/services";
import {
  jsonError,
  jsonSuccess,
  requireAuthorizedUser,
} from "@/lib/api/route-helpers";
import { canManageCatalog } from "@/lib/auth/authorization";
import { getCurrentUser } from "@/lib/auth/session";

// GET /api/specialties - Obtener especialidades
export async function GET(request: NextRequest) {
  try {
    const { prismaUser } = await getCurrentUser();
    const companyId = await resolveScopedCompanyId(prismaUser?.id);
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");
    const search = searchParams.get("search");
    const withServices = searchParams.get("withServices");
    const popular = searchParams.get("popular");
    const limit = searchParams.get("limit");

    let specialties;

    if (name) {
      const specialty = await getSpecialtyByName(name, companyId || undefined);
      specialties = specialty ? [specialty] : [];
    } else if (search) {
      specialties = await searchSpecialtiesByName(search, companyId || undefined);
    } else if (withServices === "true") {
      specialties = await getSpecialtiesWithServices(companyId || undefined);
    } else if (popular === "true") {
      const limitNum = limit ? parseInt(limit) : 10;
      specialties = await getPopularSpecialties(limitNum, companyId || undefined);
    } else {
      specialties = await getAllSpecialties(companyId || undefined);
    }

    return jsonSuccess(specialties);
  } catch (error) {
    console.error("Error getting specialties:", error);
    return jsonError("Error getting specialties", 500);
  }
}

// POST /api/specialties - Crear especialidad
export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireAuthorizedUser(canManageCatalog);
    if ("response" in currentUser) {
      return currentUser.response;
    }

    const companyId = await getPrimaryCompanyIdForUser(currentUser.prismaUser.id);
    if (!companyId) {
      return jsonError("No company context found for this user.", 409);
    }

    const body = await request.json();

    // Validaciones básicas
    if (!body.name) {
      return jsonError("Name is required", 400);
    }

    // Verificar si la especialidad ya existe
    const exists = await specialtyExists(body.name, companyId);
    if (exists) {
      return jsonError("Specialty already exists", 409);
    }

    const specialty = await createSpecialty(body, companyId);
    return jsonSuccess(specialty, { status: 201 });
  } catch (error) {
    console.error("Error creating specialty:", error);
    return jsonError("Error creating specialty", 500);
  }
}
