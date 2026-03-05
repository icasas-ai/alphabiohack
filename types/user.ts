import { UserRole } from "@/lib/prisma-browser";

// Interfaz para crear un nuevo usuario
export interface CreateUserData {
  email: string;
  supabaseId: string;
  firstname: string;
  lastname: string;
  avatar?: string;
  role: UserRole[];
}

// Interfaz para actualizar un usuario existente
export interface UpdateUserData {
  email?: string;
  firstname?: string;
  lastname?: string;
  avatar?: string;
  role?: UserRole[];
}
