"use client";

import { CalendarDays, CheckCircle2, Clock, Loader2, UserIcon, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { KpiCard, NextAppointmentsList } from "@/components/dashboard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { AdvancedDataTable } from "@/components/dashboard/advanced-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import type { ColumnDef } from "@tanstack/react-table";
import { formatTimeZoneLabel } from "@/lib/utils/timezone";
import React from "react";
import { WeeklyOverview } from "@/components/dashboard/weekly-overview";
import { useTranslations } from "next-intl";

type AppointmentItem = Parameters<typeof NextAppointmentsList>[0]["items"][number];
type DashboardAppointment = AppointmentItem & {
  status?: string;
  timeZone?: string;
  bookingSchedule?: string;
};

interface TherapistDashboardProps {
  kpis?: {
    totalPatients: { value: number; delta?: string };
    patientsToday: { value: number; delta?: string };
    appointmentsToday: { value: number; delta?: string };
  };
  kpisRange?: {
    appointments?: { value: number; deltaPercent: number };
    patients?: { value: number; deltaPercent: number };
    completed?: { value: number; deltaPercent: number };
    totals?: { value: number; deltaPercent: number };
    pendingThisMonth?: { value: number; deltaPercent: number };
    usersTotalVsPrevMonth?: { value: number; deltaPercent: number };
  };
  appointments?: DashboardAppointment[];
  upcoming?: DashboardAppointment | null;
  recentPatients?: Array<{ id: string; name: string; lastAppointment?: string | null; code?: string }>;
  invoices?: Array<{ id: string; name: string; amount: string; paidOn: string; code?: string }>; 
  weeklyOverview?: Array<{ day: string; value: number }>; 
  series?: {
    appointmentsDaily: Array<{ date: string; value: number }>;
    pendingDaily: Array<{ date: string; value: number }>;
    completedDaily: Array<{ date: string; value: number }>;
  };
  statusCounts?: Record<string, number>;
  range?: "last7" | "today" | "thisWeek" | "last30" | "all";
  onRangeChange?: (value: "last7" | "today" | "thisWeek" | "last30" | "all") => void;
  apiRange?: { from: string; to: string };
  timeZone?: string;
}

export function TherapistDashboard({
  kpis,
  kpisRange,
  appointments = [],
  upcoming = null,
  recentPatients = [],
  // invoices is currently unused in this view; kept in props for future use
  weeklyOverview = [],
  series,
  statusCounts,
  range = "last7",
  onRangeChange,
  apiRange,
  timeZone,
}: TherapistDashboardProps) {
  const t = useTranslations("Dashboard");

  const [statusFilter, setStatusFilter] = React.useState<string[]>([]);

  const statusOptions: { value: string; label: string }[] = React.useMemo(() => [
    { value: 'Pending', label: t('status.pending', { default: 'Pending' }) },
    { value: 'Confirmed', label: t('status.confirmed', { default: 'Confirmed' }) },
    { value: 'InProgress', label: t('status.inProgress', { default: 'In Progress' }) },
    { value: 'Completed', label: t('status.completed', { default: 'Completed' }) },
    { value: 'Cancelled', label: t('status.cancelled', { default: 'Cancelled' }) },
    { value: 'NoShow', label: t('status.noShow', { default: 'No Show' }) },
  ], [t]);

  const sortedAppointments = React.useMemo(() => {
    const now = new Date();
    const copy = [...appointments];
    copy.sort((a, b) => {
      const ad = new Date(a.bookingSchedule || `${a.date}T${a.time}:00`);
      const bd = new Date(b.bookingSchedule || `${b.date}T${b.time}:00`);
      const aFuture = ad.getTime() >= now.getTime();
      const bFuture = bd.getTime() >= now.getTime();
      if (aFuture && !bFuture) return -1;
      if (!aFuture && bFuture) return 1;
      if (aFuture && bFuture) return ad.getTime() - bd.getTime();
      return bd.getTime() - ad.getTime();
    });
    const filtered = statusFilter.length
      ? copy.filter(a => statusFilter.includes((a as { status?: string }).status || ''))
      : copy;
    return filtered;
  }, [appointments, statusFilter]);

  const formatAppointmentLabel = React.useCallback((appointment: DashboardAppointment) => {
    const tz = appointment.timeZone || timeZone;
    const dt = new Date(appointment.bookingSchedule || `${appointment.date}T${appointment.time}:00`);
    return dt.toLocaleString(undefined, {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
      day: "2-digit",
      timeZone: tz || undefined,
    });
  }, [timeZone]);

  type AppointmentRow = DashboardAppointment;
  const appointmentsColumns = React.useMemo<ColumnDef<AppointmentRow>[]>(() => [
    {
      accessorKey: "date",
      header: t('dateAndTime', { default: 'Date and Time' }),
      cell: ({ row }) => {
        const a = row.original;
        const dt = new Date(a.bookingSchedule || `${a.date}T${a.time}:00`);
        const label = formatAppointmentLabel(a);
        return (
          <time dateTime={dt.toISOString()} className="text-xs text-muted-foreground">{label}</time>
        );
      },
    },
    {
      accessorKey: "name",
      header: t('patients', { default: 'Patients' }),
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: "location",
      header: t('location', { default: 'Location' }),
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.location || '-'}</span>,
    },
    {
      accessorKey: "status",
      header: t('statusLabel', { default: 'Status' }),
      cell: ({ row }) => {
        const s = (row.original.status || '-') as string;
        const normalized = s.toLowerCase();
        let color = "border-muted text-muted-foreground";
        let icon: React.ReactNode = null;
        if (normalized === 'completed' || normalized === 'confirmed') {
          color = "border-green-200 text-green-700 dark:border-green-800 dark:text-green-300";
          icon = <CheckCircle2 className="w-3.5 h-3.5" />;
        } else if (normalized === 'cancelled' || normalized === 'canceled' || normalized === 'noshow' || normalized === 'no_show' || normalized === 'no show') {
          color = "border-red-200 text-red-700 dark:border-red-800 dark:text-red-300";
          icon = <XCircle className="w-3.5 h-3.5" />;
        } else if (normalized === 'pending') {
          color = "border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-300";
          icon = <Clock className="w-3.5 h-3.5" />;
        } else if (normalized === 'inprogress' || normalized === 'in_progress' || normalized === 'in progress') {
          color = "border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300";
          icon = <Loader2 className="w-3.5 h-3.5 animate-spin" />;
        }
        return (
          <Badge variant="outline" className={`gap-1 px-1.5 ${color}`}>
            {icon}
            {s}
          </Badge>
        );
      },
    },
  ], [formatAppointmentLabel, t]);

  const recentPatientsColumns = React.useMemo<ColumnDef<{ id: string; name: string; lastAppointment?: string | null; code?: string; }>[] >(() => [
    {
      accessorKey: "name",
      header: t('patients', { default: 'Patients' }),
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: "lastAppointment",
      header: t('lastAppointment', { default: 'Last Appointment' }),
      cell: ({ row }) => {
        const v = row.original.lastAppointment;
        if (!v) return <span className="text-sm text-muted-foreground">-</span>;
        return <time className="text-xs text-muted-foreground">{v}</time>;
      },
    },
    {
      accessorKey: "code",
      header: t('patientId', { default: 'Patient ID' }),
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.code || '-'}</span>,
    },
  ], [t]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {!kpis && !appointments.length && !recentPatients.length && (
        <div className="xl:col-span-3 rounded-xl border border-dashed border-border p-6 text-center text-muted-foreground">
          No hay datos para mostrar en este rango.
        </div>
      )}
      {/* Columna izquierda: KPIs + Weekly Overview + Recent Patients */}
      <div className="space-y-6 lg:col-span-2">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <KpiCard
            title={t('kpis.totalAppointments', { default: 'Total Appointments' })}
            value={kpisRange?.totals?.value ?? '--'}
            delta={typeof kpisRange?.appointments?.deltaPercent === 'number' ? {
              value: `${kpisRange!.appointments!.deltaPercent}%`,
              trend: kpisRange!.appointments!.deltaPercent > 0 ? 'up' : kpisRange!.appointments!.deltaPercent < 0 ? 'down' : 'neutral',
              label: t('vsPreviousMonth', { default: 'vs mes anterior' })
            } : undefined}
            variant="section"
            footerTitle={kpisRange?.appointments?.deltaPercent && kpisRange.appointments.deltaPercent >= 0 ? t('kpis.trendingUp', { default: 'Trending up' }) : t('kpis.trendingDown', { default: 'Trending down' })}
            footerDescription={t('kpis.periodHint', { default: 'Comparación del periodo seleccionado' })}
            icon={<CalendarDays className="w-4 h-4" />}
          />
          <KpiCard
            title={t('kpis.pendingThisMonth', { default: 'Pending (this month)' })}
            value={kpisRange?.pendingThisMonth?.value ?? '--'}
            delta={undefined}
            variant="section"
            footerDescription={t('kpis.pendingDesc', { default: 'Citas en estado pending en el mes actual' })}
            icon={<CalendarDays className="w-4 h-4" />}
          />
          <KpiCard
            title={t('kpis.completed', { default: 'Completed Appointments' })}
            value={kpisRange?.completed?.value ?? '--'}
            delta={typeof kpisRange?.completed?.deltaPercent === 'number' ? {
              value: `${kpisRange!.completed!.deltaPercent}%`,
              trend: kpisRange!.completed!.deltaPercent > 0 ? 'up' : kpisRange!.completed!.deltaPercent < 0 ? 'down' : 'neutral',
              label: t('vsPreviousMonth', { default: 'vs mes anterior' })
            } : undefined}
            variant="section"
            footerTitle={kpisRange?.completed?.deltaPercent && kpisRange.completed.deltaPercent >= 0 ? t('kpis.trendingUp', { default: 'Trending up' }) : t('kpis.trendingDown', { default: 'Trending down' })}
            footerDescription={t('kpis.completedDesc', { default: 'Citas con estado completado' })}
            icon={<CheckCircle2 className="w-6 h-6" />}
          />
          <KpiCard
            title={t('kpis.usersTotal', { default: 'Total Users' })}
            value={kpisRange?.usersTotalVsPrevMonth?.value ?? '--'}
            delta={typeof kpisRange?.usersTotalVsPrevMonth?.deltaPercent === 'number' ? {
              value: `${kpisRange!.usersTotalVsPrevMonth!.deltaPercent}%`,
              trend: kpisRange!.usersTotalVsPrevMonth!.deltaPercent > 0 ? 'up' : kpisRange!.usersTotalVsPrevMonth!.deltaPercent < 0 ? 'down' : 'neutral',
              label: t('vsPreviousMonth', { default: 'vs mes anterior' })
            } : undefined}
            variant="section"
            footerTitle={kpisRange?.usersTotalVsPrevMonth?.deltaPercent && kpisRange.usersTotalVsPrevMonth.deltaPercent >= 0 ? t('kpis.trendingUp', { default: 'Trending up' }) : t('kpis.trendingDown', { default: 'Trending down' })}
            footerDescription={t('kpis.uniqueEmail', { default: 'Pacientes únicos por email' })}
            icon={<UserIcon className="w-4 h-4" />}
          />
        </div>

        <WeeklyOverview
          title={t('weeklyOverview.title', { default: 'Weekly Overview' })}
          subtitle={(() => {
            const from = (apiRange)?.from;
            const to = (apiRange)?.to;
            if (from && to) {
              const f = new Date(from);
              const t2 = new Date(to);
              const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' });
              return `${fmt(f)} – ${fmt(t2)}`;
            }
            return t('weeklyOverview.range', { default: 'This week' });
          })()}
          data={weeklyOverview}
          seriesKey="appointments"
          label="Appointments"
        />

        <ChartAreaInteractive
          title={t('charts.appointmentsTrend', { default: 'Appointments Trend' })}
          subtitle={(() => {
            const from = (apiRange)?.from;
            const to = (apiRange)?.to;
            if (from && to) {
              const f = new Date(from);
              const t2 = new Date(to);
              const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: '2-digit' });
              return `${fmt(f)} – ${fmt(t2)}`;
            }
            return undefined;
          })()}
          data={(series?.appointmentsDaily || []).map(d => ({ date: d.date, value: d.value }))}
          labels={{ last7: t('ranges.last7', { default: 'Last 7 Days' }), last30: t('ranges.last30', { default: 'Last 30 Days' }), thisWeek: t('ranges.thisWeek', { default: 'This Week' }), today: t('ranges.today', { default: 'Today' }), all: t('ranges.all', { default: 'All' }), series: t('charts.appointments', { default: 'Appointments' }) }}
          range={['today','thisWeek','last7','last30'].includes(range) ? (range as 'today'|'thisWeek'|'last7'|'last30') : 'all'}
          onRangeChange={(r) => onRangeChange?.(r as 'today'|'thisWeek'|'last7'|'last30'|'all')}
        />

        {/* Recent Patients */}
        <Card className="bg-card text-card-foreground">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">{t('recentPatients.title', { default: 'Recent Patients' })}</CardTitle>
              <button className="text-xs text-primary hover:underline" type="button">{t('viewAll', { default: 'Ver todo' })}</button>
            </div>
          </CardHeader>
          <CardContent>
            {recentPatients.length === 0 ? (
              <div className="text-sm text-muted-foreground py-6 text-center">{t('recentPatients.empty', { default: 'No recent patients' })}</div>
            ) : (
              <AdvancedDataTable
                data={recentPatients}
                columns={recentPatientsColumns}
                searchableColumnId="name"
                withSelection
                enableRowReorder
                getRowId={(row) => row.id}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Columna central: Appointment list + Upcoming */}
      <div className="space-y-6 lg:col-span-2">
        {timeZone ? (
          <p className="text-xs text-muted-foreground">
            Times shown in {formatTimeZoneLabel(timeZone)}.
          </p>
        ) : null}
        {/* Upcoming appointment highlight */}
        <Card className="border-[rgb(var(--interactive-selected-rgb)_/_0.28)] bg-[rgb(var(--interactive-selected-rgb)_/_0.10)] text-foreground shadow-[0_18px_40px_-28px_rgb(var(--interactive-selected-rgb)_/_0.45)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">{t('upcoming.title', { default: 'Upcoming Appointment' })}</CardTitle>
          </CardHeader>
          <CardContent>
            {upcoming ? (
              <div className="flex items-center justify-between gap-6">
                <div>
                  <h4 className="text-sm font-medium opacity-90">{upcoming.name}</h4>
                  <p className="text-xs opacity-90">{upcoming.service || 'General'}</p>
                </div>
                <time
                  className="text-sm"
                  dateTime={new Date(
                    upcoming.bookingSchedule || `${upcoming.date}T${upcoming.time}:00`
                  ).toISOString()}
                >
                  {formatAppointmentLabel(upcoming)}
                </time>
                <div className="flex gap-3">
                  <button className="rounded-md bg-[rgb(var(--interactive-selected-rgb))] px-4 py-1.5 text-white hover:bg-[rgb(var(--interactive-selected-strong-rgb))]" type="button">{t('upcoming.start', { default: 'Start Appointment' })}</button>
                </div>
              </div>
            ) : (
              <p className="text-sm opacity-90">{t('upcoming.empty', { default: 'No upcoming appointment' })}</p>
            )}
          </CardContent>
        </Card>
        {/* Appointment list */}
        <Card className="bg-card text-card-foreground">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="font-medium">{t('appointments.recentTitle', { default: 'Recent Appointments' })}</CardTitle>
              <Select value={range} onValueChange={(v) => onRangeChange?.(v as NonNullable<TherapistDashboardProps["range"]>)}>
                <SelectTrigger className="h-8 w-[200px]" aria-label={t('ranges.label', { default: 'Filter range' })} title={t('ranges.tooltip', { default: 'Select a date range to filter the dashboard' })}>
                  <SelectValue placeholder={t('ranges.label', { default: 'Filter range' })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last7">{t('ranges.last7', { default: 'Last 7 Days' })}</SelectItem>
                  <SelectItem value="today">{t('ranges.today', { default: 'Today' })}</SelectItem>
                  <SelectItem value="thisWeek">{t('ranges.thisWeek', { default: 'This Week' })}</SelectItem>
                  <SelectItem value="last30">{t('ranges.last30', { default: 'Last 30 Days' })}</SelectItem>
                  <SelectItem value="all">{t('ranges.all', { default: 'All' })}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pt-2">
              {statusCounts ? (
                <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
                  {Object.entries(statusCounts).map(([k, v]) => (
                    <span key={k} className="rounded-md border px-2 py-0.5 bg-muted/40 text-foreground">
                      {k}: <strong className="ml-1">{v}</strong>
                    </span>
                  ))}
                </div>
              ) : null}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {t('status.filter', { default: 'Status' })}
                    {statusFilter.length ? ` (${statusFilter.length})` : ''}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {statusOptions.map((opt) => (
                    <DropdownMenuCheckboxItem
                      key={opt.value}
                      checked={statusFilter.includes(opt.value)}
                      onCheckedChange={(v) => {
                        setStatusFilter((prev) => v ? [...prev, opt.value] : prev.filter((x) => x !== opt.value));
                      }}
                    >
                      {opt.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuCheckboxItem
                    checked={false}
                    onCheckedChange={() => setStatusFilter([])}
                  >
                    {t('status.clear', { default: 'Clear' })}
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            {sortedAppointments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/40 p-6 text-center text-muted-foreground">
                {t('appointments.empty', { default: 'No appointments' })}
              </div>
            ) : (
              <AdvancedDataTable
                data={sortedAppointments as AppointmentRow[]}
                columns={appointmentsColumns}
                searchableColumnId="name"
                getRowId={(row: AppointmentRow) => row.id}
              />
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
