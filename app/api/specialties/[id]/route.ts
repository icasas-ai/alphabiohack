import { NextRequest } from "next/server";
import {
  deleteSpecialty,
  getSpecialtyByName,
  getSpecialtyById,
  getSpecialtyStats,
  updateSpecialty,
} from "@/services";
import {
  jsonError,
  jsonSuccess,
  requireAuthorizedUser,
} from "@/lib/api/route-helpers";
import { canManageCatalog } from "@/lib/auth/authorization";

// GET /api/specialties/[id] - Obtener especialidad por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get("includeStats");

    const specialty = await getSpecialtyById(id);

    if (!specialty) {
      return jsonError("Specialty not found", 404);
    }

    if (includeStats === "true") {
      const stats = await getSpecialtyStats(id);
      return jsonSuccess(specialty, {
        meta: {
          stats,
        },
      });
    }

    return jsonSuccess(specialty);
  } catch (error) {
    console.error("Error getting specialty:", error);
    return jsonError("Error getting specialty", 500);
  }
}

// PUT /api/specialties/[id] - Actualizar especialidad
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireAuthorizedUser(canManageCatalog);
    if ("response" in currentUser) {
      return currentUser.response;
    }

    const { id } = await params;
    const body = await request.json();

    // Verificar que la especialidad existe
    const existingSpecialty = await getSpecialtyById(id);
    if (!existingSpecialty) {
      return jsonError("Specialty not found", 404);
    }

    if (body.name) {
      const duplicate = await getSpecialtyByName(body.name, existingSpecialty.companyId);
      if (duplicate && duplicate.id !== id) {
        return jsonError("Specialty already exists", 409);
      }
    }

    const updatedSpecialty = await updateSpecialty(id, body);
    return jsonSuccess(updatedSpecialty);
  } catch (error) {
    console.error("Error updating specialty:", error);
    return jsonError("Error updating specialty", 500);
  }
}

// DELETE /api/specialties/[id] - Eliminar especialidad
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireAuthorizedUser(canManageCatalog);
    if ("response" in currentUser) {
      return currentUser.response;
    }

    const { id } = await params;

    // Verificar que la especialidad existe
    const existingSpecialty = await getSpecialtyById(id);
    if (!existingSpecialty) {
      return jsonError("Specialty not found", 404);
    }

    await deleteSpecialty(id);
    return jsonSuccess({ id }, { successCode: "specialties.delete.success" });
  } catch (error) {
    console.error("Error deleting specialty:", error);
    return jsonError("Error deleting specialty", 500);
  }
}
