// Interfaz para crear una nueva ubicación
export interface CreateLocationData {
  address: string;
  logo?: string;
  title: string;
  description?: string;
  lat?: number;
  lon?: number;
}

// Interfaz para actualizar una ubicación existente
export interface UpdateLocationData {
  address?: string;
  logo?: string;
  title?: string;
  description?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
}
