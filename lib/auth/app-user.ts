import type { Prisma } from "@/lib/prisma-client";

export const appUserSelect = {
  id: true,
  email: true,
  managedByTherapistId: true,
  firstname: true,
  lastname: true,
  avatar: true,
  telefono: true,
  informacionPublica: true,
  especialidad: true,
  summary: true,
  mustChangePassword: true,
  facebook: true,
  instagram: true,
  linkedin: true,
  twitter: true,
  tiktok: true,
  youtube: true,
  website: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type AppUser = Prisma.UserGetPayload<{ select: typeof appUserSelect }>;

export const therapistDetailSelect = {
  ...appUserSelect,
  _count: {
    select: {
      patientBookings: true,
    },
  },
} satisfies Prisma.UserSelect;

export type TherapistDetailUser = Prisma.UserGetPayload<{
  select: typeof therapistDetailSelect;
}>;

export const userBookingSelect = {
  id: true,
  bookingNumber: true,
  firstname: true,
  lastname: true,
  email: true,
  phone: true,
  bookingSchedule: true,
  status: true,
  bookingNotes: true,
  createdAt: true,
  updatedAt: true,
  location: {
    select: {
      id: true,
      title: true,
      address: true,
      timezone: true,
    },
  },
  specialty: {
    select: {
      id: true,
      name: true,
    },
  },
  service: {
    select: {
      id: true,
      description: true,
      cost: true,
      duration: true,
    },
  },
  therapist: {
    select: {
      id: true,
      firstname: true,
      lastname: true,
      email: true,
    },
  },
  patient: {
    select: {
      id: true,
      firstname: true,
      lastname: true,
      email: true,
    },
  },
} satisfies Prisma.BookingSelect;

export type UserBookingSummary = Prisma.BookingGetPayload<{
  select: typeof userBookingSelect;
}>;
