import {
  createUser,
  getAllUsers,
  getUserByEmail,
  getUsersByRole,
} from "@/services";

import { jsonError, jsonSuccess, requireAuthorizedUser } from "@/lib/api/route-helpers";
import { canManagePersonnel } from "@/lib/auth/authorization";
import { UserRole } from "@/lib/prisma-client";
import { NextRequest } from "next/server";

// GET /api/users - Obtener todos los usuarios
export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireAuthorizedUser(canManagePersonnel);
    if ("response" in currentUser) {
      return currentUser.response;
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const email = searchParams.get("email");

    let users;

    if (role) {
      users = await getUsersByRole(role as UserRole);
    } else if (email) {
      const user = await getUserByEmail(email);
      users = user ? [user] : [];
    } else {
      users = await getAllUsers();
    }

    return jsonSuccess(users);
  } catch (error) {
    console.error("Error getting users:", error);
    return jsonError("Error getting users", 500);
  }
}

// POST /api/users - Crear usuario
export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireAuthorizedUser(canManagePersonnel);
    if ("response" in currentUser) {
      return currentUser.response;
    }

    const body = await request.json();
    // Validaciones básicas
    if (!body.email || !body.firstname || !body.lastname) {
      return jsonError("Missing required fields", 400);
    }

    if (!body.role || !Array.isArray(body.role) || body.role.length === 0) {
      return jsonError("Role is required and must be an array", 400);
    }

    const user = await createUser(body);
    return jsonSuccess(user, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);

    return jsonError("Error creating user", 500);
  }
}
