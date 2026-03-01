import type {
  ApiResponse,
  Specialty,
  SpecialtyStats,
  SpecialtyWithServices,
} from "@/types/api";
import type { CreateSpecialtyData, UpdateSpecialtyData } from "@/types";

import { API_ENDPOINTS } from "@/constants";

// Cliente API para especialidades
class SpecialtiesApiClient {
  private baseUrl = API_ENDPOINTS.SPECIALTIES.BASE;

  // Obtener todas las especialidades
  async getAllSpecialties(): Promise<SpecialtyWithServices[]> {
    const response = await fetch(this.baseUrl);
    const result: ApiResponse<SpecialtyWithServices[]> = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Error al obtener especialidades");
    }

    return result.data || [];
  }

  // Obtener especialidades con servicios
  async getSpecialtiesWithServices(): Promise<SpecialtyWithServices[]> {
    const response = await fetch(API_ENDPOINTS.SPECIALTIES.WITH_SERVICES);
    const result: ApiResponse<SpecialtyWithServices[]> = await response.json();

    if (!result.success) {
      throw new Error(
        result.error || "Error al obtener especialidades con servicios"
      );
    }

    return result.data || [];
  }

  // Obtener especialidad por ID
  async getSpecialtyById(id: string): Promise<Specialty> {
    const response = await fetch(API_ENDPOINTS.SPECIALTIES.BY_ID(id));
    const result: ApiResponse<Specialty> = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Error al obtener especialidad");
    }

    return result.data!;
  }

  // Crear especialidad
  async createSpecialty(data: CreateSpecialtyData): Promise<Specialty> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse<Specialty> = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Error al crear especialidad");
    }

    return result.data!;
  }

  // Actualizar especialidad
  async updateSpecialty(
    id: string,
    data: UpdateSpecialtyData
  ): Promise<Specialty> {
    const response = await fetch(API_ENDPOINTS.SPECIALTIES.BY_ID(id), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse<Specialty> = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Error al actualizar especialidad");
    }

    return result.data!;
  }

  // Eliminar especialidad
  async deleteSpecialty(id: string): Promise<void> {
    const response = await fetch(API_ENDPOINTS.SPECIALTIES.BY_ID(id), {
      method: "DELETE",
    });

    const result: ApiResponse = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Error al eliminar especialidad");
    }
  }

  // Obtener estadísticas de especialidad
  async getSpecialtyStats(id: string): Promise<SpecialtyStats> {
    const response = await fetch(
      `${API_ENDPOINTS.SPECIALTIES.BY_ID(id)}?includeStats=true`
    );
    const result: ApiResponse<{ specialty: Specialty; stats: SpecialtyStats }> =
      await response.json();

    if (!result.success) {
      throw new Error(result.error || "Error al obtener estadísticas");
    }

    return result.data!.stats;
  }
}

export const specialtiesApi = new SpecialtiesApiClient();
