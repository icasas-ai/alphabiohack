import { jsonError, jsonSuccess } from "@/lib/api/route-helpers";

import { getTherapistById } from "@/services/user.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Buscar el usuario en la base de datos usando Prisma
    const user = await getTherapistById(id);

    if (!user) {
      return jsonError("Terapeuta no encontrado", 404);
    }

    // Verificar que el usuario tenga rol de terapeuta
    if (!user.role.includes("Therapist")) {
      return jsonError("El usuario no es un terapeuta", 403);
    }

    // Mapear los datos del usuario a la estructura esperada por el frontend
    return jsonSuccess({
        id: user.id,
        firstName: user.firstname,
        lastName: user.lastname,
        phone: "", // El modelo User no tiene phone, se puede agregar después
        specialties: ["Alphabiotics"], // Se puede agregar al modelo después
        bio: "Profesional con experiencia en el área.", // Se puede agregar al modelo después
        profileImage: user.avatar || "",
        qualifications: ["Licenciatura en Psicología"], // Se puede agregar al modelo después
        languages: ["Español", "Inglés"], // Se puede agregar al modelo después
        experience: "5+ años", // Se puede agregar al modelo después
        rating: 4.8, // Se puede agregar al modelo después
        totalPatients: user._count.patientBookings,
        address: "3556 Beech Street, San Francisco, California, CA 94109", // Se puede agregar al modelo después
    });
  } catch (error) {
    console.error("Error fetching therapist:", error);
    return jsonError("Error interno del servidor", 500);
  }
}
