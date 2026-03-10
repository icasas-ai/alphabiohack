# Contexts

This folder contains the main React context providers used by the app.

## Booking Wizard Context

Primary file:

- [booking-wizard-context.tsx](./booking-wizard-context.tsx)

The booking wizard context stores the shared state for the public booking flow.

### Current data shape

```ts
interface BookingFormData {
  appointmentType: BookingType;
  locationId: string | null;
  specialtyId: string | null;
  selectedServiceIds: string[];
  selectedDate: Date | null;
  selectedTime: string;
  therapistId: string | null;
  sessionDurationMinutes: number | null;
  basicInfo: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    givenConsent: boolean;
    bookingNotes: string;
  };
  status: BookingStatus;
  createdBooking: unknown | null;
}
```

### Exposed API

- `data`
- `update(updates)`
- `reset()`
- `setData(...)`
- `canProceedToStep(step)`
- `getStepValidation(step)`

### Important behavior

- in single-therapist public mode, `therapistId` is auto-populated from the resolved public therapist profile
- `sessionDurationMinutes` is updated from the selected availability day
- step validation depends on therapist, location, specialty, service, date, time, and basic info depending on the step

### Example

```tsx
import { BookingWizardProvider, useBookingWizard } from "@/contexts";

function Example() {
  const { data, update } = useBookingWizard();

  return (
    <button
      onClick={() =>
        update({
          locationId: "location-id",
          selectedTime: "10:00",
        })
      }
    >
      Current time: {data.selectedTime}
    </button>
  );
}

export function WrappedExample() {
  return (
    <BookingWizardProvider>
      <Example />
    </BookingWizardProvider>
  );
}
```

## Other Contexts

This folder also contains other state providers used by protected and admin views, such as the user/session context and specialties context. The booking wizard context is the most important one for public booking behavior.
