import { NextRequest } from "next/server";
import {
  deleteUser,
  getPatientBookings,
  getTherapistBookings,
  getUserById,
  updateUser,
} from "@/services";
import { jsonError, jsonSuccess, requireAuthorizedUser } from "@/lib/api/route-helpers";
import { canManagePersonnel } from "@/lib/auth/authorization";

// GET /api/users/[id] - Obtener usuario por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireAuthorizedUser(canManagePersonnel);
    if ("response" in currentUser) {
      return currentUser.response;
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const includeBookings = searchParams.get("includeBookings");

    const user = await getUserById(id);

    if (!user) {
      return jsonError("User not found", 404);
    }

    if (includeBookings === "true") {
      const [patientBookings, therapistBookings] = await Promise.all([
        getPatientBookings(id),
        getTherapistBookings(id),
      ]);

      return jsonSuccess(user, {
        meta: {
          patientBookings,
          therapistBookings,
        },
      });
    }

    return jsonSuccess(user);
  } catch (error) {
    console.error("Error getting user:", error);
    return jsonError("Error getting user", 500);
  }
}

// PUT /api/users/[id] - Actualizar usuario
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireAuthorizedUser(canManagePersonnel);
    if ("response" in currentUser) {
      return currentUser.response;
    }

    const { id } = await params;
    const body = await request.json();

    // Verificar que el usuario existe
    const existingUser = await getUserById(id);
    if (!existingUser) {
      return jsonError("User not found", 404);
    }

    const updatedUser = await updateUser(id, body);
    return jsonSuccess(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return jsonError("Error updating user", 500);
  }
}

// DELETE /api/users/[id] - Eliminar usuario
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireAuthorizedUser(canManagePersonnel);
    if ("response" in currentUser) {
      return currentUser.response;
    }

    const { id } = await params;

    // Verificar que el usuario existe
    const existingUser = await getUserById(id);
    if (!existingUser) {
      return jsonError("User not found", 404);
    }

    await deleteUser(id);
    return jsonSuccess({ id }, { successCode: "users.delete.success" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return jsonError("Error deleting user", 500);
  }
}
