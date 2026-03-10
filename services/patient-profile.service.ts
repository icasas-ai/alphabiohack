import { CompanyMembershipRole, UserRole } from "@/lib/prisma-client"
import { prisma } from "@/lib/prisma"
import { normalizePhoneInput, normalizeWhitespace } from "@/lib/validation/form-fields"

type BookingPatientLookupInput = {
  companyId: string
  email?: string
  phone: string
}

type EnsureBookingPatientProfileInput = BookingPatientLookupInput & {
  email: string
  firstname: string
  lastname: string
}

export type BookingPatientLookupResult =
  | {
      kind: "existingProfile"
      patientId: string
      firstname: string
      lastname: string
      email: string
      phone: string
    }
  | {
      kind: "previousBooking"
      firstname: string
      lastname: string
      email: string
      phone: string
    }
  | {
      kind: "newProfile"
      email: string
      phone: string
    }

const patientProfileSelect = {
  id: true,
  firstname: true,
  lastname: true,
  email: true,
  telefono: true,
} as const

async function findUniquePatientByPhone(companyId: string, phone: string) {
  const matches = await prisma.user.findMany({
    where: {
      telefono: phone,
      companyMemberships: {
        some: {
          companyId,
          role: CompanyMembershipRole.Patient,
        },
      },
    },
    select: patientProfileSelect,
    take: 2,
  })

  return matches.length === 1 ? matches[0] : null
}

async function findLinkedPatientFromPreviousBooking(companyId: string, phone: string) {
  const previousLinkedBooking = await prisma.booking.findFirst({
    where: {
      companyId,
      phone,
      patientId: {
        not: null,
      },
    },
    orderBy: [{ bookingSchedule: "desc" }, { createdAt: "desc" }],
    select: {
      patient: {
        select: patientProfileSelect,
      },
    },
  })

  return previousLinkedBooking?.patient ?? null
}

export async function lookupPatientProfileForBooking({
  companyId,
  email,
  phone,
}: BookingPatientLookupInput): Promise<BookingPatientLookupResult> {
  const normalizedEmail = typeof email === "string" ? email : ""
  const emailMatch = normalizedEmail
    ? await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: patientProfileSelect,
      })
    : null

  if (emailMatch) {
    return {
      kind: "existingProfile",
      patientId: emailMatch.id,
      firstname: emailMatch.firstname,
      lastname: emailMatch.lastname,
      email: emailMatch.email,
      phone: normalizePhoneInput(emailMatch.telefono || "") || phone,
    }
  }

  const phoneProfile =
    (await findUniquePatientByPhone(companyId, phone)) ??
    (await findLinkedPatientFromPreviousBooking(companyId, phone))

  if (phoneProfile) {
    return {
      kind: "previousBooking",
      firstname: phoneProfile.firstname,
      lastname: phoneProfile.lastname,
      email: phoneProfile.email,
      phone: normalizePhoneInput(phoneProfile.telefono || "") || phone,
    }
  }

  const previousBooking = await prisma.booking.findFirst({
    where: {
      companyId,
      phone,
    },
    orderBy: [{ bookingSchedule: "desc" }, { createdAt: "desc" }],
    select: {
      firstname: true,
      lastname: true,
      email: true,
      phone: true,
    },
  })

  if (previousBooking) {
    return {
      kind: "previousBooking",
      firstname: previousBooking.firstname,
      lastname: previousBooking.lastname,
      email: previousBooking.email,
      phone: previousBooking.phone,
    }
  }

  return {
    kind: "newProfile",
    email: normalizedEmail,
    phone,
  }
}

export async function ensurePatientProfileForBooking({
  companyId,
  firstname,
  lastname,
  email,
  phone,
}: EnsureBookingPatientProfileInput): Promise<string> {
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      firstname: true,
      lastname: true,
      telefono: true,
      role: true,
      companyMemberships: {
        where: {
          companyId,
        },
        select: {
          id: true,
        },
      },
    },
  })

  if (existingUser) {
    const normalizedFirstname = normalizeWhitespace(existingUser.firstname)
    const normalizedLastname = normalizeWhitespace(existingUser.lastname)
    const normalizedPhone = normalizePhoneInput(existingUser.telefono || "")
    const nextRoles = existingUser.role.includes(UserRole.Patient)
      ? existingUser.role
      : [...existingUser.role, UserRole.Patient]
    const nextFirstname = normalizedFirstname || firstname
    const nextLastname = normalizedLastname || lastname
    const nextPhone = normalizedPhone || phone
    const needsUserUpdate =
      nextFirstname !== existingUser.firstname ||
      nextLastname !== existingUser.lastname ||
      nextPhone !== normalizedPhone ||
      nextRoles.length !== existingUser.role.length
    const needsCompanyMembership = existingUser.companyMemberships.length === 0

    await prisma.$transaction(async (tx) => {
      if (needsUserUpdate) {
        await tx.user.update({
          where: { id: existingUser.id },
          data: {
            firstname: nextFirstname,
            lastname: nextLastname,
            telefono: nextPhone || null,
            role: nextRoles,
          },
        })
      }

      if (needsCompanyMembership) {
        await tx.companyMembership.create({
          data: {
            companyId,
            userId: existingUser.id,
            role: CompanyMembershipRole.Patient,
          },
        })
      }

      await tx.booking.updateMany({
        where: {
          companyId,
          patientId: null,
          email,
        },
        data: {
          patientId: existingUser.id,
        },
      })
    })

    return existingUser.id
  }

  const createdUser = await prisma.user.create({
    data: {
      email,
      firstname,
      lastname,
      telefono: phone,
      role: [UserRole.Patient],
      companyMemberships: {
        create: {
          companyId,
          role: CompanyMembershipRole.Patient,
        },
      },
    },
    select: {
      id: true,
    },
  })

  await prisma.booking.updateMany({
    where: {
      companyId,
      patientId: null,
      email,
    },
    data: {
      patientId: createdUser.id,
    },
  })

  return createdUser.id
}
