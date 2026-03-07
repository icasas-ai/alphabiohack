import type { CreateBookingData, UpdateBookingData } from "@/types";
import { BookingStatus, BookingType, Prisma } from "@/lib/prisma-client";
import { formatBookingToLocalStrings, resolveTimeZone } from "@/lib/utils/timezone";

import { prisma } from "@/lib/prisma";
import { createBookingRecord, findLocationByIdWithSelect } from "@/repositories";
import { generateBookingNumber } from "@/lib/utils/booking-number";

const bookingCreateInclude = {
  location: {
    select: {
      id: true,
      title: true,
      address: true,
      timezone: true,
    },
  },
  specialty: true,
  service: true,
  therapist: true,
  patient: true,
} as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapBookingWithLocalTime = (booking: any ) => {
  const tz = resolveTimeZone(booking.location?.timezone);

  const { dateString, timeString } = formatBookingToLocalStrings(
    booking.bookingSchedule,
    tz
  );

  return {
    ...booking,
    bookingTimeZone: tz,
    bookingLocalDate: dateString, // YYYY-MM-DD
    bookingLocalTime: timeString, // HH:mm
  };
};

async function listBookingsWithLocalTime({
  where,
  orderBy = { createdAt: "desc" },
  take,
  include = bookingCreateInclude,
}: {
  where?: Prisma.BookingWhereInput;
  orderBy?:
    | Prisma.BookingOrderByWithRelationInput
    | Prisma.BookingOrderByWithRelationInput[];
  take?: number;
  include?: Prisma.BookingInclude;
}) {
  const bookings = await prisma.booking.findMany({
    where,
    include,
    orderBy,
    take,
  });

  return bookings.map(mapBookingWithLocalTime);
}

// Crear cita
export const createBooking = async (data: CreateBookingData) => {
  try {
    let bookedDurationMinutes = data.bookedDurationMinutes;
    let companyId = data.companyId;

    if (!companyId) {
      const location = await findLocationByIdWithSelect(data.locationId, {
        companyId: true,
      });
      companyId = location?.companyId;
    }

    if (!companyId) {
      throw new Error("A company context is required to create a booking.");
    }

    if (!bookedDurationMinutes && data.serviceId) {
      const service = await prisma.service.findUnique({
        where: { id: data.serviceId },
        select: { duration: true },
      });
      bookedDurationMinutes = service?.duration;
    }

    let booking = null;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        booking = await createBookingRecord({
          companyId,
          bookingNumber: generateBookingNumber(data.bookingSchedule),
          bookingType: data.bookingType,
          locationId: data.locationId,
          specialtyId: data.specialtyId,
          serviceId: data.serviceId,
          bookedDurationMinutes,
          firstname: data.firstname,
          lastname: data.lastname,
          phone: data.phone,
          email: data.email,
          givenConsent: data.givenConsent,
          therapistId: data.therapistId,
          patientId: data.patientId,
          bookingNotes: data.bookingNotes,
          bookingSchedule: data.bookingSchedule,
          status: data.status || "Pending",
        });
        break;
      } catch (error) {
        const conflictTarget = error instanceof Prisma.PrismaClientKnownRequestError
          ? error.meta?.target
          : null
        const isBookingNumberConflict =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002" &&
          (Array.isArray(conflictTarget)
            ? conflictTarget.includes("bookingNumber")
            : conflictTarget === "bookingNumber");

        if (!isBookingNumberConflict) {
          throw error;
        }
      }
    }

    if (!booking) {
      throw new Error("Could not generate a unique booking number.");
    }
    // Email/invitación se envía desde /api/bookings tras crear la cita

    const fullBooking = await prisma.booking.findUnique({
      where: { id: booking.id },
      include: bookingCreateInclude,
    });

    if (!fullBooking) {
      throw new Error("Booking was created but could not be reloaded.");
    }

    return mapBookingWithLocalTime(fullBooking);
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
};

// Obtener cita por ID
export const getBookingById = async (id: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: bookingCreateInclude,
  });

  return booking ? mapBookingWithLocalTime(booking) : null;
};


// Obtener todas las citas
export const getAllBookings = async () => {
  return listBookingsWithLocalTime({});
};

// Obtener citas por paciente
export const getBookingsByPatient = async (patientId: string) => {
  return listBookingsWithLocalTime({
    where: { patientId },
  });
};

// Obtener citas por terapeuta
export const getBookingsByTherapist = async (therapistId: string) => {
  return listBookingsWithLocalTime({
    where: { therapistId },
  });
};


// Obtener especialidades y servicios disponibles
export const getSpecialtiesAndServices = async () => {
  try {
    const specialties = await prisma.specialty.findMany({
      include: {
        services: {
          select: {
            id: true,
            description: true,
            cost: true,
            duration: true,
          },
        },
      },
    });
    return specialties;
  } catch (error) {
    console.error("Error getting specialties and services:", error);
    throw error;
  }
};

// Obtener citas por ubicación
export const getBookingsByLocation = async (locationId: string) => {
  try {
    return await listBookingsWithLocalTime({
      where: { locationId },
    });
  } catch (error) {
    console.error("Error getting bookings by location:", error);
    throw error;
  }
};

// Obtener citas por tipo
export const getBookingsByType = async (bookingType: BookingType) => {
  try {
    return await listBookingsWithLocalTime({
      where: { bookingType },
    });
  } catch (error) {
    console.error("Error getting bookings by type:", error);
    throw error;
  }
};

// Buscar citas por email
export const getBookingsByEmail = async (email: string) => {
  try {
    return await listBookingsWithLocalTime({
      where: { email },
    });
  } catch (error) {
    console.error("Error getting bookings by email:", error);
    throw error;
  }
};

// Buscar citas por teléfono
export const getBookingsByPhone = async (phone: string) => {
  try {
    return await listBookingsWithLocalTime({
      where: { phone },
    });
  } catch (error) {
    console.error("Error getting bookings by phone:", error);
    throw error;
  }
};

// Buscar citas por nombre
export const getBookingsByName = async (
  firstname: string,
  lastname: string
) => {
  try {
    return await listBookingsWithLocalTime({
      where: {
        firstname: {
          contains: firstname,
          mode: "insensitive",
        },
        lastname: {
          contains: lastname,
          mode: "insensitive",
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error getting bookings by name:", error);
    throw error;
  }
};

// Obtener citas por rango de fechas
export const getBookingsByDateRange = async (
  startDate: Date,
  endDate: Date
) => {
  try {
    return await listBookingsWithLocalTime({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error getting bookings by date range:", error);
    throw error;
  }
};

// Obtener citas recientes
export const getRecentBookings = async (limit: number = 10) => {
  try {
    return await listBookingsWithLocalTime({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  } catch (error) {
    console.error("Error getting recent bookings:", error);
    throw error;
  }
};

// Obtener citas pendientes (sin terapeuta asignado)
export const getPendingBookings = async () => {
  try {
    return await listBookingsWithLocalTime({
      where: { therapistId: null },
      orderBy: { createdAt: "asc" },
    });
  } catch (error) {
    console.error("Error getting pending bookings:", error);
    throw error;
  }
};

// Asignar terapeuta a una cita
export const assignTherapistToBooking = async (
  bookingId: string,
  therapistId: string
) => {
  try {
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { therapistId },
      include: {
        location: true,
        specialty: true,
        service: true,
        therapist: true,
        patient: true,
      },
    });
    return booking;
  } catch (error) {
    console.error("Error assigning therapist:", error);
    throw error;
  }
};

// Actualizar cita
export const updateBooking = async (id: string, data: UpdateBookingData) => {
  try {
    const booking = await prisma.booking.update({
      where: { id },
      data: {
        bookingType: data.bookingType,
        locationId: data.locationId,
        firstname: data.firstname,
        lastname: data.lastname,
        phone: data.phone,
        email: data.email,
        givenConsent: data.givenConsent,
        therapistId: data.therapistId,
        patientId: data.patientId,
        bookingNotes: data.bookingNotes,
        bookingSchedule: data.bookingSchedule,
        status: data.status,
      },
      include: {
        location: true,
        specialty: true,
        service: true,
        therapist: true,
        patient: true,
      },
    });
    return mapBookingWithLocalTime(booking);
  } catch (error) {
    console.error("Error updating booking:", error);
    throw error;
  }
};

// Eliminar cita
export const deleteBooking = async (id: string) => {
  try {
    const booking = await prisma.booking.delete({
      where: { id },
    });
    return booking;
  } catch (error) {
    console.error("Error deleting booking:", error);
    throw error;
  }
};

// Eliminar citas por paciente
export const deleteBookingsByPatient = async (patientId: string) => {
  try {
    const result = await prisma.booking.deleteMany({
      where: { patientId },
    });
    return result;
  } catch (error) {
    console.error("Error deleting bookings by patient:", error);
    throw error;
  }
};

// Eliminar citas por terapeuta
export const deleteBookingsByTherapist = async (therapistId: string) => {
  try {
    const result = await prisma.booking.deleteMany({
      where: { therapistId },
    });
    return result;
  } catch (error) {
    console.error("Error deleting bookings by therapist:", error);
    throw error;
  }
};

// Eliminar citas por ubicación
export const deleteBookingsByLocation = async (locationId: string) => {
  try {
    const result = await prisma.booking.deleteMany({
      where: { locationId },
    });
    return result;
  } catch (error) {
    console.error("Error deleting bookings by location:", error);
    throw error;
  }
};

// Obtener estadísticas de citas
export const getBookingStats = async () => {
  try {
    const totalBookings = await prisma.booking.count();
    const bookingsByType = await prisma.booking.groupBy({
      by: ["bookingType"],
      _count: {
        bookingType: true,
      },
    });
    const pendingBookings = await prisma.booking.count({
      where: { therapistId: null },
    });
    const assignedBookings = await prisma.booking.count({
      where: { therapistId: { not: null } },
    });

    return {
      totalBookings,
      pendingBookings,
      assignedBookings,
      bookingsByType: bookingsByType.map((item) => ({
        type: item.bookingType,
        count: item._count.bookingType,
      })),
    };
  } catch (error) {
    console.error("Error getting booking stats:", error);
    throw error;
  }
};

// Obtener estadísticas por terapeuta
export const getBookingStatsByTherapist = async (therapistId: string) => {
  try {
    const totalBookings = await prisma.booking.count({
      where: { therapistId },
    });
    const bookingsByType = await prisma.booking.groupBy({
      by: ["bookingType"],
      where: { therapistId },
      _count: {
        bookingType: true,
      },
    });

    return {
      totalBookings,
      bookingsByType: bookingsByType.map((item) => ({
        type: item.bookingType,
        count: item._count.bookingType,
      })),
    };
  } catch (error) {
    console.error("Error getting booking stats by therapist:", error);
    throw error;
  }
};

// Obtener estadísticas por ubicación
export const getBookingStatsByLocation = async (locationId: string) => {
  try {
    const totalBookings = await prisma.booking.count({
      where: { locationId },
    });
    const bookingsByType = await prisma.booking.groupBy({
      by: ["bookingType"],
      where: { locationId },
      _count: {
        bookingType: true,
      },
    });

    return {
      totalBookings,
      bookingsByType: bookingsByType.map((item) => ({
        type: item.bookingType,
        count: item._count.bookingType,
      })),
    };
  } catch (error) {
    console.error("Error getting booking stats by location:", error);
    throw error;
  }
};

// Obtener citas por fecha específica
export const getBookingsByDate = async (date: Date) => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await listBookingsWithLocalTime({
      where: {
        bookingSchedule: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { bookingSchedule: "asc" },
    });
  } catch (error) {
    console.error("Error getting bookings by date:", error);
    throw error;
  }
};

// Obtener citas por terapeuta y fecha
export const getBookingsByTherapistAndDate = async (
  therapistId: string,
  date: Date
) => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await listBookingsWithLocalTime({
      where: {
        therapistId,
        bookingSchedule: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { bookingSchedule: "asc" },
    });
  } catch (error) {
    console.error("Error getting bookings by therapist and date:", error);
    throw error;
  }
};

// Cambiar estado de una cita
export const updateBookingStatus = async (
  bookingId: string,
  status: BookingStatus
) => {
  try {
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: {
        location: true,
        specialty: true,
        service: true,
        therapist: true,
        patient: true,
      },
    });
    return mapBookingWithLocalTime(booking);
  } catch (error) {
    console.error("Error updating booking status:", error);
    throw error;
  }
};
