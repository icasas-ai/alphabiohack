import type { CreateServiceData, UpdateServiceData } from "@/types";

import { prisma } from "@/lib/prisma";
import {
  countServices,
  createManyServices,
  createServiceRecord,
  deleteServiceRecord,
  findServiceByIdWithInclude,
  findServices,
  updateServiceRecord,
} from "@/repositories";

export const createService = async (
  data: CreateServiceData,
  companyId: string,
) => {
  try {
    return await createServiceRecord(
      {
        companyId,
        description: data.description,
        cost: data.cost,
        duration: data.duration,
        specialtyId: data.specialtyId,
      },
      {
        specialty: true,
      },
    );
  } catch (error) {
    console.error("Error creating service:", error);
    throw error;
  }
};

export const createMultipleServices = async (
  servicesData: CreateServiceData[],
  companyId: string,
) => {
  try {
    return await createManyServices(
      servicesData.map((service) => ({
        ...service,
        companyId,
      })),
    );
  } catch (error) {
    console.error("Error creating multiple services:", error);
    throw error;
  }
};

export const getServiceById = async (id: string) => {
  try {
    return await findServiceByIdWithInclude(id, {
      specialty: true,
    });
  } catch (error) {
    console.error("Error getting service by id:", error);
    throw error;
  }
};

export const getAllServices = async (companyId?: string) => {
  try {
    return await findServices(
      companyId ? { companyId } : undefined,
      {
        specialty: true,
      },
      { createdAt: "desc" },
    );
  } catch (error) {
    console.error("Error getting all services:", error);
    throw error;
  }
};

export const getServicesBySpecialty = async (specialtyId: string, companyId?: string) => {
  try {
    return await findServices(
      {
        specialtyId,
        ...(companyId ? { companyId } : {}),
      },
      {
        specialty: true,
      },
      { createdAt: "desc" },
    );
  } catch (error) {
    console.error("Error getting services by specialty:", error);
    throw error;
  }
};

export const searchServicesByDescription = async (searchTerm: string, companyId?: string) => {
  try {
    return await findServices(
      {
        AND: [
          companyId ? { companyId } : {},
          {
            description: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        ],
      },
      {
        specialty: true,
      },
      { createdAt: "desc" },
    );
  } catch (error) {
    console.error("Error searching services by description:", error);
    throw error;
  }
};

export const getServicesByPriceRange = async (
  minPrice: number,
  maxPrice: number,
  companyId?: string,
) => {
  try {
    return await findServices(
      {
        AND: [
          companyId ? { companyId } : {},
          {
            cost: {
              gte: minPrice,
              lte: maxPrice,
            },
          },
        ],
      },
      {
        specialty: true,
      },
      { cost: "asc" },
    );
  } catch (error) {
    console.error("Error getting services by price range:", error);
    throw error;
  }
};

export const getServicesByDuration = async (duration: number, companyId?: string) => {
  try {
    return await findServices(
      {
        duration,
        ...(companyId ? { companyId } : {}),
      },
      {
        specialty: true,
      },
      { createdAt: "desc" },
    );
  } catch (error) {
    console.error("Error getting services by duration:", error);
    throw error;
  }
};

export const getServicesByDurationRange = async (
  minDuration: number,
  maxDuration: number,
  companyId?: string,
) => {
  try {
    return await findServices(
      {
        AND: [
          companyId ? { companyId } : {},
          {
            duration: {
              gte: minDuration,
              lte: maxDuration,
            },
          },
        ],
      },
      {
        specialty: true,
      },
      { duration: "asc" },
    );
  } catch (error) {
    console.error("Error getting services by duration range:", error);
    throw error;
  }
};

export const getMostPopularServices = async (limit: number = 10, companyId?: string) => {
  try {
    return await findServices(
      companyId ? { companyId } : undefined,
      {
        specialty: true,
      },
      { cost: "asc" },
      limit,
    );
  } catch (error) {
    console.error("Error getting most popular services:", error);
    throw error;
  }
};

export const getMostExpensiveServices = async (limit: number = 10, companyId?: string) => {
  try {
    return await findServices(
      companyId ? { companyId } : undefined,
      {
        specialty: true,
      },
      { cost: "desc" },
      limit,
    );
  } catch (error) {
    console.error("Error getting most expensive services:", error);
    throw error;
  }
};

export const getCheapestServices = async (limit: number = 10, companyId?: string) => {
  try {
    return await findServices(
      companyId ? { companyId } : undefined,
      {
        specialty: true,
      },
      { cost: "asc" },
      limit,
    );
  } catch (error) {
    console.error("Error getting cheapest services:", error);
    throw error;
  }
};

export const updateService = async (id: string, data: UpdateServiceData) => {
  try {
    await updateServiceRecord(id, {
      description: data.description,
      cost: data.cost,
      duration: data.duration,
      specialtyId: data.specialtyId,
    });

    return await findServiceByIdWithInclude(id, {
      specialty: true,
    });
  } catch (error) {
    console.error("Error updating service:", error);
    throw error;
  }
};

export const deleteService = async (id: string) => {
  try {
    return await deleteServiceRecord(id);
  } catch (error) {
    console.error("Error deleting service:", error);
    throw error;
  }
};

export const deleteServicesBySpecialty = async (specialtyId: string) => {
  try {
    return await prisma.service.deleteMany({
      where: { specialtyId },
    });
  } catch (error) {
    console.error("Error deleting services by specialty:", error);
    throw error;
  }
};

export const getServiceStats = async () => {
  try {
    const totalServices = await prisma.service.count();
    const averageCost = await prisma.service.aggregate({
      _avg: {
        cost: true,
      },
    });
    const averageDuration = await prisma.service.aggregate({
      _avg: {
        duration: true,
      },
    });
    const minCost = await prisma.service.aggregate({
      _min: {
        cost: true,
      },
    });
    const maxCost = await prisma.service.aggregate({
      _max: {
        cost: true,
      },
    });

    return {
      totalServices,
      averageCost: averageCost._avg.cost || 0,
      averageDuration: averageDuration._avg.duration || 0,
      minCost: minCost._min.cost || 0,
      maxCost: maxCost._max.cost || 0,
    };
  } catch (error) {
    console.error("Error getting service stats:", error);
    throw error;
  }
};

export const getServiceStatsBySpecialty = async (specialtyId: string, companyId?: string) => {
  try {
    const services = await prisma.service.findMany({
      where: {
        specialtyId,
        ...(companyId ? { companyId } : {}),
      },
    });

    if (services.length === 0) {
      return {
        totalServices: 0,
        averageCost: 0,
        averageDuration: 0,
        minCost: 0,
        maxCost: 0,
      };
    }

    const totalCost = services.reduce((sum, service) => sum + service.cost, 0);
    const totalDuration = services.reduce((sum, service) => sum + service.duration, 0);
    const costs = services.map((service) => service.cost);

    return {
      totalServices: services.length,
      averageCost: totalCost / services.length,
      averageDuration: totalDuration / services.length,
      minCost: Math.min(...costs),
      maxCost: Math.max(...costs),
    };
  } catch (error) {
    console.error("Error getting service stats by specialty:", error);
    throw error;
  }
};

export const serviceExists = async (
  description: string,
  specialtyId: string,
  companyId?: string,
) => {
  try {
    const count = await countServices({
      description: {
        equals: description,
        mode: "insensitive",
      },
      specialtyId,
      ...(companyId ? { companyId } : {}),
    });

    return count > 0;
  } catch (error) {
    console.error("Error checking if service exists:", error);
    throw error;
  }
};
