import type { CreateLocationData, UpdateLocationData } from "@/types";
import tzlookup from '@photostructure/tz-lookup';

import { isSupportedCompanyTimezone } from "@/lib/constants/supported-timezones";
import { prisma } from "@/lib/prisma";
import {
  createLocationRecord,
  findLocationByIdWithInclude,
  findLocationByIdWithSelect,
  findLocations,
  updateLocationRecord,
} from "@/repositories";

async function resolveLocationTimezoneAndCoordinates(data: {
  timezone?: string;
  lat?: number;
  lon?: number;
}) {
  const lat = data.lat;
  const lon = data.lon;
  let timezone = data.timezone?.trim();

  if (!timezone && lat !== undefined && lon !== undefined) {
    timezone = tzlookup(lat, lon);
  }

  if (!timezone) {
    throw new Error(
      "Unable to determine the office timezone. Select a timezone manually or provide valid coordinates."
    );
  }

  if (!isSupportedCompanyTimezone(timezone)) {
    throw new Error("Unsupported timezone. Select a supported US or Canada timezone.");
  }

  return {
    lat,
    lon,
    timezone,
  };
}

// Función auxiliar para calcular distancia entre dos puntos
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radio de la Tierra en kilómetros
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Crear ubicación
export const createLocation = async (data: CreateLocationData, companyId: string) => {
  try {
    const { lat, lon, timezone } = await resolveLocationTimezoneAndCoordinates(data);
    const location = await createLocationRecord(
      {
        companyId,
        address: data.address,
        logo: data.logo,
        title: data.title,
        description: data.description,
        lat,
        lon,
        timezone,
      },
      {
        bookings: true,
      },
    );
    return location;
  } catch (error) {
    console.error("Error creating location:", error);
    throw error;
  }
};

// Obtener ubicación por ID
export const getLocationById = async (id: string) => {
  try {
    const location = await findLocationByIdWithInclude(id, {
      bookings: {
        include: {
          therapist: true,
          patient: true,
        },
      },
    });
    return location;
  } catch (error) {
    console.error("Error getting location by id:", error);
    throw error;
  }
};

// Obtener todas las ubicaciones
export const getAllLocations = async (companyId?: string) => {
  try {
    const locations = await findLocations(
      companyId ? { companyId } : undefined,
      {
        bookings: {
          include: {
            therapist: true,
            patient: true,
          },
        },
      },
      { createdAt: "desc" },
    );
    return locations;
  } catch (error) {
    console.error("Error getting all locations:", error);
    throw error;
  }
};

// Buscar ubicaciones por título
export const searchLocationsByTitle = async (title: string, companyId?: string) => {
  try {
    const locations = await findLocations(
      {
        AND: [
          companyId ? { companyId } : {},
          {
            title: {
              contains: title,
              mode: "insensitive",
            },
          },
        ],
      },
      {
        bookings: true,
      },
      { createdAt: "desc" },
    );
    return locations;
  } catch (error) {
    console.error("Error searching locations by title:", error);
    throw error;
  }
};

// Buscar ubicaciones por dirección
export const searchLocationsByAddress = async (address: string, companyId?: string) => {
  try {
    const locations = await findLocations(
      {
        AND: [
          companyId ? { companyId } : {},
          {
            address: {
              contains: address,
              mode: "insensitive",
            },
          },
        ],
      },
      {
        bookings: true,
      },
      { createdAt: "desc" },
    );
    return locations;
  } catch (error) {
    console.error("Error searching locations by address:", error);
    throw error;
  }
};

// Buscar ubicaciones cercanas por coordenadas
export const findNearbyLocations = async (
  lat: number,
  lon: number,
  radiusKm: number = 10,
  companyId?: string,
) => {
  try {
    // Esta es una implementación básica. Para producción, considera usar PostGIS
    const locations = await prisma.location.findMany({
      where: {
        AND: [
          companyId ? { companyId } : {},
          { lat: { not: null } },
          { lon: { not: null } },
        ],
      },
      include: {
        bookings: true,
      },
    });

    // Filtrar por distancia (implementación simple)
    const nearbyLocations = locations.filter((location) => {
      if (!location.lat || !location.lon) return false;

      const distance = calculateDistance(lat, lon, location.lat, location.lon);
      return distance <= radiusKm;
    });

    return nearbyLocations;
  } catch (error) {
    console.error("Error finding nearby locations:", error);
    throw error;
  }
};

// Actualizar ubicación
export const updateLocation = async (id: string, data: UpdateLocationData) => {
  try {
    const payload: Record<string, unknown> = {
      address: data.address,
      logo: data.logo,
      title: data.title,
      description: data.description,
    };

    if (
      data.timezone !== undefined ||
      data.lat !== undefined ||
      data.lon !== undefined ||
      data.address !== undefined
    ) {
      const existingLocation = await findLocationByIdWithSelect(id, {
        address: true,
        timezone: true,
        lat: true,
        lon: true,
      });

      const { lat, lon, timezone } = await resolveLocationTimezoneAndCoordinates({
        address: data.address ?? existingLocation?.address,
        timezone: data.timezone ?? existingLocation?.timezone,
        lat: data.lat ?? existingLocation?.lat ?? undefined,
        lon: data.lon ?? existingLocation?.lon ?? undefined,
      });

      payload.lat = lat;
      payload.lon = lon;
      payload.timezone = timezone;
    }

    const location = await updateLocationRecord(id, payload, {
      bookings: true,
    });
    return location;
  } catch (error) {
    console.error("Error updating location:", error);
    throw error;
  }
};

// Eliminar ubicación
export const deleteLocation = async (id: string) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      await tx.booking.deleteMany({ where: { locationId: id } });
      const deletedLocation = await tx.location.delete({ where: { id } });
      return deletedLocation;
    });
    return result;
  } catch (error) {
    console.error("Error deleting location:", error);
    throw error;
  }
};

// Obtener citas de una ubicación
export const getLocationBookings = async (locationId: string) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { locationId },
      include: {
        therapist: true,
        patient: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return bookings;
  } catch (error) {
    console.error("Error getting location bookings:", error);
    throw error;
  }
};
