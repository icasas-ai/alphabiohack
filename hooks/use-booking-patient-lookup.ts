"use client"

import { useEffect, useState } from "react"

import {
  isValidPhoneInput,
  normalizePhoneInput,
} from "@/lib/validation/form-fields"

export type BookingPatientLookupState =
  | { kind: "idle" }
  | { kind: "loading" }
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
  | { kind: "error" }

type LookupResponse = {
  success?: boolean
  data?: Exclude<BookingPatientLookupState, { kind: "idle" } | { kind: "loading" } | { kind: "error" }>
}

export function useBookingPatientLookup({
  locationId,
  phone,
}: {
  locationId: string | null
  phone: string
}) {
  const [lookup, setLookup] = useState<BookingPatientLookupState>({ kind: "idle" })

  useEffect(() => {
    const normalizedPhone = normalizePhoneInput(phone)
    const canLookup =
      Boolean(locationId) &&
      isValidPhoneInput(normalizedPhone)

    if (!canLookup || !locationId) {
      setLookup({ kind: "idle" })
      return
    }

    const controller = new AbortController()
    const timeoutId = window.setTimeout(async () => {
      try {
        setLookup({ kind: "loading" })

        const response = await fetch("/api/public/patient-lookup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            locationId,
            phone: normalizedPhone,
          }),
          signal: controller.signal,
        })

        const result = (await response.json().catch(() => null)) as LookupResponse | null

        if (!response.ok || !result?.data) {
          throw new Error("lookup_failed")
        }

        setLookup(result.data)
      } catch (error) {
        if ((error as { name?: string }).name === "AbortError") {
          return
        }

        setLookup({ kind: "error" })
      }
    }, 350)

    return () => {
      controller.abort()
      window.clearTimeout(timeoutId)
    }
  }, [locationId, phone])

  return lookup
}
