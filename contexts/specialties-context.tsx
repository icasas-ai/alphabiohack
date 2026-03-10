"use client"

import type { CreateServiceData, CreateSpecialtyData, UpdateServiceData, UpdateSpecialtyData } from '@/types';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type {
  Service,
  Specialty,
  SpecialtyWithServices
} from '@/types/api';
import { servicesApi, specialtiesApi } from '@/lib/api';

import { toast } from 'sonner';
import { useTransition } from 'react';

// Tipos para el estado
interface SpecialtiesState {
  specialties: SpecialtyWithServices[];
  loading: boolean;
  error: string | null;
}

interface SpecialtiesContextType {
  state: SpecialtiesState;
  isPending: boolean;
  
  // Acciones CRUD
  createSpecialty: (data: CreateSpecialtyData) => Promise<void>;
  updateSpecialty: (id: string, data: UpdateSpecialtyData) => Promise<void>;
  deleteSpecialty: (id: string) => Promise<void>;
  createService: (specialtyId: string, data: CreateServiceData) => Promise<void>;
  updateService: (serviceId: string, data: UpdateServiceData) => Promise<void>;
  deleteService: (serviceId: string) => Promise<void>;
  
  // Utilidades
  refreshSpecialties: () => Promise<void>;
  getSpecialtyById: (id: string) => SpecialtyWithServices | undefined;
  getServicesBySpecialty: (specialtyId: string) => Service[];
}

const SpecialtiesContext = createContext<SpecialtiesContextType | undefined>(undefined);

// Provider simplificado
export function SpecialtiesProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SpecialtiesState>({
    specialties: [],
    loading: false,
    error: null,
  });
  const [isPending, startTransition] = useTransition();

  // Función para actualizar el estado
  const updateState = useCallback((updates: Partial<SpecialtiesState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Cargar especialidades
  const refreshSpecialties = useCallback(async () => {
    try {
      updateState({ loading: true, error: null });
      const specialties = await specialtiesApi.getAllSpecialties();
      updateState({ specialties, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar especialidades';
      updateState({ error: errorMessage, loading: false });
      toast.error(errorMessage);
    }
  }, [updateState]);

  // Crear especialidad
  const handleCreateSpecialty = useCallback(async (data: CreateSpecialtyData) => {
    try {
      const newSpecialty = await specialtiesApi.createSpecialty(data);
      updateState({
        specialties: [...state.specialties, { ...newSpecialty, services: [] }],
      });
      toast.success('Especialidad creada exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear especialidad';
      toast.error(errorMessage);
      throw error;
    }
  }, [state.specialties, updateState]);

  // Actualizar especialidad
  const handleUpdateSpecialty = useCallback(async (id: string, data: UpdateSpecialtyData) => {
    try {
      const updatedSpecialty = await specialtiesApi.updateSpecialty(id, data);
      updateState({
        specialties: state.specialties.map(specialty =>
          specialty.id === id ? { ...specialty, ...updatedSpecialty } : specialty
        ),
      });
      toast.success('Especialidad actualizada exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar especialidad';
      toast.error(errorMessage);
      throw error;
    }
  }, [state.specialties, updateState]);

  // Eliminar especialidad
  const handleDeleteSpecialty = useCallback(async (id: string) => {
    try {
      await specialtiesApi.deleteSpecialty(id);
      updateState({
        specialties: state.specialties.filter(specialty => specialty.id !== id),
      });
      toast.success('Especialidad eliminada exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar especialidad';
      toast.error(errorMessage);
      throw error;
    }
  }, [state.specialties, updateState]);

  // Crear servicio
  const handleCreateService = useCallback(async (specialtyId: string, data: CreateServiceData) => {
    try {
      const newService = await servicesApi.createService(data);
      updateState({
        specialties: state.specialties.map(specialty =>
          specialty.id === specialtyId
            ? { ...specialty, services: [...specialty.services, newService] }
            : specialty
        ),
      });
      toast.success('Servicio creado exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear servicio';
      toast.error(errorMessage);
      throw error;
    }
  }, [state.specialties, updateState]);

  // Actualizar servicio
  const handleUpdateService = useCallback(async (serviceId: string, data: UpdateServiceData) => {
    try {
      const updatedService = await servicesApi.updateService(serviceId, data);
      updateState({
        specialties: state.specialties.map(specialty => ({
          ...specialty,
          services: specialty.services.map(service =>
            service.id === serviceId ? updatedService : service
          ),
        })),
      });
      toast.success('Servicio actualizado exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar servicio';
      toast.error(errorMessage);
      throw error;
    }
  }, [state.specialties, updateState]);

  // Eliminar servicio
  const handleDeleteService = useCallback(async (serviceId: string) => {
    try {
      await servicesApi.deleteService(serviceId);
      updateState({
        specialties: state.specialties.map(specialty => ({
          ...specialty,
          services: specialty.services.filter(service => service.id !== serviceId),
        })),
      });
      toast.success('Servicio eliminado exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar servicio';
      toast.error(errorMessage);
      throw error;
    }
  }, [state.specialties, updateState]);

  // Utilidades
  const getSpecialtyById = useCallback((id: string) => {
    return state.specialties.find(specialty => specialty.id === id);
  }, [state.specialties]);

  const getServicesBySpecialty = useCallback((specialtyId: string): Service[] => {
    const specialty = state.specialties.find(s => s.id === specialtyId);
    return specialty?.services || [];
  }, [state.specialties]);

  // Cargar datos al montar
  useEffect(() => {
    refreshSpecialties();
  }, [refreshSpecialties]);

  // Memoizar el valor del contexto
  const contextValue = useMemo(() => ({
    state,
    isPending,
    createSpecialty: handleCreateSpecialty,
    updateSpecialty: handleUpdateSpecialty,
    deleteSpecialty: handleDeleteSpecialty,
    createService: handleCreateService,
    updateService: handleUpdateService,
    deleteService: handleDeleteService,
    refreshSpecialties,
    getSpecialtyById,
    getServicesBySpecialty,
  }), [
    state,
    isPending,
    handleCreateSpecialty,
    handleUpdateSpecialty,
    handleDeleteSpecialty,
    handleCreateService,
    handleUpdateService,
    handleDeleteService,
    refreshSpecialties,
    getSpecialtyById,
    getServicesBySpecialty,
  ]);

  return (
    <SpecialtiesContext.Provider value={contextValue}>
      {children}
    </SpecialtiesContext.Provider>
  );
}

// Hook personalizado
export function useSpecialties() {
  const context = useContext(SpecialtiesContext);
  if (context === undefined) {
    throw new Error('useSpecialties debe ser usado dentro de un SpecialtiesProvider');
  }
  return context;
}
