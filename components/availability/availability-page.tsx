"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarIcon,
  CalendarRange,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Info,
  MapPin,
  Plus,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import { API_ENDPOINTS } from "@/constants";
import { AvailabilityMonthSummaryBadges } from "@/components/availability/availability-month-summary-badges";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppToast } from "@/hooks/use-app-toast";
import { useLocations } from "@/hooks";
import { useUser } from "@/contexts";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface TimeRangeState {
  startTime: string;
  endTime: string;
  isActive?: boolean;
}

interface AvailabilityDayState {
  id: string;
  date: string;
  isAvailable: boolean;
  sessionDurationMinutes: number;
  notes?: string | null;
  timeRanges: TimeRangeState[];
}

interface AvailabilityPeriodState {
  id: string;
  title?: string | null;
  notes?: string | null;
  startDate: string;
  endDate: string;
  therapist: {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
  };
  location: {
    id: string;
    title: string;
    timezone?: string | null;
  };
  days: AvailabilityDayState[];
  excludedDates: Array<{
    id: string;
    date: string;
    sessionDurationMinutes: number;
    notes?: string | null;
    timeRanges: TimeRangeState[];
  }>;
}

interface MonthSummaryDay {
  id: string;
  date: string;
  remainingSlots: number;
  hasAvailability: boolean;
}

interface MonthSummary {
  month: string;
  availableDays: number;
  totalRemainingSlots: number;
  days: MonthSummaryDay[];
}

interface PeriodFormState {
  title: string;
  notes: string;
  startDate: string;
  endDate: string;
  excludedDates: string[];
  sessionDurationMinutes: string;
  timeRanges: TimeRangeState[];
}

const todayKey = new Date().toISOString().slice(0, 10);
const currentMonthKey = todayKey.slice(0, 7);
const REVIEW_DAYS_PER_PAGE = 10;

const createEmptyTimeRange = (): TimeRangeState => ({
  startTime: "09:00",
  endTime: "17:00",
  isActive: true,
});

const defaultFormState: PeriodFormState = {
  title: "",
  notes: "",
  startDate: "",
  endDate: "",
  excludedDates: [],
  sessionDurationMinutes: "60",
  timeRanges: [createEmptyTimeRange()],
};

function toDateInput(value: string | Date) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value.slice(0, 10);
}

function formatDateLabel(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatMonthLabel(value: string) {
  return new Date(`${value}-01T12:00:00`).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function buildDefaultPeriodTitle(locationTitle: string, startDate: string, endDate: string) {
  if (startDate && endDate) {
    if (startDate === endDate) {
      return `${locationTitle} | ${startDate}`;
    }

    return `${locationTitle} | ${startDate} to ${endDate}`;
  }

  return `${locationTitle} | ${currentMonthKey}`;
}

function enumerateMonthKeys(startDate: string, endDate: string) {
  const keys: string[] = [];
  const cursor = new Date(`${startDate}T12:00:00`);
  const limit = new Date(`${endDate}T12:00:00`);

  cursor.setDate(1);
  limit.setDate(1);

  while (cursor <= limit) {
    keys.push(
      `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`,
    );
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return keys;
}

function cloneDay(day: AvailabilityDayState): AvailabilityDayState {
  return {
    ...day,
    notes: day.notes || "",
    timeRanges: day.timeRanges.map((range) => ({ ...range })),
  };
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function getTimeRangeValidation(timeRanges: TimeRangeState[]) {
  const invalidOrderIndexes = new Set<number>();
  const overlappingIndexes = new Set<number>();

  const normalized = timeRanges
    .map((range, index) => ({
      index,
      startTime: range.startTime,
      endTime: range.endTime,
      isActive: range.isActive,
    }))
    .filter((range) => range.isActive !== false && range.startTime && range.endTime)
    .map((range) => ({
      ...range,
      startMinutes: timeToMinutes(range.startTime),
      endMinutes: timeToMinutes(range.endTime),
    }))
    .sort((a, b) => a.startMinutes - b.startMinutes || a.endMinutes - b.endMinutes);

  for (const range of normalized) {
    if (range.endMinutes <= range.startMinutes) {
      invalidOrderIndexes.add(range.index);
    }
  }

  for (let index = 1; index < normalized.length; index += 1) {
    const previous = normalized[index - 1];
    const current = normalized[index];

    if (
      !invalidOrderIndexes.has(previous.index) &&
      !invalidOrderIndexes.has(current.index) &&
      current.startMinutes < previous.endMinutes
    ) {
      overlappingIndexes.add(previous.index);
      overlappingIndexes.add(current.index);
    }
  }

  return {
    invalidOrderIndexes,
    overlappingIndexes,
    hasInvalidOrder: invalidOrderIndexes.size > 0,
    hasOverlap: overlappingIndexes.size > 0,
    hasErrors: invalidOrderIndexes.size > 0 || overlappingIndexes.size > 0,
  };
}

function InfoHint({
  label,
  content,
}: {
  label: string;
  content: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="rounded-full text-muted-foreground transition hover:text-foreground"
          aria-label={`${label} information`}
        >
          <Info className="h-4 w-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-72 text-sm">{content}</TooltipContent>
    </Tooltip>
  );
}

function AvailabilityPeriodsSkeleton() {
  return (
    <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
      <div className="rounded-lg border bg-background">
        <div className="space-y-2 border-b px-4 py-3">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-44" />
        </div>
        <div className="space-y-2 p-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`period-skeleton-${index}`} className="space-y-2 rounded-lg border px-4 py-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-2/3" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 rounded-lg border bg-background p-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-6 w-32 rounded-full" />
        </div>
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={`day-skeleton-${index}`} className="space-y-2 rounded-lg border px-3 py-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AvailabilityPage() {
  const t = useTranslations("Availability");
  const tc = useTranslations("Common");
  const toast = useAppToast();
  const { prismaUser, loading: userLoading } = useUser();
  const { locations, loading: locationsLoading, error: locationsError } = useLocations();

  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey);
  const [periods, setPeriods] = useState<AvailabilityPeriodState[]>([]);
  const [summary, setSummary] = useState<MonthSummary | null>(null);
  const [editDays, setEditDays] = useState<Record<string, AvailabilityDayState>>({});
  const [form, setForm] = useState<PeriodFormState>(defaultFormState);
  const [loadingPeriods, setLoadingPeriods] = useState(false);
  const [savingPeriod, setSavingPeriod] = useState(false);
  const [savingDayId, setSavingDayId] = useState<string | null>(null);
  const [deletingPeriodId, setDeletingPeriodId] = useState<string | null>(null);
  const [periodsError, setPeriodsError] = useState<string | null>(null);
  const [excludedDateOpen, setExcludedDateOpen] = useState(false);
  const [restoringExcludedDateId, setRestoringExcludedDateId] = useState<string | null>(null);
  const [selectedReviewPeriodId, setSelectedReviewPeriodId] = useState<string | null>(null);
  const [selectedReviewDayId, setSelectedReviewDayId] = useState<string | null>(null);
  const [reviewDaysPage, setReviewDaysPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [periodIdToDelete, setPeriodIdToDelete] = useState<string | null>(null);

  const activeTherapistId = prismaUser?.id ?? null;

  const selectedLocation = locations.find((location) => location.id === selectedLocationId);
  const canLoadAvailability = Boolean(activeTherapistId && selectedLocationId);

  const activeProfessionalName = useMemo(() => {
    if (prismaUser) {
      return `${prismaUser.firstname} ${prismaUser.lastname}`.trim();
    }

    return "";
  }, [prismaUser]);

  const initializeEditDays = useCallback((nextPeriods: AvailabilityPeriodState[]) => {
    setEditDays(
      nextPeriods.reduce<Record<string, AvailabilityDayState>>((acc, period) => {
        for (const day of period.days) {
          acc[day.id] = cloneDay(day);
        }
        return acc;
      }, {}),
    );
  }, []);

  const loadAvailability = useCallback(async () => {
    if (!canLoadAvailability || !activeTherapistId) {
      setPeriods([]);
      setSummary(null);
      setEditDays({});
      setPeriodsError(null);
      return;
    }

    try {
      setLoadingPeriods(true);
      setPeriodsError(null);

      const periodsParams = new URLSearchParams({
        therapistId: activeTherapistId,
        locationId: selectedLocationId,
      });
      const summaryParams = new URLSearchParams({
        therapistId: activeTherapistId,
        locationId: selectedLocationId,
        month: selectedMonth,
      });

      const [periodsResponse, summaryResponse] = await Promise.all([
        fetch(`${API_ENDPOINTS.AVAILABILITY.PERIODS}?${periodsParams.toString()}`, {
          cache: "no-store",
        }),
        fetch(`${API_ENDPOINTS.AVAILABILITY.CALENDAR}?${summaryParams.toString()}`, {
          cache: "no-store",
        }),
      ]);

      const periodsResult = await periodsResponse.json();
      const summaryResult = await summaryResponse.json();

      if (!periodsResponse.ok || !periodsResult.success) {
        throw new Error(periodsResult.error || t("errorLoadingAvailability"));
      }

      if (!summaryResponse.ok || !summaryResult.success) {
        throw new Error(summaryResult.error || t("errorLoadingAvailability"));
      }

      const normalizedPeriods = (periodsResult.data || []).map((period: AvailabilityPeriodState) => ({
        ...period,
        startDate: toDateInput(period.startDate),
        endDate: toDateInput(period.endDate),
        days: period.days.map((day) => ({
          ...day,
          date: toDateInput(day.date),
          notes: day.notes || "",
          timeRanges: day.timeRanges?.length
            ? day.timeRanges.map((range) => ({ ...range }))
            : [createEmptyTimeRange()],
        })),
        excludedDates: (period.excludedDates || []).map((excludedDate) => ({
          ...excludedDate,
          date: toDateInput(excludedDate.date),
          notes: excludedDate.notes || "",
          timeRanges: excludedDate.timeRanges?.length
            ? excludedDate.timeRanges.map((range) => ({ ...range }))
            : [],
        })),
      }));

      setPeriods(normalizedPeriods);
      initializeEditDays(normalizedPeriods);
      setSummary(summaryResult.data || null);
    } catch (error) {
      const message = error instanceof Error ? error.message : t("errorLoadingAvailability");
      setPeriodsError(message);
      setPeriods([]);
      setSummary(null);
      setEditDays({});
    } finally {
      setLoadingPeriods(false);
    }
  }, [
    activeTherapistId,
    canLoadAvailability,
    initializeEditDays,
    selectedLocationId,
    selectedMonth,
    t,
  ]);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  const updateFormRange = (index: number, updates: Partial<TimeRangeState>) => {
    setForm((current) => ({
      ...current,
      timeRanges: current.timeRanges.map((range, rangeIndex) =>
        rangeIndex === index ? { ...range, ...updates } : range,
      ),
    }));
  };

  const updateDayRange = (dayId: string, index: number, updates: Partial<TimeRangeState>) => {
    setEditDays((current) => ({
      ...current,
      [dayId]: {
        ...current[dayId],
        timeRanges: current[dayId].timeRanges.map((range, rangeIndex) =>
          rangeIndex === index ? { ...range, ...updates } : range,
        ),
      },
    }));
  };

  const addFormRange = () => {
    setForm((current) => ({
      ...current,
      timeRanges: [...current.timeRanges, createEmptyTimeRange()],
    }));
  };

  const addDayRange = (dayId: string) => {
    setEditDays((current) => ({
      ...current,
      [dayId]: {
        ...current[dayId],
        timeRanges: [...current[dayId].timeRanges, createEmptyTimeRange()],
      },
    }));
  };

  const removeFormRange = (index: number) => {
    setForm((current) => ({
      ...current,
      timeRanges:
        current.timeRanges.length > 1
          ? current.timeRanges.filter((_, rangeIndex) => rangeIndex !== index)
          : current.timeRanges,
    }));
  };

  const removeDayRange = (dayId: string, index: number) => {
    setEditDays((current) => ({
      ...current,
      [dayId]: {
        ...current[dayId],
        timeRanges:
          current[dayId].timeRanges.length > 1
            ? current[dayId].timeRanges.filter((_, rangeIndex) => rangeIndex !== index)
            : current[dayId].timeRanges,
      },
    }));
  };

  const addExcludedDate = (date?: Date) => {
    if (!date) return;

    const value = date.toISOString().slice(0, 10);

    if (
      (form.startDate && value < form.startDate) ||
      (form.endDate && value > form.endDate)
    ) {
      toast.error(t("excludedDateOutsideRange"));
      return;
    }

    setForm((current) => ({
      ...current,
      excludedDates: Array.from(new Set([...current.excludedDates, value])).sort(),
    }));
    setExcludedDateOpen(false);
  };

  const removeExcludedDate = (value: string) => {
    setForm((current) => ({
      ...current,
      excludedDates: current.excludedDates.filter((date) => date !== value),
    }));
  };

  const handleCreatePeriod = async () => {
    if (!activeTherapistId || !selectedLocationId) {
      toast.error(t("chooseLocation"));
      return;
    }

    if (formTimeRangeValidation.hasInvalidOrder) {
      toast.error(t("invalidTimeSlot"));
      return;
    }

    if (formTimeRangeValidation.hasOverlap) {
      toast.error(t("timeRangeOverlap"));
      return;
    }

    try {
      setSavingPeriod(true);

      const payload = {
        therapistId: activeTherapistId,
        locationId: selectedLocationId,
        title: form.title || undefined,
        notes: form.notes || undefined,
        startDate: form.startDate,
        endDate: form.endDate,
        excludedDates: form.excludedDates,
        sessionDurationMinutes: Number(form.sessionDurationMinutes),
        timeRanges: form.timeRanges.filter((range) => range.startTime && range.endTime),
      };

      const response = await fetch(API_ENDPOINTS.AVAILABILITY.PERIODS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || t("errorLoadingAvailability"));
      }

      toast.success(t("periodCreated"));
      setForm(defaultFormState);
      await loadAvailability();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errorLoadingAvailability"));
    } finally {
      setSavingPeriod(false);
    }
  };

  const handleDeletePeriod = (periodId: string) => {
    setPeriodIdToDelete(periodId);
    setDeleteDialogOpen(true);
  };

  const confirmDeletePeriod = async () => {
    if (!periodIdToDelete) return;
    try {
      setDeletingPeriodId(periodIdToDelete);
      const response = await fetch(API_ENDPOINTS.AVAILABILITY.PERIOD_BY_ID(periodIdToDelete), {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || t("errorLoadingAvailability"));
      }

      toast.success(t("periodDeleted"));
      await loadAvailability();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errorLoadingAvailability"));
    } finally {
      setDeletingPeriodId(null);
      setDeleteDialogOpen(false);
      setPeriodIdToDelete(null);
    }
  };

  const handleSaveDay = async (dayId: string) => {
    const day = editDays[dayId];

    if (!day) return;

    const dayTimeRangeValidation = getTimeRangeValidation(day.timeRanges);
    if (dayTimeRangeValidation.hasInvalidOrder) {
      toast.error(t("invalidTimeSlot"));
      return;
    }

    if (dayTimeRangeValidation.hasOverlap) {
      toast.error(t("timeRangeOverlap"));
      return;
    }

    try {
      setSavingDayId(dayId);
      const response = await fetch(API_ENDPOINTS.AVAILABILITY.DAY_BY_ID(dayId), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isAvailable: day.isAvailable,
          sessionDurationMinutes: Number(day.sessionDurationMinutes),
          notes: day.notes || undefined,
          timeRanges: day.timeRanges.filter((range) => range.startTime && range.endTime),
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || t("errorLoadingAvailability"));
      }

      toast.success(t("dayUpdated"));
      await loadAvailability();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errorLoadingAvailability"));
    } finally {
      setSavingDayId(null);
    }
  };

  const handleRestoreExcludedDate = async (periodId: string, excludedDateId: string) => {
    try {
      setRestoringExcludedDateId(excludedDateId);
      const response = await fetch(API_ENDPOINTS.AVAILABILITY.RESTORE_EXCLUDED_DATE(periodId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "restore-excluded-date",
          excludedDateId,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || t("errorLoadingAvailability"));
      }

      toast.success(t("excludedDateRestored"));
      await loadAvailability();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errorLoadingAvailability"));
    } finally {
      setRestoringExcludedDateId(null);
    }
  };

  const professionalContextMissing = !userLoading && !activeTherapistId;
  const defaultPeriodTitle = useMemo(() => {
    if (!selectedLocation) {
      return t("periodTitleAuto");
    }

    if (!form.startDate || !form.endDate) {
      return t("periodTitlePlaceholder", { location: selectedLocation.title });
    }

    return buildDefaultPeriodTitle(selectedLocation.title, form.startDate, form.endDate);
  }, [form.endDate, form.startDate, selectedLocation, t]);
  const createMonthKey = form.startDate ? form.startDate.slice(0, 7) : selectedMonth;
  const formTimeRangeValidation = useMemo(
    () => getTimeRangeValidation(form.timeRanges),
    [form.timeRanges],
  );
  const createMonthOpenDays = useMemo(() => {
    const openDates = new Set<string>();

    for (const period of periods) {
      for (const day of period.days) {
        if (day.isAvailable && day.date.startsWith(createMonthKey)) {
          openDates.add(day.date);
        }
      }
    }

    return openDates.size;
  }, [createMonthKey, periods]);
  const reviewPeriods = useMemo(
    () =>
      periods
        .filter((period) => enumerateMonthKeys(period.startDate, period.endDate).includes(selectedMonth))
        .map((period) => ({
          ...period,
          visibleDays: period.days.filter((day) => day.date.startsWith(selectedMonth)),
          visibleExcludedDates: period.excludedDates.filter((excludedDate) =>
            excludedDate.date.startsWith(selectedMonth),
          ),
        })),
    [periods, selectedMonth],
  );
  const selectedReviewPeriod = useMemo(() => {
    if (!reviewPeriods.length) return null;

    return (
      reviewPeriods.find((period) => period.id === selectedReviewPeriodId) ||
      reviewPeriods[0]
    );
  }, [reviewPeriods, selectedReviewPeriodId]);
  const selectedReviewPeriodDays = useMemo(
    () => selectedReviewPeriod?.visibleDays || [],
    [selectedReviewPeriod],
  );
  const totalReviewDayPages = useMemo(
    () => Math.max(1, Math.ceil(selectedReviewPeriodDays.length / REVIEW_DAYS_PER_PAGE)),
    [selectedReviewPeriodDays.length],
  );
  const safeReviewDaysPage = Math.min(reviewDaysPage, totalReviewDayPages);
  const paginatedReviewDays = useMemo(() => {
    const start = (safeReviewDaysPage - 1) * REVIEW_DAYS_PER_PAGE;
    return selectedReviewPeriodDays.slice(start, start + REVIEW_DAYS_PER_PAGE);
  }, [safeReviewDaysPage, selectedReviewPeriodDays]);
  const currentReviewRangeStart = selectedReviewPeriodDays.length
    ? (safeReviewDaysPage - 1) * REVIEW_DAYS_PER_PAGE + 1
    : 0;
  const currentReviewRangeEnd = selectedReviewPeriodDays.length
    ? Math.min(safeReviewDaysPage * REVIEW_DAYS_PER_PAGE, selectedReviewPeriodDays.length)
    : 0;
  const selectedReviewDay = useMemo(() => {
    if (!paginatedReviewDays.length) return null;

    return (
      paginatedReviewDays.find((day) => day.id === selectedReviewDayId) ||
      paginatedReviewDays[0]
    );
  }, [paginatedReviewDays, selectedReviewDayId]);
  const createDisabledReason = useMemo(() => {
    if (!activeTherapistId) return t("createDisabledProfessional");
    if (!selectedLocationId) return t("createDisabledLocation");
    if (!form.startDate || !form.endDate) return t("createDisabledDates");
    if (!form.sessionDurationMinutes) return t("createDisabledSessionLength");
    if (formTimeRangeValidation.hasInvalidOrder) return t("invalidTimeSlot");
    if (formTimeRangeValidation.hasOverlap) return t("timeRangeOverlap");
    if (!form.timeRanges.some((range) => range.startTime && range.endTime)) {
      return t("createDisabledTimeRanges");
    }
    return null;
  }, [
    activeTherapistId,
    form.endDate,
    form.sessionDurationMinutes,
    form.startDate,
    formTimeRangeValidation.hasInvalidOrder,
    formTimeRangeValidation.hasOverlap,
    form.timeRanges,
    selectedLocationId,
    t,
  ]);
  const plannerDisabledReason = useMemo(() => {
    if (!activeTherapistId) return t("createDisabledProfessional");
    if (!selectedLocationId) return t("createDisabledLocation");
    return null;
  }, [activeTherapistId, selectedLocationId, t]);

  useEffect(() => {
    if (!reviewPeriods.length) {
      setSelectedReviewPeriodId(null);
      setSelectedReviewDayId(null);
      return;
    }

    setSelectedReviewPeriodId((current) => {
      if (current && reviewPeriods.some((period) => period.id === current)) {
        return current;
      }

      return reviewPeriods[0].id;
    });
  }, [reviewPeriods]);

  useEffect(() => {
    if (!paginatedReviewDays.length) {
      setSelectedReviewDayId(null);
      return;
    }

    setSelectedReviewDayId((current) => {
      if (
        current &&
        paginatedReviewDays.some((day) => day.id === current)
      ) {
        return current;
      }

      return paginatedReviewDays[0].id;
    });
  }, [paginatedReviewDays]);

  useEffect(() => {
    setReviewDaysPage(1);
  }, [selectedReviewPeriod?.id]);

  useEffect(() => {
    if (reviewDaysPage > totalReviewDayPages) {
      setReviewDaysPage(totalReviewDayPages);
    }
  }, [reviewDaysPage, totalReviewDayPages]);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="motion-stagger space-y-6">
      <Card>
        <CardHeader className="space-y-2 pb-3">
          <CardTitle>{t("plannerTitle")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("plannerDescription")}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="surface-panel space-y-3 px-4 py-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-semibold">{t("selectLocation")}</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("selectLocationDescription")}
                  </p>
                </div>
              </div>

              <div className="max-w-xl space-y-2">
                <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
                  <SelectTrigger className="h-11 bg-background">
                    <SelectValue placeholder={t("selectLocation")} />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {locationsError ? (
                  <p className="text-xs text-destructive">{t("errorLoadingLocations")}</p>
                ) : null}
                {plannerDisabledReason ? (
                  <Alert variant="warning" className="mt-2">
                    <AlertDescription>{plannerDisabledReason}</AlertDescription>
                  </Alert>
                ) : null}
              </div>
            </div>

            <div className="surface-panel flex min-w-0 items-center gap-3 px-4 py-4 text-sm">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <UserRound className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t("professional")}
                </p>
                <p className="truncate font-medium text-foreground">
                  {activeProfessionalName || t("title")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {professionalContextMissing ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            {t("noProfessionalContext")}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="space-y-6 pt-6">
          <Tabs defaultValue="review" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="review">{t("reviewTitle")}</TabsTrigger>
              <TabsTrigger value="create">{t("createPeriod")}</TabsTrigger>
            </TabsList>
            <TabsContent value="review" className="space-y-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label>{t("selectedMonth")}</Label>
                    <InfoHint
                      label={t("selectedMonth")}
                      content={t("help.selectedMonth")}
                    />
                  </div>
                  <Input
                    type="month"
                    value={selectedMonth}
                    onChange={(event) => setSelectedMonth(event.target.value)}
                    className="w-full lg:w-56"
                  />
                </div>
                <AvailabilityMonthSummaryBadges
                  monthLabel={formatMonthLabel(selectedMonth)}
                  openDays={summary?.availableDays ?? 0}
                  remainingSessions={summary?.totalRemainingSlots ?? 0}
                />
              </div>

              {!selectedLocationId ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-6 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
                  {t("chooseLocationToReview")}
                </div>
              ) : (
                <div className="space-y-4 rounded-xl border bg-muted/10 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <CalendarRange className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{t("availabilityPeriods")}</p>
                      <p className="text-sm text-muted-foreground">{t("monthSummary")}</p>
                    </div>
                  </div>

                  {loadingPeriods ? (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">{t("loadingAvailability")}</p>
                      <AvailabilityPeriodsSkeleton />
                    </div>
                  ) : reviewPeriods.length === 0 ? (
                    <div className="text-sm text-muted-foreground">{t("noPeriods")}</div>
                  ) : (
                    <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
                      <div className="rounded-lg border bg-background">
                        <div className="border-b px-4 py-3">
                          <p className="font-semibold text-foreground capitalize">
                            {formatMonthLabel(selectedMonth)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {reviewPeriods.length} {t("availablePeriodsForMonth")}
                          </p>
                        </div>
                        <div className="space-y-2 p-3">
                          {reviewPeriods.map((period, index) => {
                            const isActive = selectedReviewPeriod?.id === period.id;
                            const openDays = period.visibleDays.filter((day) => day.isAvailable).length;
                            const periodMonths = enumerateMonthKeys(period.startDate, period.endDate);

                            return (
                              <div
                                key={period.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => setSelectedReviewPeriodId(period.id)}
                                onKeyDown={(event) => {
                                  if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    setSelectedReviewPeriodId(period.id);
                                  }
                                }}
                                className={`w-full cursor-pointer rounded-lg border px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                                  isActive
                                    ? "interactive-selected shadow-sm"
                                    : "border-border/80 bg-card/70 hover:border-primary/40 hover:bg-primary/5"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="truncate font-medium text-foreground">
                                      {period.title || `${t("periodTitle")} ${index + 1}`}
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                      {formatDateLabel(period.startDate)} - {formatDateLabel(period.endDate)}
                                    </p>
                                  </div>
                                  <ChevronDown
                                    className={`mt-1 h-4 w-4 shrink-0 text-muted-foreground transition ${
                                      isActive ? "rotate-[-90deg]" : ""
                                    }`}
                                  />
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  <Badge variant="outline" className="rounded-full">
                                    {period.location.title}
                                  </Badge>
                                  <Badge variant="info" className="rounded-full">
                                    {t("openDays")}: {openDays}
                                  </Badge>
                                  {period.visibleExcludedDates.length ? (
                                    <Badge variant="warning" className="rounded-full">
                                      {t("excludedDates")}: {period.visibleExcludedDates.length}
                                    </Badge>
                                  ) : null}
                                  {periodMonths.length > 1 ? (
                                    <Badge variant="secondary" className="rounded-full">
                                      {t("spansMonths", { count: periodMonths.length })}
                                      <span className="ml-1 inline-flex">
                                        <InfoHint
                                          label={t("spansMonths", { count: periodMonths.length })}
                                          content={t("help.spansMonths")}
                                        />
                                      </span>
                                    </Badge>
                                  ) : null}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-4 rounded-lg border bg-background p-4">
                        {selectedReviewPeriod ? (
                          <>
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                              <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-xl font-semibold text-foreground">
                                    {selectedReviewPeriod.title || t("availabilityPeriods")}
                                  </p>
                                  {enumerateMonthKeys(
                                    selectedReviewPeriod.startDate,
                                    selectedReviewPeriod.endDate,
                                  ).length > 1 ? (
                                    <Badge variant="secondary" className="rounded-full">
                                      {t("spansMonths", {
                                        count: enumerateMonthKeys(
                                          selectedReviewPeriod.startDate,
                                          selectedReviewPeriod.endDate,
                                        ).length,
                                      })}
                                      <span className="ml-1 inline-flex">
                                        <InfoHint
                                          label={t("spansMonths", {
                                            count: enumerateMonthKeys(
                                              selectedReviewPeriod.startDate,
                                              selectedReviewPeriod.endDate,
                                            ).length,
                                          })}
                                          content={t("help.spansMonths")}
                                        />
                                      </span>
                                    </Badge>
                                  ) : null}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {formatDateLabel(selectedReviewPeriod.startDate)} -{" "}
                                  {formatDateLabel(selectedReviewPeriod.endDate)}
                                </p>
                                {selectedReviewPeriod.notes ? (
                                  <p className="text-sm text-muted-foreground">
                                    {selectedReviewPeriod.notes}
                                  </p>
                                ) : null}
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleDeletePeriod(selectedReviewPeriod.id)}
                                disabled={deletingPeriodId === selectedReviewPeriod.id}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {deletingPeriodId === selectedReviewPeriod.id
                                  ? t("loading")
                                  : t("deletePeriod")}
                              </Button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="rounded-full">
                                {selectedReviewPeriod.location.title}
                              </Badge>
                              <Badge variant="info" className="rounded-full">
                                {t("openDays")}:{" "}
                                {selectedReviewPeriod.visibleDays.filter((day) => day.isAvailable).length}
                              </Badge>
                              <Badge variant="success" className="rounded-full">
                                {t("remainingSessions")}:{" "}
                                {selectedReviewPeriod.visibleDays.reduce((sum, day) => {
                                  const daySummary = summary?.days.find(
                                    (summaryDay) => summaryDay.id === day.id,
                                  );
                                  return sum + (daySummary?.remainingSlots ?? 0);
                                }, 0)}
                              </Badge>
                            </div>

                            {selectedReviewPeriod.visibleExcludedDates.length ? (
                              <Alert variant="warning" className="space-y-2 p-4">
                                <div className="flex items-center justify-between gap-3">
                                  <p className="text-sm font-medium text-foreground">
                                    {t("excludedDates")}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {selectedReviewPeriod.visibleExcludedDates.length}
                                  </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {selectedReviewPeriod.visibleExcludedDates.map((excludedDate) => (
                                    <Badge
                                      key={excludedDate.id}
                                      variant="warning"
                                      className="gap-2 rounded-full px-3 py-1.5"
                                    >
                                      <span>{formatDateLabel(excludedDate.date)}</span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleRestoreExcludedDate(
                                            selectedReviewPeriod.id,
                                            excludedDate.id,
                                          )
                                        }
                                        disabled={restoringExcludedDateId === excludedDate.id}
                                        className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary transition hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                                      >
                                        {restoringExcludedDateId === excludedDate.id
                                          ? t("restoringExcludedDate")
                                          : t("restoreExcludedDate")}
                                      </button>
                                      <InfoHint
                                        label={t("restoreExcludedDate")}
                                        content={t("help.restoreExcludedDate")}
                                      />
                                    </Badge>
                                  ))}
                                </div>
                              </Alert>
                            ) : null}

                              <div className="space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <p className="font-medium text-foreground">{t("timeRanges")}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {selectedReviewPeriod.visibleDays.length} {t("openDays").toLowerCase()}
                                    </p>
                                  </div>
                                  {totalReviewDayPages > 1 ? (
                                    <div className="flex items-center gap-2">
                                      <p className="text-xs text-muted-foreground">
                                        {currentReviewRangeStart}-{currentReviewRangeEnd} / {selectedReviewPeriodDays.length}
                                      </p>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setReviewDaysPage((current) => Math.max(1, current - 1))}
                                        disabled={safeReviewDaysPage === 1}
                                      >
                                        <ChevronLeft className="mr-1 h-4 w-4" />
                                        {tc("previous")}
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          setReviewDaysPage((current) =>
                                            Math.min(totalReviewDayPages, current + 1),
                                          )
                                        }
                                        disabled={safeReviewDaysPage === totalReviewDayPages}
                                      >
                                        {tc("next")}
                                        <ChevronRight className="ml-1 h-4 w-4" />
                                      </Button>
                                    </div>
                                  ) : null}
                                </div>

                              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                                {paginatedReviewDays.map((day) => {
                                  const isActive = selectedReviewDay?.id === day.id;
                                  const daySummary = summary?.days.find(
                                    (summaryDay) => summaryDay.id === day.id,
                                  );

                                  return (
                                    <button
                                      key={day.id}
                                      type="button"
                                      onClick={() => setSelectedReviewDayId(day.id)}
                                      className={`rounded-lg border px-3 py-3 text-left transition ${
                                        isActive
                                          ? "interactive-selected shadow-sm"
                                          : "border-border/80 bg-card/70 hover:border-primary/40 hover:bg-primary/5"
                                        }`}
                                      >
                                      <div className="flex items-start justify-between gap-3">
                                        <div>
                                          <p className="font-medium text-foreground">
                                            {formatDateLabel(day.date)}
                                          </p>
                                          <p className="mt-1 text-sm text-muted-foreground">
                                            {t("remainingSessions")}: {daySummary?.remainingSlots ?? 0}
                                          </p>
                                        </div>
                                        <Badge
                                          variant={day.isAvailable ? "outline" : "secondary"}
                                          className="rounded-full"
                                        >
                                          {day.isAvailable ? t("enabled") : t("disabled")}
                                        </Badge>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {selectedReviewDay ? (() => {
                              const draft = editDays[selectedReviewDay.id] || cloneDay(selectedReviewDay);
                              const draftTimeRangeValidation = getTimeRangeValidation(
                                draft.timeRanges,
                              );
                              const daySummary = summary?.days.find(
                                (summaryDay) => summaryDay.id === selectedReviewDay.id,
                              );

                              return (
                                <div className="space-y-4 rounded-lg border bg-muted/10 p-4">
                                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div>
                                      <p className="text-lg font-semibold text-foreground">
                                        {formatDateLabel(selectedReviewDay.date)}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {t("remainingSessions")}: {daySummary?.remainingSlots ?? 0}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Checkbox
                                        id={`closed-${selectedReviewDay.id}`}
                                        checked={!draft.isAvailable}
                                        onCheckedChange={(checked) =>
                                          setEditDays((current) => ({
                                            ...current,
                                            [selectedReviewDay.id]: {
                                              ...draft,
                                              isAvailable: !Boolean(checked),
                                            },
                                          }))
                                        }
                                      />
                                      <Label htmlFor={`closed-${selectedReviewDay.id}`}>
                                        {t("markDayClosed")}
                                      </Label>
                                      <InfoHint
                                        label={t("markDayClosed")}
                                        content={t("help.markDayClosed")}
                                      />
                                    </div>
                                  </div>

                                  <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <Label htmlFor={`duration-${selectedReviewDay.id}`}>
                                          {t("sessionLength")}
                                        </Label>
                                        <InfoHint
                                          label={t("sessionLength")}
                                          content={t("help.sessionLength")}
                                        />
                                      </div>
                                      <Input
                                        id={`duration-${selectedReviewDay.id}`}
                                        type="number"
                                        min="5"
                                        step="5"
                                        value={draft.sessionDurationMinutes}
                                        onChange={(event) =>
                                          setEditDays((current) => ({
                                            ...current,
                                            [selectedReviewDay.id]: {
                                              ...draft,
                                              sessionDurationMinutes: Number(
                                                event.target.value || 0,
                                              ),
                                            },
                                          }))
                                        }
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <Label htmlFor={`notes-${selectedReviewDay.id}`}>
                                          {t("notes")}
                                        </Label>
                                        <InfoHint
                                          label={t("notes")}
                                          content={t("help.notes")}
                                        />
                                      </div>
                                      <Input
                                        id={`notes-${selectedReviewDay.id}`}
                                        value={draft.notes || ""}
                                        onChange={(event) =>
                                          setEditDays((current) => ({
                                            ...current,
                                            [selectedReviewDay.id]: {
                                              ...draft,
                                              notes: event.target.value,
                                            },
                                          }))
                                        }
                                      />
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <Label>{t("timeRanges")}</Label>
                                        <InfoHint
                                          label={t("timeRanges")}
                                          content={t("help.timeRanges")}
                                        />
                                      </div>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addDayRange(selectedReviewDay.id)}
                                      >
                                        <Plus className="mr-2 h-4 w-4" />
                                        {t("addTimeRange")}
                                      </Button>
                                    </div>

                                    {draft.timeRanges.map((range, index) => {
                                      const rowInvalid =
                                        draftTimeRangeValidation.invalidOrderIndexes.has(index) ||
                                        draftTimeRangeValidation.overlappingIndexes.has(index);

                                      return (
                                        <div
                                          key={`${selectedReviewDay.id}-range-${index}`}
                                          className="space-y-2"
                                        >
                                          <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                                            <Input
                                              type="time"
                                              value={range.startTime}
                                              aria-invalid={rowInvalid}
                                              className={cn(
                                                rowInvalid && "border-red-500 ring-1 ring-red-500/20",
                                              )}
                                              onChange={(event) =>
                                                updateDayRange(selectedReviewDay.id, index, {
                                                  startTime: event.target.value,
                                                })
                                              }
                                            />
                                            <Input
                                              type="time"
                                              value={range.endTime}
                                              aria-invalid={rowInvalid}
                                              className={cn(
                                                rowInvalid && "border-red-500 ring-1 ring-red-500/20",
                                              )}
                                              onChange={(event) =>
                                                updateDayRange(selectedReviewDay.id, index, {
                                                  endTime: event.target.value,
                                                })
                                              }
                                            />
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="icon"
                                              onClick={() =>
                                                removeDayRange(selectedReviewDay.id, index)
                                              }
                                              disabled={draft.timeRanges.length === 1}
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </div>
                                          {draftTimeRangeValidation.invalidOrderIndexes.has(index) ? (
                                            <p className="text-sm text-red-500">{t("invalidTimeSlot")}</p>
                                          ) : draftTimeRangeValidation.overlappingIndexes.has(index) ? (
                                            <p className="text-sm text-red-500">{t("timeRangeOverlap")}</p>
                                          ) : null}
                                        </div>
                                      );
                                    })}
                                  </div>

                                  <Button
                                    type="button"
                                    onClick={() => handleSaveDay(selectedReviewDay.id)}
                                    disabled={
                                      savingDayId === selectedReviewDay.id ||
                                      draftTimeRangeValidation.hasErrors
                                    }
                                  >
                                    <Clock3 className="mr-2 h-4 w-4" />
                                    {savingDayId === selectedReviewDay.id
                                      ? t("savingDay")
                                      : t("saveDay")}
                                  </Button>
                                </div>
                              );
                            })() : null}
                          </>
                        ) : (
                          <Alert variant="info">
                            <AlertDescription>{t("noPeriods")}</AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="create" className="space-y-4">
              {createDisabledReason ? (
                <Alert variant="warning">
                  <AlertDescription>{createDisabledReason}</AlertDescription>
                </Alert>
              ) : null}

              <div className="surface-panel p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{t("openDays")}</p>
                      <InfoHint
                        label={t("openDays")}
                        content={t("help.createMonthOpenDays")}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatMonthLabel(createMonthKey)}
                    </p>
                  </div>
                  <Badge variant="info" className="rounded-full px-3 py-1 text-sm font-normal">
                    <span className="text-muted-foreground">{t("openDays")}:</span>
                    <span className="ml-1 font-medium text-foreground">{createMonthOpenDays}</span>
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="period-title">{t("periodTitle")}</Label>
                    <InfoHint
                      label={t("periodTitle")}
                      content={t("help.periodTitle")}
                    />
                  </div>
                  <Input
                    id="period-title"
                    placeholder={defaultPeriodTitle}
                    value={form.title}
                    onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">{t("periodTitleAutoHelp")}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="session-duration">{t("sessionLength")}</Label>
                    <InfoHint
                      label={t("sessionLength")}
                      content={t("help.sessionLength")}
                    />
                  </div>
                  <Input
                    id="session-duration"
                    type="number"
                    min="5"
                    step="5"
                    value={form.sessionDurationMinutes}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        sessionDurationMinutes: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="start-date">{t("startDate")}</Label>
                    <InfoHint
                      label={t("startDate")}
                      content={t("help.startDate")}
                    />
                  </div>
                  <Input
                    id="start-date"
                    type="date"
                    min={todayKey}
                    value={form.startDate}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        startDate: event.target.value,
                        excludedDates: current.excludedDates.filter((date) => date >= event.target.value),
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="end-date">{t("endDate")}</Label>
                    <InfoHint
                      label={t("endDate")}
                      content={t("help.endDate")}
                    />
                  </div>
                  <Input
                    id="end-date"
                    type="date"
                    min={form.startDate || todayKey}
                    value={form.endDate}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        endDate: event.target.value,
                        excludedDates: current.excludedDates.filter((date) => date <= event.target.value),
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="period-notes">{t("notes")}</Label>
                  <InfoHint
                    label={t("notes")}
                    content={t("help.notes")}
                  />
                </div>
                <Textarea
                  id="period-notes"
                  value={form.notes}
                  onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label>{t("excludedDates")}</Label>
                    <InfoHint
                      label={t("excludedDates")}
                      content={t("help.excludedDates")}
                    />
                  </div>
                  <Popover open={excludedDateOpen} onOpenChange={setExcludedDateOpen}>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="outline" size="sm">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {t("addExcludedDate")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="single"
                        selected={undefined}
                        onSelect={addExcludedDate}
                        disabled={(date) => {
                          const value = date.toISOString().slice(0, 10);

                          if (form.startDate && value < form.startDate) return true;
                          if (form.endDate && value > form.endDate) return true;
                          return false;
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {form.excludedDates.length ? (
                  <div className="flex flex-wrap gap-2">
                    {form.excludedDates.map((date) => (
                      <Badge key={date} variant="secondary" className="gap-1 rounded-full px-3 py-1">
                        {formatDateLabel(date)}
                        <button
                          type="button"
                          onClick={() => removeExcludedDate(date)}
                          className="rounded-full p-0.5 hover:bg-black/10"
                          aria-label={`${t("remove")} ${date}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">{t("noExcludedDates")}</p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label>{t("timeRanges")}</Label>
                    <InfoHint
                      label={t("timeRanges")}
                      content={t("help.timeRanges")}
                    />
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addFormRange}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t("addTimeRange")}
                  </Button>
                </div>

                {form.timeRanges.map((range, index) => {
                  const rowInvalid =
                    formTimeRangeValidation.invalidOrderIndexes.has(index) ||
                    formTimeRangeValidation.overlappingIndexes.has(index);

                  return (
                    <div key={`period-range-${index}`} className="space-y-2">
                      <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                        <Input
                          type="time"
                          value={range.startTime}
                          aria-invalid={rowInvalid}
                          className={cn(
                            rowInvalid && "border-red-500 ring-1 ring-red-500/20",
                          )}
                          onChange={(event) => updateFormRange(index, { startTime: event.target.value })}
                        />
                        <Input
                          type="time"
                          value={range.endTime}
                          aria-invalid={rowInvalid}
                          className={cn(
                            rowInvalid && "border-red-500 ring-1 ring-red-500/20",
                          )}
                          onChange={(event) => updateFormRange(index, { endTime: event.target.value })}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFormRange(index)}
                          disabled={form.timeRanges.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {formTimeRangeValidation.invalidOrderIndexes.has(index) ? (
                        <p className="text-sm text-red-500">{t("invalidTimeSlot")}</p>
                      ) : formTimeRangeValidation.overlappingIndexes.has(index) ? (
                        <p className="text-sm text-red-500">{t("timeRangeOverlap")}</p>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <Button
                type="button"
                onClick={handleCreatePeriod}
                disabled={Boolean(savingPeriod || userLoading || locationsLoading || createDisabledReason)}
              >
                {savingPeriod ? t("creating") : t("createAvailability")}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {periodsError ? (
        <Card>
          <CardContent className="pt-6 text-sm text-destructive">{periodsError}</CardContent>
        </Card>
      ) : null}

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setPeriodIdToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deletePeriod")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirmDeletePeriod")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(deletingPeriodId)}>
              {t("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePeriod}
              disabled={Boolean(deletingPeriodId)}
            >
              {deletingPeriodId ? t("loading") : t("deletePeriod")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
