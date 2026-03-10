import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import {
  isValidPhoneInput,
  normalizePhoneInput,
} from "@/lib/validation/form-fields"
import { lookupPatientProfileForBooking } from "@/services/patient-profile.service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const locationId =
      typeof body.locationId === "string" ? body.locationId.trim() : ""
    const phone = normalizePhoneInput(body.phone)

    if (!locationId || !phone) {
      return NextResponse.json(
        { success: false, error: "locationId and phone are required." },
        { status: 400 },
      )
    }

    if (!isValidPhoneInput(phone)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid phone number." },
        { status: 400 },
      )
    }

    const location = await prisma.location.findUnique({
      where: { id: locationId },
      select: { companyId: true },
    })

    if (!location?.companyId) {
      return NextResponse.json(
        { success: false, error: "Location not found." },
        { status: 404 },
      )
    }

    const match = await lookupPatientProfileForBooking({
      companyId: location.companyId,
      phone,
    })

    return NextResponse.json({
      success: true,
      data: match,
    })
  } catch (error) {
    console.error("Error looking up patient profile:", error)
    return NextResponse.json(
      { success: false, error: "Error looking up patient profile." },
      { status: 500 },
    )
  }
}
