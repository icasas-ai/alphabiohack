"use client";

import { CalendarDays, CheckCircle2, Clock, Loader2, UserIcon, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { KpiCard, NextAppointmentsList } from "@/components/dashboard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { AdvancedDataTable } from "@/components/dashboard/advanced-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "@/i18n/navigation";
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
  invoices?: Array<Record<string, unknown>>; 
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
  const router = useRouter();

  const [statusFilter, setStatusFilter] = React.useState<string[]>([]);
  const timeZoneLabel = React.useMemo(
    () => (timeZone ? formatTimeZoneLabel(timeZone) : null),
    [timeZone],
  );

  const openBookings = React.useCallback(
    (view: "list" | "calendar" = "list") => {
      if (view === "calendar") {
        router.push({ pathname: "/bookings", query: { view: "calendar" } });
        return;
      }

      router.push("/bookings");
    },
    [router],
  );

  const getTrendTitle = React.useCallback(
    (deltaPercent?: number) => {
      if (typeof deltaPercent !== "number") {
        return undefined;
      }

      return deltaPercent >= 0
        ? t('kpis.trendingUp', { default: 'Trending up' })
        : t('kpis.trendingDown', { default: 'Trending down' });
    },
    [t],
  );

  const statusOptions: { value: string; label: string }[] = React.useMemo(() => [
    { value: 'Pending', label: t('status.pending', { default: 'Pending' }) },
    { value: 'NeedsAttention', label: t('status.needsAttention', { default: 'Needs attention' }) },
    { value: 'Confirmed', label: t('status.confirmed', { default: 'Confirmed' }) },
    { value: 'InProgress', label: t('status.inProgress', { default: 'In Progress' }) },
    { value: 'Completed', label: t('status.completed', { default: 'Completed' }) },
    { value: 'Cancelled', label: t('status.cancelled', { default: 'Cancelled' }) },
    { value: 'NoShow', label: t('status.noShow', { default: 'No Show' }) },
  ], [t]);

  const getStatusLabel = React.useCallback((status: string) => {
    const normalized = status.toLowerCase();

    if (normalized === 'pending') return t('status.pending', { default: 'Pending' });
    if (normalized === 'needsattention' || normalized === 'needs_attention' || normalized === 'needs attention') {
      return t('status.needsAttention', { default: 'Needs attention' });
    }
    if (normalized === 'confirmed') return t('status.confirmed', { default: 'Confirmed' });
    if (normalized === 'inprogress' || normalized === 'in_progress' || normalized === 'in progress') {
      return t('status.inProgress', { default: 'In Progress' });
    }
    if (normalized === 'completed') return t('status.completed', { default: 'Completed' });
    if (normalized === 'cancelled' || normalized === 'canceled') {
      return t('status.cancelled', { default: 'Cancelled' });
    }
    if (normalized === 'noshow' || normalized === 'no_show' || normalized === 'no show') {
      return t('status.noShow', { default: 'No Show' });
    }

    return status;
  }, [t]);

  const getStatusChipTone = React.useCallback((status: string) => {
    const normalized = status.toLowerCase();

    if (normalized === 'needsattention' || normalized === 'needs_attention' || normalized === 'needs attention') {
      return 'border-rose-200 bg-rose-50/80 text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-300';
    }
    if (normalized === 'pending') {
      return 'border-amber-200 bg-amber-50/80 text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300';
    }
    if (normalized === 'confirmed' || normalized === 'completed') {
      return 'border-green-200 bg-green-50/80 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300';
    }
    if (normalized === 'cancelled' || normalized === 'canceled' || normalized === 'noshow' || normalized === 'no_show' || normalized === 'no show') {
      return 'border-red-200 bg-red-50/80 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300';
    }
    if (normalized === 'inprogress' || normalized === 'in_progress' || normalized === 'in progress') {
      return 'border-blue-200 bg-blue-50/80 text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    }

    return 'border-border bg-muted/40 text-foreground';
  }, []);

  const statusCountEntries = React.useMemo(() => {
    if (!statusCounts) return [];

    const order = new Map(statusOptions.map((option, index) => [option.value.toLowerCase(), index]));
    return Object.entries(statusCounts).sort(([statusA], [statusB]) => {
      const rankA = order.get(statusA.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;
      const rankB = order.get(statusB.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;

      if (rankA !== rankB) return rankA - rankB;
      return statusA.localeCompare(statusB);
    });
  }, [statusCounts, statusOptions]);

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
        } else if (normalized === 'needsattention' || normalized === 'needs_attention' || normalized === 'needs attention') {
          color = "border-rose-200 text-rose-700 dark:border-rose-800 dark:text-rose-300";
          icon = <XCircle className="w-3.5 h-3.5" />;
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
    <div className="space-y-6">
      {!kpis && !appointments.length && !recentPatients.length && (
        <div className="rounded-xl border border-dashed border-border p-6 text-center text-muted-foreground">
          No hay datos para mostrar en este rango.
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title={t('kpis.totalAppointments', { default: 'Total Appointments' })}
          value={kpisRange?.appointments?.value ?? '--'}
          delta={typeof kpisRange?.appointments?.deltaPercent === 'number' ? {
            value: `${kpisRange!.appointments!.deltaPercent}%`,
            trend: kpisRange!.appointments!.deltaPercent > 0 ? 'up' : kpisRange!.appointments!.deltaPercent < 0 ? 'down' : 'neutral',
            label: t('vsPrevious', { default: 'vs previous period' })
          } : undefined}
          variant="section"
          footerTitle={getTrendTitle(kpisRange?.appointments?.deltaPercent)}
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
            label: t('vsPrevious', { default: 'vs previous period' })
          } : undefined}
          variant="section"
          footerTitle={getTrendTitle(kpisRange?.completed?.deltaPercent)}
          footerDescription={t('kpis.completedDesc', { default: 'Citas con estado completado' })}
          icon={<CheckCircle2 className="w-6 h-6" />}
        />
        <KpiCard
          title={t('kpis.usersTotal', { default: 'Total Users' })}
          value={kpisRange?.usersTotalVsPrevMonth?.value ?? '--'}
          delta={typeof kpisRange?.usersTotalVsPrevMonth?.deltaPercent === 'number' ? {
            value: `${kpisRange!.usersTotalVsPrevMonth!.deltaPercent}%`,
            trend: kpisRange!.usersTotalVsPrevMonth!.deltaPercent > 0 ? 'up' : kpisRange!.usersTotalVsPrevMonth!.deltaPercent < 0 ? 'down' : 'neutral',
            label: t('vsPrevious', { default: 'vs previous period' })
          } : undefined}
          variant="section"
          footerTitle={getTrendTitle(kpisRange?.usersTotalVsPrevMonth?.deltaPercent)}
          footerDescription={t('kpis.uniqueEmail', { default: 'Pacientes únicos por email' })}
          icon={<UserIcon className="w-4 h-4" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)] xl:items-start">
        <div className="space-y-6">
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
            headerAction={
              <Button variant="outline" size="sm" onClick={() => openBookings("calendar")}>
                {t('charts.openCalendar', { default: 'Open calendar' })}
              </Button>
            }
            data={(series?.appointmentsDaily || []).map(d => ({ date: d.date, value: d.value }))}
            labels={{ last7: t('ranges.last7', { default: 'Last 7 Days' }), last30: t('ranges.last30', { default: 'Last 30 Days' }), thisWeek: t('ranges.thisWeek', { default: 'This Week' }), today: t('ranges.today', { default: 'Today' }), all: t('ranges.all', { default: 'All' }), series: t('charts.appointments', { default: 'Appointments' }) }}
            range={['today','thisWeek','last7','last30'].includes(range) ? (range as 'today'|'thisWeek'|'last7'|'last30') : 'all'}
            onRangeChange={(r) => onRangeChange?.(r as 'today'|'thisWeek'|'last7'|'last30'|'all')}
          />

          <Card className="bg-card text-card-foreground">
            <CardHeader className="pb-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="font-medium">{t('appointments.recentTitle', { default: 'Recent Appointments' })}</CardTitle>
                <Select value={range} onValueChange={(v) => onRangeChange?.(v as NonNullable<TherapistDashboardProps["range"]>)}>
                  <SelectTrigger className="h-8 w-full sm:w-[200px]" aria-label={t('ranges.label', { default: 'Filter range' })} title={t('ranges.tooltip', { default: 'Select a date range to filter the dashboard' })}>
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
              <div className="flex flex-col gap-2 pt-2 lg:flex-row lg:items-center lg:justify-between">
                {statusCountEntries.length ? (
                  <div className="hidden flex-wrap items-center gap-2 text-xs text-muted-foreground md:flex">
                    {statusCountEntries.map(([status, count]) => (
                      <span
                        key={status}
                        className={`rounded-md border px-2 py-0.5 ${getStatusChipTone(status)}`}
                      >
                        {getStatusLabel(status)}: <strong className="ml-1">{count}</strong>
                      </span>
                    ))}
                  </div>
                ) : <div />}
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

        <div className="space-y-6">
          <Card className="border-[rgb(var(--interactive-selected-rgb)_/_0.28)] bg-[rgb(var(--interactive-selected-rgb)_/_0.10)] text-foreground shadow-[0_18px_40px_-28px_rgb(var(--interactive-selected-rgb)_/_0.45)]">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-semibold">{t('upcoming.title', { default: 'Upcoming Appointment' })}</CardTitle>
                  {timeZoneLabel ? (
                    <CardDescription className="text-foreground/70">
                      {t('upcoming.timeZone', { default: 'Times shown in {timezone}.', timezone: timeZoneLabel })}
                    </CardDescription>
                  ) : null}
                </div>
                <Button
                  size="sm"
                  className="cursor-pointer bg-[rgb(var(--interactive-selected-rgb))] text-white shadow-sm transition-all duration-200 hover:-translate-y-px hover:bg-[rgb(var(--interactive-selected-strong-rgb))] hover:shadow-md focus-visible:ring-[rgb(var(--interactive-selected-rgb))]"
                  onClick={() => openBookings("list")}
                >
                  {t('upcoming.open', { default: 'Open bookings' })}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {upcoming ? (
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium opacity-90">{upcoming.name}</h4>
                    <p className="text-xs opacity-90">{upcoming.service || 'General'}</p>
                  </div>
                  <time
                    className="block text-sm font-medium"
                    dateTime={new Date(
                      upcoming.bookingSchedule || `${upcoming.date}T${upcoming.time}:00`
                    ).toISOString()}
                  >
                    {formatAppointmentLabel(upcoming)}
                  </time>
                </div>
              ) : (
                <p className="text-sm opacity-90">{t('upcoming.empty', { default: 'No upcoming appointment' })}</p>
              )}
            </CardContent>
          </Card>

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

          <Card className="bg-card text-card-foreground">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-sm font-medium">{t('recentPatients.title', { default: 'Recent Patients' })}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => openBookings("list")}>
                  {t('viewAll', { default: 'Ver todo' })}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentPatients.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">{t('recentPatients.empty', { default: 'No recent patients' })}</div>
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
      </div>
    </div>
  );
}
