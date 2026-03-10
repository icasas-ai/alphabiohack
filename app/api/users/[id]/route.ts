import { NextRequest, NextResponse } from "next/server";
import {
  deleteUser,
  getPatientBookings,
  getTherapistBookings,
  getUserById,
  updateUser,
} from "@/services";

interface UserResponseData {
  user: unknown;
  patientBookings?: unknown[];
  therapistBookings?: unknown[];
}

// GET /api/users/[id] - Obtener usuario por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const includeBookings = searchParams.get("includeBookings");

    const user = await getUserById(id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    let responseData: UserResponseData = { user };

    // Si se solicitan las citas, agregarlas al response
    if (includeBookings === "true") {
      const [patientBookings, therapistBookings] = await Promise.all([
        getPatientBookings(id),
        getTherapistBookings(id),
      ]);

      responseData = {
        ...responseData,
        patientBookings,
        therapistBookings,
      };
    }

    return NextResponse.json({ success: true, data: responseData });
  } catch (error) {
    console.error("Error getting user:", error);
    return NextResponse.json(
      { success: false, error: "Error getting user" },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Actualizar usuario
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Verificar que el usuario existe
    const existingUser = await getUserById(id);
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const updatedUser = await updateUser(id, body);
    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, error: "Error updating user" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Eliminar usuario
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verificar que el usuario existe
    const existingUser = await getUserById(id);
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    await deleteUser(id);
    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { success: false, error: "Error deleting user" },
      { status: 500 }
    );
  }
}
