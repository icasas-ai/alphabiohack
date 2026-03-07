import type { CreateSpecialtyData, UpdateSpecialtyData } from "@/types";

import {
  countSpecialties,
  createSpecialtyRecord,
  deleteSpecialtyRecord,
  findFirstSpecialty,
  findSpecialties,
  findSpecialtyByIdWithInclude,
  updateSpecialtyRecord,
} from "@/repositories";

// Crear especialidad
export const createSpecialty = async (
  data: CreateSpecialtyData,
  companyId: string,
) => {
  try {
    const specialty = await createSpecialtyRecord({
        companyId,
        name: data.name,
        description: data.description,
      });
    return findSpecialtyByIdWithInclude(specialty.id, {
        services: true,
    });
  } catch (error) {
    console.error("Error creating specialty:", error);
    throw error;
  }
};

// Obtener especialidad por ID
export const getSpecialtyById = async (id: string) => {
  try {
    const specialty = await findSpecialtyByIdWithInclude(id, {
        services: {
          orderBy: { createdAt: "desc" },
        },
    });
    return specialty;
  } catch (error) {
    console.error("Error getting specialty by id:", error);
    throw error;
  }
};

// Obtener especialidad por nombre
export const getSpecialtyByName = async (name: string, companyId?: string) => {
  try {
    const specialty = await findFirstSpecialty(
      {
        AND: [
          companyId ? { companyId } : {},
          {
            name: {
              equals: name,
              mode: "insensitive",
            },
          },
        ],
      },
      {
        services: {
          orderBy: { createdAt: "desc" },
        },
      },
    );
    return specialty;
  } catch (error) {
    console.error("Error getting specialty by name:", error);
    throw error;
  }
};

// Obtener todas las especialidades
export const getAllSpecialties = async (companyId?: string) => {
  try {
    const specialties = await findSpecialties(
      companyId ? { companyId } : undefined,
      {
        services: {
          orderBy: { createdAt: "desc" },
        },
      },
      { name: "asc" },
    );
    return specialties;
  } catch (error) {
    console.error("Error getting all specialties:", error);
    throw error;
  }
};

// Buscar especialidades por nombre
export const searchSpecialtiesByName = async (searchTerm: string, companyId?: string) => {
  try {
    const specialties = await findSpecialties(
      {
        AND: [
          companyId ? { companyId } : {},
          {
            OR: [
              {
                name: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
              },
              {
                description: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
              },
            ],
          },
        ],
      },
      {
        services: {
          orderBy: { createdAt: "desc" },
        },
      },
      { name: "asc" },
    );
    return specialties;
  } catch (error) {
    console.error("Error searching specialties:", error);
    throw error;
  }
};

// Obtener especialidades con servicios
export const getSpecialtiesWithServices = async (companyId?: string) => {
  try {
    const specialties = await findSpecialties(
      {
        AND: [
          companyId ? { companyId } : {},
          {
            services: {
              some: {},
            },
          },
        ],
      },
      {
        services: {
          orderBy: { createdAt: "desc" },
        },
      },
      { name: "asc" },
    );
    return specialties;
  } catch (error) {
    console.error("Error getting specialties with services:", error);
    throw error;
  }
};

// Obtener especialidades populares (con más servicios)
export const getPopularSpecialties = async (limit: number = 10, companyId?: string) => {
  try {
    const specialties = await findSpecialties(
      companyId ? { companyId } : undefined,
      {
        services: true,
        _count: {
          select: {
            services: true,
          },
        },
      },
      {
        services: {
          _count: "desc",
        },
      },
      limit,
    );
    return specialties;
  } catch (error) {
    console.error("Error getting popular specialties:", error);
    throw error;
  }
};

// Actualizar especialidad
export const updateSpecialty = async (
  id: string,
  data: UpdateSpecialtyData
) => {
  try {
    await updateSpecialtyRecord(id, {
        name: data.name,
        description: data.description,
      });
    const specialty = await findSpecialtyByIdWithInclude(id, {
        services: {
          orderBy: { createdAt: "desc" },
        },
    });
    return specialty;
  } catch (error) {
    console.error("Error updating specialty:", error);
    throw error;
  }
};

// Eliminar especialidad
export const deleteSpecialty = async (id: string) => {
  try {
    const specialty = await deleteSpecialtyRecord(id);
    return specialty;
  } catch (error) {
    console.error("Error deleting specialty:", error);
    throw error;
  }
};

// Obtener estadísticas de especialidad
export const getSpecialtyStats = async (id: string) => {
  try {
    const specialty = await findSpecialtyByIdWithInclude(id, {
      services: true,
    });

    if (!specialty) return null;

    const totalServices = specialty.services.length;
    const totalCost = specialty.services.reduce(
      (sum, service) => sum + service.cost,
      0
    );
    const averageCost = totalServices > 0 ? totalCost / totalServices : 0;
    const totalDuration = specialty.services.reduce(
      (sum, service) => sum + service.duration,
      0
    );
    const averageDuration =
      totalServices > 0 ? totalDuration / totalServices : 0;

    return {
      ...specialty,
      stats: {
        totalServices,
        totalCost,
        averageCost,
        totalDuration,
        averageDuration,
      },
    };
  } catch (error) {
    console.error("Error getting specialty stats:", error);
    throw error;
  }
};

// Verificar si una especialidad existe
export const specialtyExists = async (name: string, companyId?: string) => {
  try {
    const count = await countSpecialties({
        AND: [
          companyId ? { companyId } : {},
          {
            name: {
              equals: name,
              mode: "insensitive",
            },
          },
        ],
    });
    return count > 0;
  } catch (error) {
    console.error("Error checking if specialty exists:", error);
    throw error;
  }
};
