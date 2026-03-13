import type { CreateUserData, UpdateUserData } from "@/types";

import {
  appUserSelect,
  therapistDetailSelect,
  userBookingSelect,
} from "@/lib/auth/app-user";
import { UserRole } from "@/lib/prisma-client";
import { prisma } from "@/lib/prisma";

// Crear usuario
export const createUser = async (data: CreateUserData) => {
  try {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        firstname: data.firstname,
        lastname: data.lastname,
        avatar: data.avatar,
        role: data.role,
      },
      select: appUserSelect,
    });
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

// Obtener usuario por ID
export const getUserById = async (id: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: appUserSelect,
    });
    return user;
  } catch (error) {
    console.error("Error getting user by id:", error);
    throw error;
  }
};

// Obtener usuario por email
export const getUserByEmail = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: appUserSelect,
    });
    return user;
  } catch (error) {
    console.error("Error getting user by email:", error);
    throw error;
  }
};

// Obtener todos los usuarios
export const getAllUsers = async () => {
  try {
    const users = await prisma.user.findMany({
      select: appUserSelect,
      orderBy: { createdAt: "desc" },
    });
    return users;
  } catch (error) {
    console.error("Error getting all users:", error);
    throw error;
  }
};

// Obtener usuarios por rol
export const getUsersByRole = async (
  role: UserRole,
  companyId?: string
) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            role: {
              has: role,
            },
          },
          companyId
            ? {
                companyMemberships: {
                  some: {
                    companyId,
                  },
                },
              }
            : {},
        ],
      },
      select: appUserSelect,
      orderBy: { createdAt: "desc" },
    });
    return users;
  } catch (error) {
    console.error("Error getting users by role:", error);
    throw error;
  }
};

// Actualizar usuario
export const updateUser = async (id: string, data: UpdateUserData) => {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        email: data.email,
        firstname: data.firstname,
        lastname: data.lastname,
        avatar: data.avatar,
        role: data.role,
      },
      select: appUserSelect,
    });
    return user;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

// Eliminar usuario
export const deleteUser = async (id: string) => {
  try {
    const user = await prisma.user.delete({
      where: { id },
      select: appUserSelect,
    });
    return user;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

export const getTherapistById = async (id: string) => {
  try {
    return await prisma.user.findUnique({
      where: { id },
      select: therapistDetailSelect,
    });
  } catch (error) {
    console.error("Error getting therapist by id:", error);
    throw error;
  }
};

// Obtener historial de citas del paciente
export const getPatientBookings = async (userId: string) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { patientId: userId },
      select: userBookingSelect,
      orderBy: { createdAt: "desc" },
    });
    return bookings;
  } catch (error) {
    console.error("Error getting patient bookings:", error);
    throw error;
  }
};

// Obtener citas del terapeuta
export const getTherapistBookings = async (userId: string) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { therapistId: userId },
      select: userBookingSelect,
      orderBy: { createdAt: "desc" },
    });
    return bookings;
  } catch (error) {
    console.error("Error getting therapist bookings:", error);
    throw error;
  }
};
