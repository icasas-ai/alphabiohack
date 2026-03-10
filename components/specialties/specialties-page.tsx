"use client"

import {
  AlertCircle,
  Clock,
  DollarSign,
  Loader2,
  Plus,
  Search,
  Stethoscope,
  Trash2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { CreateServiceData, CreateSpecialtyData, UpdateServiceData, UpdateSpecialtyData } from '@/types';
import { DeleteConfirmDialog, SpecialtyForm } from '@/components/specialties/specialty-forms';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SpecialtyList, StatsCard } from '@/components/specialties/specialty-components';
import type { Service } from '@/types/api';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { specialtiesApi } from '@/lib/api';
import { toast } from 'sonner';
import { useSpecialties } from '@/contexts/specialties-context';
import { useTranslations } from 'next-intl';

interface ServiceFormData {
  description: string;
  cost: number;
  duration: number;
}

interface ServiceDraft {
  description: string;
  cost: string;
  duration: string;
}

interface ServiceDraftErrors {
  description?: string;
  cost?: string;
  duration?: string;
}

const DEFAULT_SPECIALTY_NAME = 'General Services';
const DEFAULT_SPECIALTY_DESCRIPTION = 'Auto-generated category used to manage services.';
const EMPTY_SERVICE_DRAFT: ServiceDraft = {
  description: '',
  cost: '',
  duration: '60',
};

interface FormStates {
  specialtyForm: {
    open: boolean;
    mode: 'create' | 'edit';
    data?: { id?: string; name: string; description?: string };
  };
  deleteDialog: {
    open: boolean;
    type: 'specialty' | 'service';
    id?: string;
    name?: string;
  };
}

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
  const autoCreateInFlightRef = useRef(false);

  const [formStates, setFormStates] = useState<FormStates>({
    specialtyForm: { open: false, mode: 'create' },
    deleteDialog: { open: false, type: 'specialty' },
  });

  const [serviceEditorMode, setServiceEditorMode] = useState<'create' | 'edit'>('create');
  const [activeServiceId, setActiveServiceId] = useState<string | null>(null);
  const [serviceDraft, setServiceDraft] = useState<ServiceDraft>(EMPTY_SERVICE_DRAFT);
  const [serviceDraftErrors, setServiceDraftErrors] = useState<ServiceDraftErrors>({});
  const [isSavingService, setIsSavingService] = useState(false);
  const [isDeletingService, setIsDeletingService] = useState(false);

  useEffect(() => {
    if (state.loading) return;

    if (
      selectedSpecialty &&
      !state.specialties.some((specialty) => specialty.id === selectedSpecialty)
    ) {
      setSelectedSpecialty(null);
      return;
    }

    if (state.specialties.length > 0) {
      autoCreateInFlightRef.current = false;

      if (!selectedSpecialty) {
        setSelectedSpecialty(state.specialties[0].id);
      }
      return;
    }

    if (autoCreateInFlightRef.current || isPending) return;

    autoCreateInFlightRef.current = true;
    void (async () => {
      try {
        await specialtiesApi.createSpecialty({
          name: DEFAULT_SPECIALTY_NAME,
          description: DEFAULT_SPECIALTY_DESCRIPTION,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        if (!message.includes('Specialty already exists')) {
          toast.error(message || tCommon('error'));
        }
      } finally {
        autoCreateInFlightRef.current = false;
        await refreshSpecialties();
      }
    })();
  }, [isPending, refreshSpecialties, selectedSpecialty, state.loading, state.specialties, tCommon]);

  const filteredSpecialties = useMemo(() => {
    if (!searchTerm.trim()) return state.specialties;

    const term = searchTerm.toLowerCase();
    return state.specialties.filter((specialty) =>
      specialty.name.toLowerCase().includes(term) ||
      specialty.description?.toLowerCase().includes(term) ||
      specialty.services.some((service) => service.description.toLowerCase().includes(term)),
    );
  }, [state.specialties, searchTerm]);

  const stats = useMemo(() => {
    const totalSpecialties = state.specialties.length;
    const totalServices = state.specialties.reduce((sum, specialty) => sum + specialty.services.length, 0);
    const totalCost = state.specialties.reduce(
      (sum, specialty) => sum + specialty.services.reduce((serviceSum, service) => serviceSum + service.cost, 0),
      0,
    );
    const averageCost = totalServices > 0 ? totalCost / totalServices : 0;

    return {
      totalSpecialties,
      totalServices,
      totalCost,
      averageCost,
    };
  }, [state.specialties]);

  const openSpecialtyForm = (mode: 'create' | 'edit', data?: { id?: string; name: string; description?: string }) => {
    setFormStates((prev) => ({
      ...prev,
      specialtyForm: { open: true, mode, data },
    }));
  };

  const openDeleteDialog = (type: 'specialty' | 'service', id: string, name: string) => {
    setFormStates((prev) => ({
      ...prev,
      deleteDialog: { open: true, type, id, name },
    }));
  };

  const closeAllForms = () => {
    setFormStates({
      specialtyForm: { open: false, mode: 'create' },
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

  const handleCreateSpecialty = async (data: CreateSpecialtyData) => {
    if (findDuplicateSpecialty(data.name)) {
      toast.error('A specialty with this name already exists');
      return;
    }

    try {
      await createSpecialty(data);
    } catch {
      // Context handles toast/error.
    }
  };

  const handleUpdateSpecialty = async (data: UpdateSpecialtyData) => {
    const specialtyId = formStates.specialtyForm.data?.id;
    if (!specialtyId) return;

    if (findDuplicateSpecialty(data.name ?? '', specialtyId)) {
      toast.error('A specialty with this name already exists');
      return;
    }

    try {
      await updateSpecialty(specialtyId, data);
    } catch {
      // Context handles toast/error.
    }
  };

  const handleDeleteSpecialty = async () => {
    if (!formStates.deleteDialog.id) return;

    try {
      await deleteSpecialty(formStates.deleteDialog.id);
      closeAllForms();
    } catch {
      // Context handles toast/error.
    }
  };

  const handleDeleteService = async () => {
    if (!formStates.deleteDialog.id) return;

    setIsDeletingService(true);
    try {
      await deleteService(formStates.deleteDialog.id);
      closeAllForms();
    } catch {
      // Context handles toast/error.
    } finally {
      setIsDeletingService(false);
    }
  };

  const currentSpecialty = useMemo(() => {
    if (!selectedSpecialty) return null;
    return state.specialties.find((specialty) => specialty.id === selectedSpecialty) || null;
  }, [selectedSpecialty, state.specialties]);

  const currentService = useMemo(() => {
    if (!currentSpecialty || !activeServiceId) return null;
    return currentSpecialty.services.find((service) => service.id === activeServiceId) || null;
  }, [activeServiceId, currentSpecialty]);
  const isServiceMutating = isPending || isSavingService || isDeletingService;

  const selectServiceForEdit = useCallback((service: Service) => {
    setServiceEditorMode('edit');
    setActiveServiceId(service.id);
    setServiceDraft({
      description: service.description,
      cost: String(service.cost),
      duration: String(service.duration),
    });
    setServiceDraftErrors({});
  }, []);

  const startCreatingService = useCallback(() => {
    setServiceEditorMode('create');
    setActiveServiceId(null);
    setServiceDraft(EMPTY_SERVICE_DRAFT);
    setServiceDraftErrors({});
  }, []);

  useEffect(() => {
    if (!currentSpecialty) return;

    if (currentSpecialty.services.length === 0) {
      if (serviceEditorMode !== 'create' || activeServiceId !== null) {
        startCreatingService();
      }
      return;
    }

    if (serviceEditorMode === 'create') {
      return;
    }

    if (!activeServiceId) {
      selectServiceForEdit(currentSpecialty.services[0]);
      return;
    }

    if (!currentSpecialty.services.some((service) => service.id === activeServiceId)) {
      selectServiceForEdit(currentSpecialty.services[0]);
    }
  }, [activeServiceId, currentSpecialty, selectServiceForEdit, serviceEditorMode, startCreatingService]);

  const validateServiceDraft = (): ServiceFormData | null => {
    const nextErrors: ServiceDraftErrors = {};
    const description = serviceDraft.description.trim();

    if (!description) {
      nextErrors.description = t('validation.service.descriptionRequired');
    }

    if (!serviceDraft.cost.trim()) {
      nextErrors.cost = t('validation.service.costRequired');
    }

    if (!serviceDraft.duration.trim()) {
      nextErrors.duration = t('validation.service.durationRequired');
    }

    const cost = Number(serviceDraft.cost);
    if (serviceDraft.cost.trim() && Number.isNaN(cost)) {
      nextErrors.cost = t('validation.service.costRequired');
    } else if (serviceDraft.cost.trim() && cost < 0) {
      nextErrors.cost = t('validation.service.costMin');
    } else if (serviceDraft.cost.trim() && cost > 10000) {
      nextErrors.cost = t('validation.service.costMax');
    }

    const duration = Number(serviceDraft.duration);
    if (serviceDraft.duration.trim() && Number.isNaN(duration)) {
      nextErrors.duration = t('validation.service.durationRequired');
    } else if (serviceDraft.duration.trim() && duration < 1) {
      nextErrors.duration = t('validation.service.durationMin');
    } else if (serviceDraft.duration.trim() && duration > 480) {
      nextErrors.duration = t('validation.service.durationMax');
    }

    setServiceDraftErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return null;
    }

    return {
      description,
      cost,
      duration,
    };
  };

  const handleServiceEditorSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!currentSpecialty) return;

    const validated = validateServiceDraft();
    if (!validated) return;

    setIsSavingService(true);
    try {
      if (serviceEditorMode === 'edit' && activeServiceId) {
        await updateService(activeServiceId, validated as UpdateServiceData);
      } else {
        const payload: CreateServiceData = {
          ...validated,
          specialtyId: currentSpecialty.id,
        };
        await createService(currentSpecialty.id, payload);
        startCreatingService();
      }
    } catch {
      // Context handles toast/error.
    } finally {
      setIsSavingService(false);
    }
  };

  const handleServiceEditorCancel = () => {
    if (!currentSpecialty) return;

    if (currentSpecialty.services.length > 0) {
      selectServiceForEdit(currentSpecialty.services[0]);
      return;
    }

    startCreatingService();
  };

  if (selectedSpecialty && currentSpecialty) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('pageTitle')}</h1>
          <p className="text-muted-foreground">{t('pageSubtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title={t('stats.totalServices')}
            value={currentSpecialty.services.length}
            icon={Stethoscope}
          />
          <StatsCard
            title={t('stats.averageCost')}
            value={`$${currentSpecialty.services.length > 0
              ? (currentSpecialty.services.reduce((sum, service) => sum + service.cost, 0) / currentSpecialty.services.length).toFixed(0)
              : '0'
            }`}
            icon={DollarSign}
          />
          <StatsCard
            title={t('stats.averageDuration')}
            value={currentSpecialty.services.length > 0
              ? `${Math.round(currentSpecialty.services.reduce((sum, service) => sum + service.duration, 0) / currentSpecialty.services.length)}m`
              : '0m'
            }
            icon={Clock}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)] gap-6">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-foreground">{t('serviceList.title', { specialtyName: currentSpecialty.name })}</h3>
                <Button
                  onClick={startCreatingService}
                  disabled={isServiceMutating}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('addService')}
                </Button>
              </div>

              {currentSpecialty.services.length === 0 ? (
                <div className="text-sm text-muted-foreground py-6 text-center">
                  {t('empty.noServicesDescription')}
                </div>
              ) : (
                <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
                  {currentSpecialty.services.map((service) => {
                    const isSelected = serviceEditorMode === 'edit' && activeServiceId === service.id;

                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => selectServiceForEdit(service)}
                        disabled={isServiceMutating}
                        className={`w-full rounded-lg border p-3 text-left transition ${
                          isSelected
                            ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                            : 'border-border hover:border-primary/40 hover:bg-muted/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{service.description}</p>
                            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                <DollarSign className="h-3.5 w-3.5" />
                                {service.cost}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {service.duration}m
                              </span>
                            </div>
                          </div>
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(event) => {
                              if (isServiceMutating) return;
                              event.stopPropagation();
                              openDeleteDialog('service', service.id, service.description);
                            }}
                            onKeyDown={(event) => {
                              if (isServiceMutating) return;
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                openDeleteDialog('service', service.id, service.description);
                              }
                            }}
                            className="text-muted-foreground hover:text-destructive transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground">
                  {serviceEditorMode === 'edit' ? t('forms.editServiceTitle') : t('forms.createServiceTitle')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {serviceEditorMode === 'edit' ? t('forms.editServiceDescription') : t('forms.createServiceDescription')}
                </p>
              </div>

              <form onSubmit={handleServiceEditorSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="service-description">
                    {t('forms.service.descriptionLabel')} <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="service-description"
                    value={serviceDraft.description}
                    onChange={(event) => setServiceDraft((prev) => ({ ...prev, description: event.target.value }))}
                    placeholder={t('forms.service.descriptionPlaceholder')}
                    disabled={isServiceMutating}
                  />
                  {serviceDraftErrors.description ? (
                    <p className="text-sm text-destructive">{serviceDraftErrors.description}</p>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground" htmlFor="service-cost">
                      {t('forms.service.costLabel')} <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="service-cost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={serviceDraft.cost}
                      onChange={(event) => setServiceDraft((prev) => ({ ...prev, cost: event.target.value }))}
                      placeholder="0.00"
                      disabled={isServiceMutating}
                    />
                    {serviceDraftErrors.cost ? (
                      <p className="text-sm text-destructive">{serviceDraftErrors.cost}</p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground" htmlFor="service-duration">
                      {t('forms.service.durationLabel')} <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="service-duration"
                      type="number"
                      min="1"
                      max="480"
                      value={serviceDraft.duration}
                      onChange={(event) => setServiceDraft((prev) => ({ ...prev, duration: event.target.value }))}
                      placeholder="30"
                      disabled={isServiceMutating}
                    />
                    {serviceDraftErrors.duration ? (
                      <p className="text-sm text-destructive">{serviceDraftErrors.duration}</p>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div>
                    {serviceEditorMode === 'edit' && currentService ? (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => openDeleteDialog('service', currentService.id, currentService.description)}
                        disabled={isServiceMutating}
                      >
                        {isDeletingService ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        {tCommon('delete')}
                      </Button>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleServiceEditorCancel}
                      disabled={isServiceMutating}
                    >
                      {tCommon('cancel')}
                    </Button>
                    {serviceEditorMode === 'edit' ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={startCreatingService}
                        disabled={isServiceMutating}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {t('addService')}
                      </Button>
                    ) : null}
                    <Button type="submit" disabled={isServiceMutating}>
                      {isSavingService ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                      {serviceEditorMode === 'edit' ? t('forms.updateAction') : t('forms.createAction')}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <DeleteConfirmDialog
          open={formStates.deleteDialog.open && formStates.deleteDialog.type === 'service'}
          onOpenChange={(open) => setFormStates((prev) => ({ ...prev, deleteDialog: { ...prev.deleteDialog, open } }))}
          onConfirm={handleDeleteService}
          title={t('deletes.deleteServiceTitle')}
          description={t('deletes.deleteServiceDescription')}
          itemName={formStates.deleteDialog.name || ''}
          isPending={isDeletingService}
        />
      </div>
    );
  }

  if (state.loading || isPending) {
    return (
      <div className="container motion-stagger mx-auto p-4 space-y-6">
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">{tCommon('loading')}</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container motion-stagger mx-auto p-4 space-y-6">
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

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="pl-10"
              disabled={isPending}
            />
          </div>
        </CardContent>
      </Card>

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

      <SpecialtyList
        specialties={filteredSpecialties}
        loading={state.loading}
        onEdit={(specialty) => openSpecialtyForm('edit', {
          id: specialty.id,
          name: specialty.name,
          description: specialty.description || '',
        })}
        onDelete={(id) => {
          const specialty = state.specialties.find((item) => item.id === id);
          openDeleteDialog('specialty', id, specialty?.name || '');
        }}
        onViewServices={(specialty) => {
          setSelectedSpecialty(specialty.id);
          if (specialty.services.length > 0) {
            selectServiceForEdit(specialty.services[0]);
          } else {
            startCreatingService();
          }
        }}
        onAddService={(specialtyId) => {
          setSelectedSpecialty(specialtyId);
          startCreatingService();
        }}
        isPending={isPending}
      />

      <SpecialtyForm
        open={formStates.specialtyForm.open}
        onOpenChange={(open) => setFormStates((prev) => ({ ...prev, specialtyForm: { ...prev.specialtyForm, open } }))}
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
        onOpenChange={(open) => setFormStates((prev) => ({ ...prev, deleteDialog: { ...prev.deleteDialog, open } }))}
        onConfirm={handleDeleteSpecialty}
        title={t('deletes.deleteSpecialtyTitle')}
        description={t('deletes.deleteSpecialtyDescription')}
        itemName={formStates.deleteDialog.name || ''}
        isPending={isPending}
      />
    </div>
  );
}
