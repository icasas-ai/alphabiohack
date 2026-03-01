"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import React, { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Esquemas de validación
const specialtySchema = z.object({
  name: z.string().min(1, 'SpecialtiesUI.validation.specialty.nameRequired').max(100, 'SpecialtiesUI.validation.specialty.nameMax'),
  description: z.string().max(500, 'SpecialtiesUI.validation.specialty.descriptionMax').optional(),
});

const serviceSchema = z.object({
  description: z.string().min(1, 'SpecialtiesUI.validation.service.descriptionRequired').max(200, 'SpecialtiesUI.validation.service.descriptionMax'),
  cost: z.coerce.number().min(0, 'SpecialtiesUI.validation.service.costMin').max(10000, 'SpecialtiesUI.validation.service.costMax'),
  duration: z.coerce.number().min(1, 'SpecialtiesUI.validation.service.durationMin').max(480, 'SpecialtiesUI.validation.service.durationMax'),
});

// Tipos para los formularios
interface SpecialtyFormData {
  name: string;
  description?: string;
}

interface ServiceFormData {
  description: string;
  cost: number;
  duration: number;
}

type ServiceFormInput = z.input<typeof serviceSchema>;

// Props para los componentes de formulario
interface SpecialtyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SpecialtyFormData) => Promise<void>;
  initialData?: SpecialtyFormData;
  title: string;
  description: string;
  isPending?: boolean;
}

interface ServiceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ServiceFormData) => Promise<void>;
  initialData?: ServiceFormData;
  title: string;
  description: string;
  isPending?: boolean;
}

// Componente presentacional para el formulario de Specialty
export function SpecialtyForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  title,
  description,
  isPending = false,
}: SpecialtyFormProps) {
  const t = useTranslations('SpecialtiesUI');
  const tCommon = useTranslations('Common');
  const form = useForm<SpecialtyFormData>({
    resolver: zodResolver(specialtySchema),
    defaultValues: initialData || {
      name: '',
      description: '',
    },
  });

  const handleSubmit = async (data: SpecialtyFormData) => {
    try {
      await onSubmit(data);
      form.reset();
      onOpenChange(false);
    } catch {
      // El error se maneja en el componente padre
    }
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('forms.specialty.nameLabel')}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t('forms.specialty.namePlaceholder')} 
                      {...field} 
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('forms.specialty.nameDescription')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('forms.specialty.descriptionLabel')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('forms.specialty.descriptionPlaceholder')}
                      className="resize-none"
                      rows={3}
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('forms.specialty.descriptionHelper')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
                disabled={isPending}
              >
                {tCommon('cancel')}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData ? t('forms.updateAction') : t('forms.createAction')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Componente presentacional para el formulario de Service
export function ServiceForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  title,
  description,
  isPending = false,
}: ServiceFormProps) {
  const t = useTranslations('SpecialtiesUI');
  const tCommon = useTranslations('Common');
  const form = useForm<ServiceFormInput, undefined, ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: initialData || {
      description: '',
      cost: 0,
      duration: 30,
    },
  });

  const handleSubmit = async (data: ServiceFormData) => {
    try {
      await onSubmit(data);
      form.reset();
      onOpenChange(false);
    } catch {
      // El error se maneja en el componente padre
    }
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  const formatDuration = useMemo(() => {
    const duration = Number(form.watch('duration') || 0);
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  }, [form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('forms.service.descriptionLabel')}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t('forms.service.descriptionPlaceholder')} 
                      {...field} 
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem className="self-start">
                    <FormLabel>{t('forms.service.costLabel')}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={field.value === undefined || field.value === null ? "" : String(field.value)}
                        onChange={(e) => field.onChange(e.target.value)}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem className="self-start">
                    <div className="flex items-center justify-between gap-3">
                      <FormLabel>{t('forms.service.durationLabel')}</FormLabel>
                      <span className="text-xs text-muted-foreground">{formatDuration}</span>
                    </div>
                    <FormControl>
                      <Input 
                        type="number"
                        min="1"
                        max="480"
                        placeholder="30"
                        value={field.value === undefined || field.value === null ? "" : String(field.value)}
                        onChange={(e) => field.onChange(e.target.value)}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
                disabled={isPending}
              >
                {tCommon('cancel')}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData ? t('forms.updateAction') : t('forms.createAction')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Componente presentacional para confirmación de eliminación
interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  title: string;
  description: string;
  itemName: string;
  isPending?: boolean;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  itemName,
  isPending = false,
}: DeleteConfirmDialogProps) {
  const t = useTranslations('SpecialtiesUI');
  const tCommon = useTranslations('Common');
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onOpenChange(false);
    } catch {
      // El error se maneja en el componente padre
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            {t('deletes.confirmDeleteQuestion', { name: itemName })}
            {" "}
            {t('deletes.cannotBeUndone')}
          </p>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {tCommon('cancel')}
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {tCommon('delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
