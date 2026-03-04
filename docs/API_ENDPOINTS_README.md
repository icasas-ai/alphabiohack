# API Endpoints Constants

Este archivo centraliza todas las rutas de la API para evitar magic strings y facilitar el mantenimiento.

## Uso

### Importar las constantes

```typescript
import { API_ENDPOINTS } from "@/constants";
```

### Ejemplos de uso

#### Endpoints básicos

```typescript
// En lugar de:
fetch("/api/locations");

// Usar:
fetch(API_ENDPOINTS.LOCATIONS.BASE);
```

#### Endpoints con parámetros

```typescript
// En lugar de:
fetch(`/api/locations/${id}`);

// Usar:
fetch(API_ENDPOINTS.LOCATIONS.BY_ID(id));
```

#### Endpoints con query parameters

```typescript
// En lugar de:
fetch(`/api/locations?search=${encodeURIComponent(query)}`);

// Usar:
fetch(API_ENDPOINTS.LOCATIONS.SEARCH(query));
```

#### Endpoints con múltiples parámetros

```typescript
// En lugar de:
fetch(`/api/locations?lat=${lat}&lon=${lon}&radius=${radius}`);

// Usar:
fetch(API_ENDPOINTS.LOCATIONS.NEARBY(lat, lon, radius));
```

## Estructura de constantes

```typescript
export const API_ENDPOINTS = {
  // Autenticación y usuarios
  USER: {
    BASE: "/api/user",
    BOOKINGS: "/api/user/bookings",
  },

  // Ubicaciones
  LOCATIONS: {
    BASE: "/api/locations",
    BY_ID: (id: string) => `/api/locations/${id}`,
    SEARCH: (query: string) =>
      `/api/locations?search=${encodeURIComponent(query)}`,
    NEARBY: (lat: number, lon: number, radius: number = 10) =>
      `/api/locations?lat=${lat}&lon=${lon}&radius=${radius}`,
  },

  // Terapeutas
  THERAPISTS: {
    BASE: "/api/therapists",
    BOOKINGS: "/api/therapists/bookings",
    BY_ID: (id: string) => `/api/therapists/${id}`,
  },

  // Disponibilidad fechada
  AVAILABILITY: {
    PERIODS: "/api/availability/periods",
    PERIOD_BY_ID: (id: string) => `/api/availability/periods/${id}`,
    DAY_BY_ID: (id: string) => `/api/availability/days/${id}`,
    CALENDAR: "/api/availability/calendar",
    RESTORE_EXCLUDED_DATE: (periodId: string) =>
      `/api/availability/periods/${periodId}`,
  },

  // Citas/Bookings
  BOOKINGS: {
    BASE: "/api/bookings",
    AVAILABILITY: "/api/bookings/availability",
    STATS: "/api/bookings/stats",
    BY_ID: (id: string) => `/api/bookings/${id}`,
  },

  // Servicios y especialidades
  SERVICES: {
    BASE: "/api/services",
  },

  SPECIALTIES: {
    BASE: "/api/specialties",
  },

  // Horarios de atención
  BUSINESS_HOURS: {
    BY_LOCATION: (locationId: string) =>
      `/api/locations/${locationId}/business-hours`,
    BY_ID: (locationId: string, id: string) =>
      `/api/locations/${locationId}/business-hours/${id}`,
    BY_DAY_AND_LOCATION: (locationId: string, dayOfWeek: string) =>
      `/api/locations/${locationId}/business-hours?dayOfWeek=${dayOfWeek}`,
  },
} as const;
```

## Beneficios

1. **Mantenibilidad**: Cambios en las rutas se hacen en un solo lugar
2. **Type Safety**: TypeScript puede validar el uso correcto de las constantes
3. **IntelliSense**: Autocompletado en el IDE
4. **Refactoring**: Fácil renombrado de endpoints
5. **Consistencia**: Evita errores de tipeo en las rutas
6. **Documentación**: Las constantes sirven como documentación de la API

## Hooks actualizados

Los siguientes hooks han sido actualizados para usar las constantes:

- `useLocationOperations` - Operaciones CRUD de ubicaciones
- `useLocations` - Obtener y buscar ubicaciones
- `useUserBookings` - Citas del usuario/terapeuta
- `useCreateBooking` - Crear nuevas citas
- `useSpecialtiesServices` - Especialidades y servicios
- `useAvailabilityCalendar` - Calendario de disponibilidad fechada
- `useTherapists` - Carga de terapeutas públicos

## Agregar nuevos endpoints

Para agregar nuevos endpoints:

1. Agregar la constante en `API_ENDPOINTS`
2. Actualizar los hooks que usen el endpoint
3. Actualizar esta documentación si es necesario

### Ejemplo de nuevo endpoint

```typescript
// En constants/index.ts
export const API_ENDPOINTS = {
  // ... otros endpoints
  NEW_FEATURE: {
    BASE: "/api/new-feature",
    BY_ID: (id: string) => `/api/new-feature/${id}`,
    CUSTOM: (param1: string, param2: number) =>
      `/api/new-feature/${param1}?value=${param2}`,
  },
} as const;
```

```typescript
// En el hook
import { API_ENDPOINTS } from "@/constants";

const response = await fetch(API_ENDPOINTS.NEW_FEATURE.BASE);
```
