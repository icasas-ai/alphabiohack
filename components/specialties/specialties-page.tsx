"use client"

import {
  AlertCircle,
  ArrowLeft,
  Clock,
  DollarSign,
  Plus,
  Search,
  Stethoscope
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { CreateServiceData, CreateSpecialtyData, UpdateServiceData, UpdateSpecialtyData } from '@/types';
import { DeleteConfirmDialog, ServiceForm, SpecialtyForm } from '@/components/specialties/specialty-forms';
import React, { useEffect, useMemo, useState } from 'react';
import { ServiceList, SpecialtyList, StatsCard } from '@/components/specialties/specialty-components';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useSpecialties } from '@/contexts/specialties-context';
import { useTranslations } from 'next-intl';

// Tipos para los formularios
interface ServiceFormData {
  description: string;
  cost: number;
  duration: number;
}









// Estados para los formularios
interface FormStates {
  specialtyForm: {
    open: boolean;
    mode: 'create' | 'edit';
    data?: { id?: string; name: string; description?: string };
  };
  serviceForm: {
    open: boolean;
    mode: 'create' | 'edit';
    specialtyId?: string;
    data?: { description: string; cost: number; duration: number };
  };
  deleteDialog: {
    open: boolean;
    type: 'specialty' | 'service';
    id?: string;
    name?: string;
  };
}

// Componente principal de la página de Specialties
export function SpecialtiesPage() {
  const t = useTranslations('SpecialtiesUI');
  const tCommon = useTranslations('Common');
  const {
    state,
    isPending,
    createSpecialty,
    updateSpecialty,
    deleteSpecialty,
    createService,
    updateService,
    deleteService,
    refreshSpecialties,
  } = useSpecialties();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [formStates, setFormStates] = useState<FormStates>({
    specialtyForm: { open: false, mode: 'create' },
    serviceForm: { open: false, mode: 'create' },
    deleteDialog: { open: false, type: 'specialty' },
  });

  // Cargar especialidades al montar el componente
  useEffect(() => {
    refreshSpecialties();
  }, [refreshSpecialties]);

  // Filtrar especialidades basado en el término de búsqueda
  const filteredSpecialties = useMemo(() => {
    if (!searchTerm.trim()) return state.specialties;
    
    const term = searchTerm.toLowerCase();
    return state.specialties.filter(specialty =>
      specialty.name.toLowerCase().includes(term) ||
      specialty.description?.toLowerCase().includes(term) ||
      specialty.services.some(service => 
        service.description.toLowerCase().includes(term)
      )
    );
  }, [state.specialties, searchTerm]);

  // Estadísticas generales
  const stats = useMemo(() => {
    const totalSpecialties = state.specialties.length;
    const totalServices = state.specialties.reduce((sum, specialty) => sum + specialty.services.length, 0);
    const totalCost = state.specialties.reduce((sum, specialty) => 
      sum + specialty.services.reduce((serviceSum, service) => serviceSum + service.cost, 0), 0
    );
    const averageCost = totalServices > 0 ? totalCost / totalServices : 0;

    return {
      totalSpecialties,
      totalServices,
      totalCost,
      averageCost,
    };
  }, [state.specialties]);

  // Manejar apertura de formularios
  const openSpecialtyForm = (mode: 'create' | 'edit', data?: { id?: string; name: string; description?: string }) => {
    setFormStates(prev => ({
      ...prev,
      specialtyForm: { open: true, mode, data },
    }));
  };

  const openServiceForm = (mode: 'create' | 'edit', specialtyId?: string, data?: { description: string; cost: number; duration: number }) => {
    setFormStates(prev => ({
      ...prev,
      serviceForm: { open: true, mode, specialtyId, data },
    }));
  };

  const openDeleteDialog = (type: 'specialty' | 'service', id: string, name: string) => {
    setFormStates(prev => ({
      ...prev,
      deleteDialog: { open: true, type, id, name },
    }));
  };

  // Cerrar todos los formularios
  const closeAllForms = () => {
    setFormStates({
      specialtyForm: { open: false, mode: 'create' },
      serviceForm: { open: false, mode: 'create' },
      deleteDialog: { open: false, type: 'specialty' },
    });
  };

  const findDuplicateSpecialty = (name: string, excludeId?: string) => {
    const normalized = name.trim().toLowerCase();
    if (!normalized) return undefined;

    return state.specialties.find((specialty) => {
      if (excludeId && specialty.id === excludeId) {
        return false;
      }

      return specialty.name.trim().toLowerCase() === normalized;
    });
  };

  // Manejar creación de especialidad
  const handleCreateSpecialty = async (data: CreateSpecialtyData) => {
    if (findDuplicateSpecialty(data.name)) {
      toast.error('A specialty with this name already exists');
      return;
    }

    try {
      await createSpecialty(data);
    } catch {
      // El error ya se maneja en el contexto
    }
  };

  // Manejar actualización de especialidad
  const handleUpdateSpecialty = async (data: UpdateSpecialtyData) => {
    const specialtyId = formStates.specialtyForm.data?.id;
    if (!specialtyId) return;

    if (findDuplicateSpecialty(data.name ?? "", specialtyId)) {
      toast.error('A specialty with this name already exists');
      return;
    }

    try {
      await updateSpecialty(specialtyId, data);
    } catch {
      // El error ya se maneja en el contexto
    }
  };

  // Manejar eliminación de especialidad
  const handleDeleteSpecialty = async () => {
    if (!formStates.deleteDialog.id) return;

    try {
      await deleteSpecialty(formStates.deleteDialog.id);
      closeAllForms();
    } catch {
      // El error ya se maneja en el contexto
    }
  };

  // Manejar creación de servicio
  const handleCreateService = async (data: ServiceFormData) => {
    if (!formStates.serviceForm.specialtyId) return;

    const serviceData: CreateServiceData = {
      ...data,
      specialtyId: formStates.serviceForm.specialtyId,
    };

    try {
      await createService(formStates.serviceForm.specialtyId, serviceData);
    } catch {
      // El error ya se maneja en el contexto
    }
  };

  // Manejar actualización de servicio
  const handleUpdateService = async (data: UpdateServiceData) => {
    if (!formStates.serviceForm.specialtyId || !formStates.serviceForm.data) return;

    const service = state.specialties
      .find(s => s.id === formStates.serviceForm.specialtyId)
      ?.services.find(service => service.description === formStates.serviceForm.data?.description);
    
    if (!service) return;

    try {
      await updateService(service.id, data);
    } catch {
      // El error ya se maneja en el contexto
    }
  };

  // Manejar eliminación de servicio
  const handleDeleteService = async () => {
    if (!formStates.deleteDialog.id) return;

    try {
      await deleteService(formStates.deleteDialog.id);
      closeAllForms();
    } catch {
      // El error ya se maneja en el contexto
    }
  };

  // Obtener especialidad seleccionada
  const currentSpecialty = useMemo(() => {
    if (!selectedSpecialty) return null;
    return state.specialties.find(s => s.id === selectedSpecialty) || null;
  }, [selectedSpecialty, state.specialties]);

  // Mostrar vista de servicios si hay una especialidad seleccionada
  if (selectedSpecialty && currentSpecialty) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        {/* Header con navegación */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedSpecialty(null)}
              disabled={isPending}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {tCommon('back')}
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {currentSpecialty.name}
              </h1>
              {currentSpecialty.description && (
                <p className="text-muted-foreground">{currentSpecialty.description}</p>
              )}
            </div>
          </div>
          <Button
            onClick={() => openServiceForm('create', selectedSpecialty)}
            disabled={isPending}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('addService')}
          </Button>
        </div>

        {/* Estadísticas de la especialidad */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title={t('stats.totalServices')}
            value={currentSpecialty.services.length}
            icon={Stethoscope}
          />
          <StatsCard
            title={t('stats.averageCost')}
            value={`$${currentSpecialty.services.length > 0 
              ? (currentSpecialty.services.reduce((sum, s) => sum + s.cost, 0) / currentSpecialty.services.length).toFixed(0)
              : '0'
            }`}
            icon={DollarSign}
          />
          <StatsCard
            title={t('stats.averageDuration')}
            value={currentSpecialty.services.length > 0 
              ? `${Math.round(currentSpecialty.services.reduce((sum, s) => sum + s.duration, 0) / currentSpecialty.services.length)}m`
              : '0m'
            }
            icon={Clock}
          />
        </div>

        {/* Lista de servicios */}
        <ServiceList
          services={currentSpecialty.services}
          specialtyName={currentSpecialty.name}
          loading={state.loading}
          onEdit={(service) => openServiceForm('edit', selectedSpecialty, {
            description: service.description,
            cost: service.cost,
            duration: service.duration,
          })}
          onDelete={(serviceId) => openDeleteDialog('service', serviceId, 
            currentSpecialty.services.find(s => s.id === serviceId)?.description || ''
          )}
          onAddService={() => openServiceForm('create', selectedSpecialty)}
          isPending={isPending}
        />

        {/* Formularios */}
        <ServiceForm
          open={formStates.serviceForm.open}
          onOpenChange={(open) => setFormStates(prev => ({ ...prev, serviceForm: { ...prev.serviceForm, open } }))}
          onSubmit={formStates.serviceForm.mode === 'create' ? handleCreateService : handleUpdateService}
          initialData={formStates.serviceForm.data}
          title={formStates.serviceForm.mode === 'create' ? t('forms.createServiceTitle') : t('forms.editServiceTitle')}
          description={formStates.serviceForm.mode === 'create' 
            ? t('forms.createServiceDescription')
            : t('forms.editServiceDescription')
          }
          isPending={isPending}
        />

        <DeleteConfirmDialog
          open={formStates.deleteDialog.open && formStates.deleteDialog.type === 'service'}
          onOpenChange={(open) => setFormStates(prev => ({ ...prev, deleteDialog: { ...prev.deleteDialog, open } }))}
          onConfirm={handleDeleteService}
          title={t('deletes.deleteServiceTitle')}
          description={t('deletes.deleteServiceDescription')}
          itemName={formStates.deleteDialog.name || ''}
          isPending={isPending}
        />
      </div>
    );
  }

  // Vista principal de especialidades
  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('pageTitle')}</h1>
          <p className="text-muted-foreground">
            {t('pageSubtitle')}
          </p>
        </div>
        <Button
          onClick={() => openSpecialtyForm('create')}
          disabled={isPending}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('newSpecialty')}
        </Button>
      </div>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title={t('stats.totalSpecialties')}
          value={stats.totalSpecialties}
          icon={Stethoscope}
        />
        <StatsCard
          title={t('stats.totalServices')}
          value={stats.totalServices}
          icon={Stethoscope}
        />
        <StatsCard
          title={t('stats.totalCost')}
          value={`$${stats.totalCost.toFixed(0)}`}
          icon={DollarSign}
        />
        <StatsCard
          title={t('stats.averageCost')}
          value={`$${stats.averageCost.toFixed(0)}`}
          icon={DollarSign}
          description={t('stats.averageCostDescription')}
        />
      </div>

      {/* Barra de búsqueda */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              disabled={isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Mensaje de error */}
      {state.error && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">{tCommon('error')}:</span>
              <span>{state.error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de especialidades */}
      <SpecialtyList
        specialties={filteredSpecialties}
        loading={state.loading}
        onEdit={(specialty) => openSpecialtyForm('edit', {
          id: specialty.id,
          name: specialty.name,
          description: specialty.description || '',
        })}
        onDelete={(id) => {
          const specialty = state.specialties.find(s => s.id === id);
          openDeleteDialog('specialty', id, specialty?.name || '');
        }}
        onViewServices={(specialty) => setSelectedSpecialty(specialty.id)}
        onAddService={(specialtyId) => openServiceForm('create', specialtyId)}
        isPending={isPending}
      />

      {/* Formularios */}
      <SpecialtyForm
        open={formStates.specialtyForm.open}
        onOpenChange={(open) => setFormStates(prev => ({ ...prev, specialtyForm: { ...prev.specialtyForm, open } }))}
        onSubmit={formStates.specialtyForm.mode === 'create' ? handleCreateSpecialty : handleUpdateSpecialty}
        initialData={formStates.specialtyForm.data}
        title={formStates.specialtyForm.mode === 'create' ? t('forms.createSpecialtyTitle') : t('forms.editSpecialtyTitle')}
        description={formStates.specialtyForm.mode === 'create' 
          ? t('forms.createSpecialtyDescription')
          : t('forms.editSpecialtyDescription')
        }
        isPending={isPending}
      />

      <DeleteConfirmDialog
        open={formStates.deleteDialog.open && formStates.deleteDialog.type === 'specialty'}
        onOpenChange={(open) => setFormStates(prev => ({ ...prev, deleteDialog: { ...prev.deleteDialog, open } }))}
        onConfirm={handleDeleteSpecialty}
        title={t('deletes.deleteSpecialtyTitle')}
        description={t('deletes.deleteSpecialtyDescription')}
        itemName={formStates.deleteDialog.name || ''}
        isPending={isPending}
      />
    </div>
  );
}
