import { NextRequest, NextResponse } from "next/server";
import {
  deleteSpecialty,
  getSpecialtyByName,
  getSpecialtyById,
  getSpecialtyStats,
  updateSpecialty,
} from "@/services";

interface SpecialtyResponseData {
  specialty: unknown;
  stats?: unknown;
}

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
      return NextResponse.json(
        { success: false, error: "Specialty not found" },
        { status: 404 }
      );
    }

    let responseData: SpecialtyResponseData = { specialty };

    // Si se solicitan las estadísticas
    if (includeStats === "true") {
      const stats = await getSpecialtyStats(id);
      responseData = {
        ...responseData,
        stats,
      };
    }

    return NextResponse.json({ success: true, data: responseData });
  } catch (error) {
    console.error("Error getting specialty:", error);
    return NextResponse.json(
      { success: false, error: "Error getting specialty" },
      { status: 500 }
    );
  }
}

// PUT /api/specialties/[id] - Actualizar especialidad
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Verificar que la especialidad existe
    const existingSpecialty = await getSpecialtyById(id);
    if (!existingSpecialty) {
      return NextResponse.json(
        { success: false, error: "Specialty not found" },
        { status: 404 }
      );
    }

    if (body.name) {
      const duplicate = await getSpecialtyByName(body.name, existingSpecialty.companyId);
      if (duplicate && duplicate.id !== id) {
        return NextResponse.json(
          { success: false, error: "Specialty already exists" },
          { status: 409 }
        );
      }
    }

    const updatedSpecialty = await updateSpecialty(id, body);
    return NextResponse.json({ success: true, data: updatedSpecialty });
  } catch (error) {
    console.error("Error updating specialty:", error);
    return NextResponse.json(
      { success: false, error: "Error updating specialty" },
      { status: 500 }
    );
  }
}

// DELETE /api/specialties/[id] - Eliminar especialidad
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verificar que la especialidad existe
    const existingSpecialty = await getSpecialtyById(id);
    if (!existingSpecialty) {
      return NextResponse.json(
        { success: false, error: "Specialty not found" },
        { status: 404 }
      );
    }

    await deleteSpecialty(id);
    return NextResponse.json({
      success: true,
      message: "Specialty deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting specialty:", error);
    return NextResponse.json(
      { success: false, error: "Error deleting specialty" },
      { status: 500 }
    );
  }
}
