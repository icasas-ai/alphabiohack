import { NextRequest } from "next/server";

import { jsonError, jsonSuccess } from "@/lib/api/route-helpers";
import { getServicesBySpecialty } from "@/services";

// GET /api/specialties/[id]/services - Obtener servicios de una especialidad
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const services = await getServicesBySpecialty(id);
    return jsonSuccess(services);
  } catch (error) {
    console.error("Error getting specialty services:", error);
    return jsonError("Error getting specialty services", 500);
  }
}
