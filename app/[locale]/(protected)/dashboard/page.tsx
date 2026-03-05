"use client";

import { KpiCard, NextAppointmentsList, QuickActions, TherapistDashboard } from "@/components/dashboard";

import React from 'react'
import { useEffect } from "react";
import { useTherapistDashboard } from "@/hooks/use-therapist-dashboard";
import { useTranslations } from "next-intl";
import { useUser } from "@/contexts/user-context";
import { useRouter } from "@/i18n/navigation";
import { UserRole } from "@/lib/prisma-browser";

export default function DashboardHome() {
  const { prismaUser, loading } = useUser();
  const t = useTranslations('Dashboard');
  const router = useRouter();
  const [range, setRange] = React.useState<"last7" | "today" | "thisWeek" | "last30" | "all">("last7");
  const { data: therapistData } = useTherapistDashboard({ range });

  if (loading) {
    return <div className="p-6 text-muted-foreground">{t('loading', { default: 'Cargando…' })}</div>;
  }

  const userRoles = prismaUser?.role ?? [];
  const isTherapist = userRoles.includes(UserRole.Therapist);
  const isFrontDesk = userRoles.includes(UserRole.FrontDesk);

  useEffect(() => {
    if (!loading && isFrontDesk) {
      router.push("/bookings");
    }
  }, [isFrontDesk, loading, router]);

  if (isFrontDesk) {
    return null;
  }

  if (isTherapist) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <TherapistDashboard
          kpis={{
            totalPatients: { value: therapistData?.kpis.totalPatients || 0 },
            patientsToday: { value: therapistData?.kpis.patientsToday || 0 },
            appointmentsToday: { value: therapistData?.kpis.appointmentsToday || 0 },
          }}
          kpisRange={therapistData?.kpisRange}
          apiRange={therapistData?.range}
          appointments={therapistData?.appointments || []}
          upcoming={therapistData?.upcoming || null}
          recentPatients={therapistData?.recentPatients || []}
          invoices={therapistData?.invoices || []}
          weeklyOverview={therapistData?.weeklyOverview}
          timeZone={therapistData?.timeZone}
          range={range}
          onRangeChange={setRange}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title={t('kpis.todayAppointments', { default: 'Citas hoy' })} value={0} />
        <KpiCard title={t('kpis.attendance', { default: 'Asistencia' })} value={'--'} />
        <KpiCard title={t('kpis.hours', { default: 'Horas' })} value={'--'} />
        <KpiCard title={t('kpis.revenue', { default: 'Ingresos' })} value={'--'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <NextAppointmentsList
            role={isTherapist ? 'therapist' : 'patient'}
            items={[]}
            emptyLabel={
              isTherapist
                ? t('empty.noUpcomingTherapist', { default: 'Sin próximas citas' })
                : t('empty.noUpcomingPatient', { default: 'No tienes próximas citas' })
            }
          />
        </div>
        <div className="space-y-6">
          <QuickActions
            title={t('quickActions.title', { default: 'Acciones rápidas' })}
            actions={
              isTherapist
                ? [
                    { id: 'open-schedule', label: t('quickActions.openSchedule', { default: 'Abrir agenda' }), onClick: () => {} },
                    { id: 'block-slot', label: t('quickActions.blockSlot', { default: 'Bloquear franja' }), onClick: () => {}, variant: 'outline' },
                    { id: 'add-appointment', label: t('quickActions.newAppointment', { default: 'Nueva cita' }), onClick: () => {} },
                  ]
                : [
                    { id: 'book', label: t('quickActions.book', { default: 'Reservar cita' }), onClick: () => {} },
                    { id: 'availability', label: t('quickActions.availability', { default: 'Ver disponibilidad' }), onClick: () => {}, variant: 'outline' },
                  ]
            }
          />
        </div>
      </div>
    </div>
  );
}

