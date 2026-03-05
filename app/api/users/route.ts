import {
  createUser,
  getAllUsers,
  getUserByEmail,
  getUserBySupabaseId,
  getUsersByRole,
} from "@/services";
import { NextRequest, NextResponse } from "next/server";

import { UserRole } from "@/lib/prisma-client";

// GET /api/users - Obtener todos los usuarios
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const email = searchParams.get("email");
    const supabaseId = searchParams.get("supabaseId");

    let users;

    if (role) {
      users = await getUsersByRole(role as UserRole);
    } else if (email) {
      const user = await getUserByEmail(email);
      users = user ? [user] : [];
    } else if (supabaseId) {
      const user = await getUserBySupabaseId(supabaseId);
      users = user ? [user] : [];
    } else {
      users = await getAllUsers();
    }

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error("Error getting users:", error);
    return NextResponse.json(
      { success: false, error: "Error getting users" },
      { status: 500 }
    );
  }
}

// POST /api/users - Crear usuario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Validaciones básicas
    if (!body.email || !body.supabaseId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!body.role || !Array.isArray(body.role) || body.role.length === 0) {
      return NextResponse.json(
        { success: false, error: "Role is required and must be an array" },
        { status: 400 }
      );
    }

    const user = await createUser(body);
    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);

    return NextResponse.json(
      { success: false, error: "Error creating user" },
      { status: 500 }
    );
  }
}
