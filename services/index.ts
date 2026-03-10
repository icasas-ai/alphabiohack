// Exportar todas las funciones de servicios CRUD
export {
  getCompanyContextForUser,
  getPrimaryCompanyForUser,
  getPrimaryCompanyIdForUser,
  getPublicCompany,
  getPublicTherapistForCompany,
  resolveManagedTherapistIdForUser,
  resolveScopedCompanyId,
} from "./company.service";

export {
  createUser,
  deleteUser,
  getAllUsers,
  getPatientBookings,
  getTherapistBookings,
  getUserByEmail,
  getUserById,
  getUsersByRole,
  updateUser,
} from "./user.service";

export {
  createLocation,
  deleteLocation,
  findNearbyLocations,
  getAllLocations,
  getLocationBookings,
  getLocationById,
  searchLocationsByAddress,
  searchLocationsByTitle,
  updateLocation,
} from "./location.service";

export {
  createSpecialty,
  deleteSpecialty,
  getAllSpecialties,
  getPopularSpecialties,
  getSpecialtiesWithServices,
  getSpecialtyById,
  getSpecialtyByName,
  getSpecialtyStats,
  searchSpecialtiesByName,
  specialtyExists,
  updateSpecialty,
} from "./specialty.service";

export {
  createMultipleServices,
  createService,
  deleteService,
  deleteServicesBySpecialty,
  getAllServices,
  getCheapestServices,
  getMostExpensiveServices,
  getMostPopularServices,
  getServiceById,
  getServicesByDuration,
  getServicesByDurationRange,
  getServicesByPriceRange,
  getServicesBySpecialty,
  getServiceStats,
  getServiceStatsBySpecialty,
  searchServicesByDescription,
  serviceExists,
  updateService,
} from "./service.service";

export {
  assignTherapistToBooking,
  createBooking,
  deleteBooking,
  deleteBookingsByLocation,
  deleteBookingsByPatient,
  deleteBookingsByTherapist,
  getAllBookings,
  getBookingById,
  getBookingsByDate,
  getBookingsByDateRange,
  getBookingsByEmail,
  getBookingsByLocation,
  getBookingsByName,
  getBookingsByPatient,
  getBookingsForUserIdentity,
  getBookingsByPhone,
  getBookingsByTherapist,
  getBookingsByTherapistAndDate,
  getBookingsByType,
  getBookingStats,
  getBookingStatsByLocation,
  getBookingStatsByTherapist,
  getPendingBookings,
  getRecentBookings,
  updateBooking,
  updateBookingStatus,
} from "./booking.service";

export {
  createAvailabilityPeriod,
  deleteAvailabilityPeriod,
  getAvailabilityDayOwnership,
  getAvailabilityExcludedDateOwnership,
  getAvailabilityPeriodOwnership,
  getAvailabilityDaySlots,
  getAvailabilityMonthSummary,
  isAvailabilitySlotBookable,
  listAvailabilityPeriods,
  restoreAvailabilityExcludedDate,
  updateAvailabilityDay,
} from "./availability.service";

// Exportar tipos desde la carpeta types
export type {
  BookingFormData,
  CreateBookingData,
  CreateLocationData,
  CreateServiceData,
  CreateSpecialtyData,
  CreateUserData,
  UpdateBookingData,
  UpdateLocationData,
  UpdateServiceData,
  UpdateSpecialtyData,
  UpdateUserData,
} from "@/types";
