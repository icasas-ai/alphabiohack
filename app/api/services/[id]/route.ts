import { NextRequest } from "next/server";
import {
  deleteService,
  getServiceById,
  getServiceStatsBySpecialty,
  updateService,
} from "@/services";
import {
  jsonError,
  jsonSuccess,
  requireAuthorizedUser,
} from "@/lib/api/route-helpers";
import { canManageCatalog } from "@/lib/auth/authorization";

// GET /api/services/[id] - Obtener servicio por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get("includeStats");

    const service = await getServiceById(id);

    if (!service) {
      return jsonError("Service not found", 404);
    }

    if (includeStats === "true") {
      const stats = await getServiceStatsBySpecialty(service.specialtyId);
      return jsonSuccess(service, {
        meta: {
          stats,
        },
      });
    }

    return jsonSuccess(service);
  } catch (error) {
    console.error("Error getting service:", error);
    return jsonError("Error getting service", 500);
  }
}

// PUT /api/services/[id] - Actualizar servicio
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

    // Verificar que el servicio existe
    const existingService = await getServiceById(id);
    if (!existingService) {
      return jsonError("Service not found", 404);
    }

    const updatedService = await updateService(id, body);
    return jsonSuccess(updatedService);
  } catch (error) {
    console.error("Error updating service:", error);
    return jsonError("Error updating service", 500);
  }
}

// DELETE /api/services/[id] - Eliminar servicio
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

    // Verificar que el servicio existe
    const existingService = await getServiceById(id);
    if (!existingService) {
      return jsonError("Service not found", 404);
    }

    await deleteService(id);
    return jsonSuccess({ id }, { successCode: "services.delete.success" });
  } catch (error) {
    console.error("Error deleting service:", error);
    return jsonError("Error deleting service", 500);
  }
}
