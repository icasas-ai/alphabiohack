import { NextRequest, NextResponse } from "next/server";

import { getUserById } from "@/services/user.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Buscar el usuario en la base de datos usando Prisma
    const user = await getUserById(id);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Terapeuta no encontrado",
        },
        { status: 404 }
      );
    }

    // Verificar que el usuario tenga rol de terapeuta
    if (!user.role.includes("Therapist")) {
      return NextResponse.json(
        {
          success: false,
          error: "El usuario no es un terapeuta",
        },
        { status: 403 }
      );
    }

    // Mapear los datos del usuario a la estructura esperada por el frontend
    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        firstName: user.firstname,
        lastName: user.lastname,
        phone: "", // El modelo User no tiene phone, se puede agregar después
        specialties: ["Alphabiotics"], // Se puede agregar al modelo después
        bio: "Profesional con experiencia en el área.", // Se puede agregar al modelo después
        profileImage: user.avatar || "/images/smiling-doctor.png",
        qualifications: ["Licenciatura en Psicología"], // Se puede agregar al modelo después
        languages: ["Español", "Inglés"], // Se puede agregar al modelo después
        experience: "5+ años", // Se puede agregar al modelo después
        rating: 4.8, // Se puede agregar al modelo después
        totalPatients: user.patientBookings?.length || 0,
        address: "3556 Beech Street, San Francisco, California, CA 94109", // Se puede agregar al modelo después
      },
    });
  } catch (error) {
    console.error("Error fetching therapist:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}
