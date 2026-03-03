"use client"

import {
  Calendar,
  Clock,
  X,
  FileText,
  Mail,
  MapPin,
  Phone,
  Stethoscope,
  User,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  DialogClose,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BOOKING_STATUS_TRANSITIONS,
  type BookingStatusValue,
  canCancelBookingStatus,
} from '@/lib/utils/booking-status';
import { normalizeBookingStatus, type CalendarEvent } from '@/lib/utils/calendar';
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import { Loader2, MoreHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface EventDetailsDialogProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (event: CalendarEvent) => void;
  onCancel?: (event: CalendarEvent) => void;
  onStatusChange?: (event: CalendarEvent, status: BookingStatusValue) => Promise<void> | void;
  updatingStatus?: boolean;
}

export function EventDetailsDialog({
  event,
  isOpen,
  onClose,
  onEdit,
  onCancel,
  onStatusChange,
  updatingStatus = false,
}: EventDetailsDialogProps) {
  const t = useTranslations('Calendar');
  if (!event) return null;
  const showEdit = Boolean(onEdit);
  const showCancel = Boolean(onCancel && canCancelBookingStatus(event.status));
  const normalizedStatus = normalizeBookingStatus(event.status);
  const currentStatus = (() => {
    switch (normalizedStatus) {
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'inprogress':
        return 'InProgress';
      case 'completed':
        return 'Completed';
      case 'noshow':
        return 'NoShow';
      case 'cancelled':
        return 'Cancelled';
      default:
        return null;
    }
  })() as BookingStatusValue | null;
  const statusTransitions = currentStatus
    ? BOOKING_STATUS_TRANSITIONS[currentStatus] ?? []
    : [];

  const getStatusColor = (status?: string) => {
    switch (normalizeBookingStatus(status)) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900/40';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-900/40';
      case 'inprogress':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/40';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-900/40';
      case 'noshow':
        return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-900/40';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/40';
      default:
        return 'bg-muted text-foreground/80 border-border';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Stethoscope className="h-5 w-5 text-primary" />;
      case 'task':
        return <FileText className="h-5 w-5 text-green-600 dark:text-green-300" />;
      case 'event':
        return <Calendar className="h-5 w-5 text-purple-600" />;
      default:
        return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusText = (status?: string) => {
    switch (normalizeBookingStatus(status)) {
      case 'confirmed':
        return t('confirmed');
      case 'pending':
        return t('pending');
      case 'inprogress':
        return t('inProgress');
      case 'completed':
        return t('completed');
      case 'noshow':
        return t('noShow');
      case 'cancelled':
        return t('cancelled');
      default:
        return status || '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="flex items-start justify-between gap-3">
            <span className="flex items-center gap-2 pr-4">
              {getTypeIcon(event.type)}
              <span>{event.title}</span>
            </span>
            <div className="flex items-center gap-1">
              {currentStatus && statusTransitions.length ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      {updatingStatus ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MoreHorizontal className="h-4 w-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>{t('updateStatus')}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {statusTransitions.map((status) => (
                      <DropdownMenuItem
                        key={status}
                        disabled={updatingStatus}
                        onClick={() => void onStatusChange?.(event, status)}
                      >
                        {t(`statusOptions.${status}`)}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Estado */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t('status')}:</span>
            <Badge className={getStatusColor(event.status)}>
              {getStatusText(event.status)}
            </Badge>
          </div>
          
          <Separator />
          
          {/* Información básica */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {format(new Date(event.time), 'EEEE, d \'de\' MMMM \'de\' yyyy', { locale: es })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {event.displayTime || format(new Date(event.time), 'HH:mm')}
                  {event.duration && ` (${event.duration} ${t('minutes')})`}
                </p>
              </div>
            </div>
            
            {event.location && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t('location')}</p>
                  <p className="text-sm text-muted-foreground">{event.location}</p>
                </div>
              </div>
            )}
            
            {event.patientName && (
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t('patient')}</p>
                  <p className="text-sm text-muted-foreground">{event.patientName}</p>
                </div>
              </div>
            )}
            
            {event.patientPhone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t('phone')}</p>
                  <p className="text-sm text-muted-foreground">{event.patientPhone}</p>
                </div>
              </div>
            )}
            
            {event.patientEmail && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t('email')}</p>
                  <p className="text-sm text-muted-foreground">{event.patientEmail}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Especialidad y Servicio */}
          {(event.specialty || event.service) && (
            <>
              <Separator />
              <div className="space-y-2">
                {event.specialty && (
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {event.specialty}
                    </Badge>
                  </div>
                )}
                
                {event.service && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      {event.service}
                    </Badge>
                  </div>
                )}
              </div>
            </>
          )}
          
          {/* Notas */}
          {event.notes && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-2">{t('notes')}</p>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">{event.notes}</p>
                </div>
              </div>
            </>
          )}
          
          {/* Acciones */}
          {showEdit || showCancel ? <Separator /> : null}
          <div className="flex gap-2">
            {showEdit ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit?.(event)}
                className="flex-1"
              >
                {t('editEvent')}
              </Button>
            ) : null}
            {showCancel ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onCancel?.(event)}
                className="flex-1"
              >
                {t('cancelEvent')}
              </Button>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
