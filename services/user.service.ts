import type { CreateUserData, UpdateUserData } from "@/types";

import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// Crear usuario
export const createUser = async (data: CreateUserData) => {
  try {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        supabaseId: data.supabaseId,
        firstname: data.firstname,
        lastname: data.lastname,
        avatar: data.avatar,
        role: data.role,
      },
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
      include: {
        therapistBookings: true,
        patientBookings: true,
      },
    });
    return user;
  } catch (error) {
    console.error("Error getting user by id:", error);
    throw error;
  }
};

// Obtener usuario por Supabase ID
export const getUserBySupabaseId = async (supabaseId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { supabaseId },
      include: {
        therapistBookings: true,
        patientBookings: true,
      },
    });
    return user;
  } catch (error) {
    console.error("Error getting user by supabase id:", error);
    throw error;
  }
};

// Obtener usuario por email
export const getUserByEmail = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        therapistBookings: true,
        patientBookings: true,
      },
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
      include: {
        therapistBookings: true,
        patientBookings: true,
      },
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
      include: {
        therapistBookings: true,
        patientBookings: true,
      },
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
      include: {
        therapistBookings: true,
        patientBookings: true,
      },
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
    });
    return user;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

// Obtener historial de citas del paciente
export const getPatientBookings = async (userId: string) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { patientId: userId },
      include: {
        location: true,
        therapist: true,
      },
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
      include: {
        location: true,
        patient: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return bookings;
  } catch (error) {
    console.error("Error getting therapist bookings:", error);
    throw error;
  }
};
