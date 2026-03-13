"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Building2,
  ChevronsUpDown,
  Check,
  Clock3,
  FileText,
  Globe2,
  LayoutTemplate,
  Loader2,
  Upload,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { LandingPageBuilder } from "@/components/company/landing-page-builder";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SaveReminderCallout } from "@/components/ui/save-reminder-callout";
import { SurfaceCard } from "@/components/ui/surface-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAppToast } from "@/hooks/use-app-toast";
import {
  DEFAULT_LANDING_PAGE_CONFIG,
  normalizeLandingPageConfig,
  normalizeLandingPageLocale,
  type LandingPageConfig,
} from "@/lib/company/landing-page-config";
import { SUPPORTED_COMPANY_TIMEZONES } from "@/lib/constants/supported-timezones";
import {
  isValidEmailInput,
  isValidPhoneInput,
  isValidUrlInput,
  normalizeEmailInput,
  normalizePhoneInput,
  normalizeUrlInput,
  normalizeWhitespace,
} from "@/lib/validation/form-fields";
import { cn } from "@/lib/utils";

type CompanyProfile = {
  id: string;
  name: string;
  slug: string;
  logo: string;
  headerLogo: string;
  publicEmail: string;
  publicPhone: string;
  publicDescription: string;
  publicSummary: string;
  publicSpecialty: string;
  landingPageConfig: LandingPageConfig;
  defaultTimezone: string;
  weekdaysHours: string;
  saturdayHours: string;
  sundayHours: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  twitter: string;
  tiktok: string;
  youtube: string;
  website: string;
  canEdit: boolean;
};

const EMPTY_COMPANY: CompanyProfile = {
  id: "",
  name: "",
  slug: "",
  logo: "",
  headerLogo: "",
  publicEmail: "",
  publicPhone: "",
  publicDescription: "",
  publicSummary: "",
  publicSpecialty: "",
  landingPageConfig: normalizeLandingPageConfig(undefined),
  defaultTimezone: "America/Los_Angeles",
  weekdaysHours: "9:00 AM - 6:00 PM",
  saturdayHours: "9:00 AM - 2:00 PM",
  sundayHours: "Closed",
  facebook: "",
  instagram: "",
  linkedin: "",
  twitter: "",
  tiktok: "",
  youtube: "",
  website: "",
  canEdit: false,
};

const CLOSED_HOURS_VALUE = "Closed";

type DayHoursState = {
  isClosed: boolean;
  startTime: string;
  endTime: string;
};

type CompanyProfileResponse = Partial<CompanyProfile> & {
  canEdit?: boolean | null;
};

type CompanySection = "brand" | "public" | "landing" | "contact" | "social";

function getCompanyProfileSnapshot(profile: CompanyProfile) {
  return JSON.stringify({
    id: profile.id,
    name: profile.name,
    slug: profile.slug,
    logo: profile.logo,
    headerLogo: profile.headerLogo,
    publicEmail: profile.publicEmail,
    publicPhone: profile.publicPhone,
    publicDescription: profile.publicDescription,
    publicSummary: profile.publicSummary,
    publicSpecialty: profile.publicSpecialty,
    landingPageConfig: profile.landingPageConfig,
    defaultTimezone: profile.defaultTimezone,
    weekdaysHours: profile.weekdaysHours,
    saturdayHours: profile.saturdayHours,
    sundayHours: profile.sundayHours,
    facebook: profile.facebook,
    instagram: profile.instagram,
    linkedin: profile.linkedin,
    twitter: profile.twitter,
    tiktok: profile.tiktok,
    youtube: profile.youtube,
    website: profile.website,
  });
}

function getSavedBrandImages(snapshot: string) {
  const parsed = JSON.parse(snapshot) as {
    logo?: string;
    headerLogo?: string;
  };

  return {
    logo: parsed.logo ?? "",
    headerLogo: parsed.headerLogo ?? "",
  };
}

function padTwoDigits(value: number) {
  return value.toString().padStart(2, "0");
}

function convertHourTo12Hour(value: string) {
  const [rawHour, rawMinute] = value.split(":").map(Number);
  const period = rawHour >= 12 ? "PM" : "AM";
  const hour = rawHour % 12 || 12;
  return `${hour}:${padTwoDigits(rawMinute)} ${period}`;
}

function parseHoursValue(value: string | undefined): DayHoursState {
  if (!value || value.trim() === "" || value.trim().toLowerCase() === "closed") {
    return {
      isClosed: true,
      startTime: "09:00",
      endTime: "17:00",
    };
  }

  const match = value
    .trim()
    .match(/^(\d{1,2}):(\d{2})\s?(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s?(AM|PM)$/i);

  if (!match) {
    return {
      isClosed: false,
      startTime: "09:00",
      endTime: "17:00",
    };
  }

  const [, startHour, startMinute, startPeriod, endHour, endMinute, endPeriod] = match;
  const to24Hour = (hour: string, minute: string, period: string) => {
    const parsedHour = Number(hour) % 12 + (period.toUpperCase() === "PM" ? 12 : 0);
    const normalizedHour =
      period.toUpperCase() === "AM" && Number(hour) === 12 ? 0 : parsedHour;
    return `${padTwoDigits(normalizedHour)}:${minute}`;
  };

  return {
    isClosed: false,
    startTime: to24Hour(startHour, startMinute, startPeriod),
    endTime: to24Hour(endHour, endMinute, endPeriod),
  };
}

function formatHoursValue(state: DayHoursState): string {
  if (state.isClosed) {
    return CLOSED_HOURS_VALUE;
  }

  return `${convertHourTo12Hour(state.startTime)} - ${convertHourTo12Hour(state.endTime)}`;
}

function normalizeCompanyProfile(
  data: CompanyProfileResponse | null | undefined,
): CompanyProfile {
  return {
    ...EMPTY_COMPANY,
    ...data,
    id: data?.id ?? "",
    name: data?.name ?? "",
    slug: data?.slug ?? "",
    logo: data?.logo ?? "",
    headerLogo: data?.headerLogo ?? "",
    publicEmail: data?.publicEmail ?? "",
    publicPhone: data?.publicPhone ?? "",
    publicDescription: data?.publicDescription ?? "",
    publicSummary: data?.publicSummary ?? "",
    publicSpecialty: data?.publicSpecialty ?? "",
    landingPageConfig: normalizeLandingPageConfig(data?.landingPageConfig),
    defaultTimezone: data?.defaultTimezone ?? "America/Los_Angeles",
    weekdaysHours: data?.weekdaysHours ?? "9:00 AM - 6:00 PM",
    saturdayHours: data?.saturdayHours ?? "9:00 AM - 2:00 PM",
    sundayHours: data?.sundayHours ?? "Closed",
    facebook: data?.facebook ?? "",
    instagram: data?.instagram ?? "",
    linkedin: data?.linkedin ?? "",
    twitter: data?.twitter ?? "",
    tiktok: data?.tiktok ?? "",
    youtube: data?.youtube ?? "",
    website: data?.website ?? "",
    canEdit: Boolean(data?.canEdit),
  };
}

function HoursInputRow({
  label,
  value,
  disabled,
  onChange,
  t,
}: {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (nextValue: string) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
}) {
  const parsed = parseHoursValue(value);

  const updateParsedValue = (next: Partial<DayHoursState>) => {
    const nextValue = { ...parsed, ...next };
    onChange(formatHoursValue(nextValue));
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)] sm:items-center">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={parsed.isClosed}
            onChange={(event) => updateParsedValue({ isClosed: event.target.checked })}
            disabled={disabled}
            className="h-4 w-4 rounded border-border"
          />
          {t("hoursClosed")}
        </label>
        <Input
          type="time"
          value={parsed.startTime}
          onChange={(event) => updateParsedValue({ isClosed: false, startTime: event.target.value })}
          disabled={disabled || parsed.isClosed}
        />
        <Input
          type="time"
          value={parsed.endTime}
          onChange={(event) => updateParsedValue({ isClosed: false, endTime: event.target.value })}
          disabled={disabled || parsed.isClosed}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {parsed.isClosed
          ? t("hoursPreviewClosed")
          : t("hoursPreview", { range: formatHoursValue(parsed) })}
      </p>
    </div>
  );
}

function ThemePaletteEditor({
  title,
  description,
  primaryColor,
  accentColor,
  disabled,
  resetLabel,
  canReset,
  onPrimaryChange,
  onAccentChange,
  onReset,
  previewLabel,
  primaryLabel,
  accentLabel,
}: {
  title: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  disabled: boolean;
  resetLabel: string;
  canReset: boolean;
  onPrimaryChange: (nextColor: string) => void;
  onAccentChange: (nextColor: string) => void;
  onReset: () => void;
  previewLabel: string;
  primaryLabel: string;
  accentLabel: string;
}) {
  return (
    <div className="rounded-[24px] border border-border/70 bg-background/70 p-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-base font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onReset}
              disabled={disabled || !canReset}
              className="rounded-full"
            >
              {resetLabel}
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{primaryLabel}</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="color"
                  value={primaryColor}
                  onChange={(event) => onPrimaryChange(event.target.value)}
                  disabled={disabled}
                  className="h-11 w-16 rounded-xl p-1"
                />
                <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {primaryColor}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{accentLabel}</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="color"
                  value={accentColor}
                  onChange={(event) => onAccentChange(event.target.value)}
                  disabled={disabled}
                  className="h-11 w-16 rounded-xl p-1"
                />
                <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {accentColor}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {previewLabel}
          </p>
          <div
            className="overflow-hidden rounded-[22px] border border-border/70"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
            }}
          >
            <div className="bg-[linear-gradient(180deg,rgba(255,255,255,0.20)_0%,rgba(15,23,42,0.12)_100%)] p-5">
              <div className="rounded-[18px] border border-white/25 bg-white/12 p-4 text-white backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/78">
                  {title}
                </p>
                <p className="mt-2 text-sm text-white/86">{description}</p>
                <div className="mt-4 flex gap-2">
                  <span className="h-3.5 w-10 rounded-full bg-white/90" />
                  <span className="h-3.5 w-16 rounded-full bg-white/55" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CompanyProfileForm() {
  const locale = normalizeLandingPageLocale(useLocale());
  const t = useTranslations("CompanyProfile");
  const toast = useAppToast();
  const [formData, setFormData] = useState<CompanyProfile>(EMPTY_COMPANY);
  const [savedSnapshot, setSavedSnapshot] = useState(getCompanyProfileSnapshot(EMPTY_COMPANY));
  const [activeSection, setActiveSection] = useState<CompanySection>("brand");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [timeZoneOpen, setTimeZoneOpen] = useState(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (hasLoadedRef.current) {
      return;
    }
    hasLoadedRef.current = true;

    const fetchCompany = async () => {
      try {
        const response = await fetch("/api/company/profile");
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.error || t("loadError"));
        }

        const normalizedProfile = normalizeCompanyProfile(data.data ?? data);
        setFormData(normalizedProfile);
        setSavedSnapshot(getCompanyProfileSnapshot(normalizedProfile));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t("loadError"));
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [t, toast]);

  const convertFileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const nextValue =
      name === "publicEmail"
        ? normalizeEmailInput(value)
        : name === "publicSummary" || name === "publicDescription"
          ? value
          : [
              "website",
              "facebook",
              "instagram",
              "linkedin",
              "twitter",
              "tiktok",
              "youtube",
            ].includes(name)
            ? value.trim()
            : normalizeWhitespace(value);

    setFormData((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handleFieldChange = <K extends keyof CompanyProfile>(
    name: K,
    value: CompanyProfile[K],
  ) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t("invalidImage"));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("imageTooLarge"));
      return;
    }

    try {
      const logo = await convertFileToBase64(file);
      setFormData((prev) => ({ ...prev, logo }));
      toast.success(t("logoLoaded"));
    } catch (error) {
      console.error("Error converting company logo:", error);
      toast.error(t("logoLoadError"));
    }
  };

  const handleHeaderLogoChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t("invalidImage"));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("imageTooLarge"));
      return;
    }

    try {
      const headerLogo = await convertFileToBase64(file);
      setFormData((prev) => ({ ...prev, headerLogo }));
      toast.success(t("headerLogoLoaded"));
    } catch (error) {
      console.error("Error converting company header logo:", error);
      toast.error(t("logoLoadError"));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);
    if (!formData.canEdit) {
      toast.error(t("forbidden"));
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        name: normalizeWhitespace(formData.name),
        publicEmail: normalizeEmailInput(formData.publicEmail),
        publicPhone: normalizePhoneInput(formData.publicPhone),
        publicDescription: formData.publicDescription.trim(),
        publicSummary: formData.publicSummary.trim(),
        publicSpecialty: normalizeWhitespace(formData.publicSpecialty),
        landingPageConfig: normalizeLandingPageConfig(formData.landingPageConfig),
        weekdaysHours: formData.weekdaysHours.trim(),
        saturdayHours: formData.saturdayHours.trim(),
        sundayHours: formData.sundayHours.trim(),
        website: normalizeUrlInput(formData.website),
        facebook: normalizeUrlInput(formData.facebook),
        instagram: normalizeUrlInput(formData.instagram),
        linkedin: normalizeUrlInput(formData.linkedin),
        twitter: normalizeUrlInput(formData.twitter),
        tiktok: normalizeUrlInput(formData.tiktok),
        youtube: normalizeUrlInput(formData.youtube),
      };

      if (!payload.name) {
        setActiveSection("brand");
        toast.error(t("saveError"));
        return;
      }

      if (payload.publicEmail && !isValidEmailInput(payload.publicEmail)) {
        setActiveSection("contact");
        toast.error(t("saveError"));
        return;
      }

      if (payload.publicPhone && !isValidPhoneInput(payload.publicPhone)) {
        setActiveSection("contact");
        toast.error(t("saveError"));
        return;
      }

      const invalidUrlField = (
        ["website", "facebook", "instagram", "linkedin", "twitter", "tiktok", "youtube"] as const
      ).find((field) => payload[field] && !isValidUrlInput(payload[field]));

      if (invalidUrlField) {
        setActiveSection("social");
        toast.error(t("saveError"));
        return;
      }

      const response = await fetch("/api/company/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || t("saveError"));
      }

      const nextProfile = normalizeCompanyProfile({
        ...formData,
        ...(data.data ?? data),
        canEdit: formData.canEdit,
      });
      setFormData(nextProfile);
      setSavedSnapshot(getCompanyProfileSnapshot(nextProfile));
      setHasAttemptedSubmit(false);
      toast.success(t("saved"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const invalidPublicEmail =
    hasAttemptedSubmit &&
    Boolean(formData.publicEmail.trim()) &&
    !isValidEmailInput(formData.publicEmail);
  const invalidPublicPhone =
    hasAttemptedSubmit &&
    Boolean(normalizePhoneInput(formData.publicPhone)) &&
    !isValidPhoneInput(normalizePhoneInput(formData.publicPhone));
  const invalidUrls = {
    website: hasAttemptedSubmit && Boolean(formData.website.trim()) && !isValidUrlInput(formData.website),
    facebook: hasAttemptedSubmit && Boolean(formData.facebook.trim()) && !isValidUrlInput(formData.facebook),
    instagram: hasAttemptedSubmit && Boolean(formData.instagram.trim()) && !isValidUrlInput(formData.instagram),
    linkedin: hasAttemptedSubmit && Boolean(formData.linkedin.trim()) && !isValidUrlInput(formData.linkedin),
    twitter: hasAttemptedSubmit && Boolean(formData.twitter.trim()) && !isValidUrlInput(formData.twitter),
    tiktok: hasAttemptedSubmit && Boolean(formData.tiktok.trim()) && !isValidUrlInput(formData.tiktok),
    youtube: hasAttemptedSubmit && Boolean(formData.youtube.trim()) && !isValidUrlInput(formData.youtube),
  };
  const invalidName = hasAttemptedSubmit && !normalizeWhitespace(formData.name);
  const hasPendingChanges = getCompanyProfileSnapshot(formData) !== savedSnapshot;
  const savedBrandImages = getSavedBrandImages(savedSnapshot);
  const hasPendingBrandImageChanges =
    formData.logo !== savedBrandImages.logo ||
    formData.headerLogo !== savedBrandImages.headerLogo;
  const canResetThemeColors =
    formData.landingPageConfig.theme.primary !== DEFAULT_LANDING_PAGE_CONFIG.theme.primary ||
    formData.landingPageConfig.theme.accent !== DEFAULT_LANDING_PAGE_CONFIG.theme.accent;
  const sections = [
    {
      value: "brand" as const,
      label: t("brandSection"),
      description: t("brandSectionDescription"),
      icon: Building2,
    },
    {
      value: "public" as const,
      label: t("publicSection"),
      description: t("publicSectionDescription"),
      icon: FileText,
    },
    {
      value: "landing" as const,
      label: t("landingSection"),
      description: t("landingSectionDescription"),
      icon: LayoutTemplate,
    },
    {
      value: "contact" as const,
      label: t("contactSection"),
      description: t("contactSectionDescription"),
      icon: Clock3,
    },
    {
      value: "social" as const,
      label: t("socialSection"),
      description: t("socialSectionDescription"),
      icon: Globe2,
    },
  ];
  const currentSection =
    sections.find((section) => section.value === activeSection) ?? sections[0];
  const CurrentSectionIcon = currentSection.icon;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!formData.canEdit ? (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
          {t("readOnlyNotice")}
        </div>
      ) : null}

      <Tabs
        value={activeSection}
        onValueChange={(value) => setActiveSection(value as CompanySection)}
        className="gap-6"
      >
        <div className="space-y-4 lg:sticky lg:top-[calc(var(--visible-header-offset,0px)+1rem)] lg:z-20">
          <SurfaceCard variant="glass" className="gap-4 p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {currentSection.label}
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                    <CurrentSectionIcon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-semibold">
                      {formData.name || t("title")}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {currentSection.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <div className="flex flex-wrap gap-2">
                  {formData.defaultTimezone ? (
                    <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
                      {formData.defaultTimezone}
                    </span>
                  ) : null}
                  {hasPendingChanges ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-900 dark:text-amber-200">
                      <AlertCircle className="size-3.5" />
                      {t("pendingChangesBadge")}
                    </span>
                  ) : (
                    <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-800 dark:text-emerald-200">
                      {t("savedState")}
                    </span>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={!formData.canEdit || saving || !hasPendingChanges}
                  className="min-w-[168px]"
                >
                  {saving ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("saving")}
                    </span>
                  ) : (
                    t("save")
                  )}
                </Button>
              </div>
            </div>
            {hasPendingChanges ? (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
                <p className="font-medium">{t("pendingChangesTitle")}</p>
                <p className="mt-1 text-amber-900/80 dark:text-amber-100/80">
                  {t("pendingChangesDescription")}
                </p>
              </div>
            ) : null}
          </SurfaceCard>

          <SurfaceCard variant="elevated" className="gap-0 p-2">
            <TabsList
              aria-label={t("title")}
              className="grid h-auto w-full grid-cols-1 gap-2 rounded-[20px] border-0 bg-transparent p-0 shadow-none sm:grid-cols-2 xl:grid-cols-5"
            >
              {sections.map((section) => {
                const SectionIcon = section.icon;

                return (
                  <TabsTrigger
                    key={section.value}
                    value={section.value}
                    className="h-auto w-full flex-col items-start gap-2 rounded-[18px] border border-border/60 bg-background/60 px-4 py-3 text-left whitespace-normal"
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <SectionIcon className="size-4" />
                      {section.label}
                    </span>
                    <span className="line-clamp-2 text-left text-xs font-normal opacity-80">
                      {section.description}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </SurfaceCard>
        </div>

        <TabsContent value="brand" className="mt-0">
          <SurfaceCard variant="panel" className="gap-6 p-6 sm:p-8">
            <section className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">{t("brandSection")}</h2>
                <p className="text-sm text-muted-foreground">
                  {t("brandSectionDescription")}
                </p>
              </div>

              <div className="max-w-xl space-y-2">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("name")}</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!formData.canEdit || saving}
                    autoComplete="organization"
                    maxLength={120}
                    aria-invalid={invalidName}
                    className={cn(invalidName && "border-red-500 ring-1 ring-red-500/20")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">{t("logo")}</Label>
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <Input
                    id="logo"
                    name="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    disabled={!formData.canEdit || saving}
                    className="max-w-sm"
                  />
                  {formData.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={formData.logo}
                      alt={formData.name || "Company logo"}
                      className="h-20 w-20 rounded-xl border bg-background/90 object-contain p-2"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed text-muted-foreground">
                      <Upload className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{t("logoHint")}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="headerLogo">{t("headerLogo")}</Label>
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <Input
                    id="headerLogo"
                    name="headerLogo"
                    type="file"
                    accept="image/*"
                    onChange={handleHeaderLogoChange}
                    disabled={!formData.canEdit || saving}
                    className="max-w-sm"
                  />
                  {formData.headerLogo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={formData.headerLogo}
                      alt={formData.name || "Company header logo"}
                      className="h-16 w-40 rounded-xl border bg-background/90 object-contain p-2"
                    />
                  ) : (
                    <div className="flex h-16 min-w-40 items-center justify-center rounded-xl border border-dashed px-4 text-sm text-muted-foreground">
                      {formData.name || t("headerLogoFallback")}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{t("headerLogoHint")}</p>
              </div>

              {hasPendingBrandImageChanges ? (
                <SaveReminderCallout>{t("imagePendingSave")}</SaveReminderCallout>
              ) : null}

              <section className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold">{t("themeSectionTitle")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("themeSectionDescription")}
                  </p>
                </div>

                <div className="grid gap-4">
                  <ThemePaletteEditor
                    title={t("sharedThemeTitle")}
                    description={t("sharedThemeDescription")}
                    primaryColor={formData.landingPageConfig.theme.primary}
                    accentColor={formData.landingPageConfig.theme.accent}
                    disabled={!formData.canEdit || saving}
                    resetLabel={t("themeReset")}
                    canReset={canResetThemeColors}
                    onPrimaryChange={(nextColor) =>
                      handleFieldChange("landingPageConfig", {
                        ...formData.landingPageConfig,
                        theme: {
                          ...formData.landingPageConfig.theme,
                          primary: nextColor,
                        },
                      })
                    }
                    onAccentChange={(nextColor) =>
                      handleFieldChange("landingPageConfig", {
                        ...formData.landingPageConfig,
                        theme: {
                          ...formData.landingPageConfig.theme,
                          accent: nextColor,
                        },
                      })
                    }
                    onReset={() =>
                      handleFieldChange("landingPageConfig", {
                        ...formData.landingPageConfig,
                        theme: {
                          ...DEFAULT_LANDING_PAGE_CONFIG.theme,
                        },
                      })
                    }
                    previewLabel={t("themePreview")}
                    primaryLabel={t("themePrimary")}
                    accentLabel={t("themeAccent")}
                  />
                </div>
              </section>
            </section>
          </SurfaceCard>
        </TabsContent>

        <TabsContent value="public" className="mt-0">
          <SurfaceCard variant="panel" className="gap-6 p-6 sm:p-8">
            <section className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">{t("publicSection")}</h2>
                <p className="text-sm text-muted-foreground">
                  {t("publicSectionDescription")}
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="publicSpecialty">{t("publicSpecialty")}</Label>
                  <Input
                    id="publicSpecialty"
                    name="publicSpecialty"
                    value={formData.publicSpecialty}
                    onChange={handleChange}
                    disabled={!formData.canEdit || saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultTimezone">{t("defaultTimezone")}</Label>
                  <Popover open={timeZoneOpen} onOpenChange={setTimeZoneOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        id="defaultTimezone"
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={timeZoneOpen}
                        className="w-full justify-between font-normal"
                        disabled={!formData.canEdit || saving}
                      >
                        <span className="truncate text-left">
                          {formData.defaultTimezone || t("timeZonePlaceholderShort")}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[--radix-popover-trigger-width] min-w-[320px] p-0"
                      align="start"
                    >
                      <Command>
                        <CommandInput placeholder={t("timeZoneSearch")} />
                        <CommandList>
                          <ScrollArea className="h-72">
                            <CommandEmpty>{t("timeZoneNotFound")}</CommandEmpty>
                            <CommandGroup>
                              {SUPPORTED_COMPANY_TIMEZONES.map((timezone) => (
                                <CommandItem
                                  key={timezone}
                                  value={timezone}
                                  onSelect={() => {
                                    handleFieldChange("defaultTimezone", timezone);
                                    setTimeZoneOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      formData.defaultTimezone === timezone
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  <span className="truncate">{timezone}</span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </ScrollArea>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-muted-foreground">
                    {t("defaultTimezoneHint")}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="publicSummary">{t("publicSummary")}</Label>
                <Textarea
                  id="publicSummary"
                  name="publicSummary"
                  value={formData.publicSummary}
                  onChange={handleChange}
                  disabled={!formData.canEdit || saving}
                  rows={4}
                  maxLength={300}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="publicDescription">{t("publicDescription")}</Label>
                <Textarea
                  id="publicDescription"
                  name="publicDescription"
                  value={formData.publicDescription}
                  onChange={handleChange}
                  disabled={!formData.canEdit || saving}
                  rows={3}
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground">
                  {t("publicDescriptionHint")}
                </p>
              </div>
            </section>
          </SurfaceCard>
        </TabsContent>

        <TabsContent value="landing" className="mt-0">
          <SurfaceCard variant="panel" className="gap-6 p-6 sm:p-8">
            <LandingPageBuilder
              value={formData.landingPageConfig}
              onChange={(landingPageConfig) =>
                handleFieldChange("landingPageConfig", landingPageConfig)
              }
              disabled={!formData.canEdit || saving}
              locale={locale}
              previewData={{
                companyName: formData.name,
                publicSpecialty: formData.publicSpecialty,
                publicSummary: formData.publicSummary,
                logo: formData.logo,
              }}
            />
          </SurfaceCard>
        </TabsContent>

        <TabsContent value="contact" className="mt-0">
          <SurfaceCard variant="panel" className="gap-6 p-6 sm:p-8">
            <section className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">{t("contactSection")}</h2>
                <p className="text-sm text-muted-foreground">
                  {t("contactSectionDescription")}
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="publicEmail">{t("publicEmail")}</Label>
                  <Input
                    id="publicEmail"
                    name="publicEmail"
                    type="email"
                    value={formData.publicEmail}
                    onChange={handleChange}
                    disabled={!formData.canEdit || saving}
                    autoComplete="email"
                    autoCapitalize="none"
                    inputMode="email"
                    spellCheck={false}
                    aria-invalid={invalidPublicEmail}
                    className={cn(
                      invalidPublicEmail && "border-red-500 ring-1 ring-red-500/20",
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="publicPhone">{t("publicPhone")}</Label>
                  <PhoneInput
                    id="publicPhone"
                    name="publicPhone"
                    value={formData.publicPhone}
                    onChange={(value) =>
                      handleFieldChange("publicPhone", normalizePhoneInput(value || ""))
                    }
                    defaultCountry="US"
                    international
                    disabled={!formData.canEdit || saving}
                    autoComplete="tel"
                    aria-invalid={invalidPublicPhone}
                    className={cn(
                      invalidPublicPhone &&
                        "[&_input]:border-red-500 [&_input]:ring-1 [&_input]:ring-red-500/20",
                    )}
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <HoursInputRow
                  label={t("weekdaysHours")}
                  value={formData.weekdaysHours}
                  disabled={!formData.canEdit || saving}
                  onChange={(value) => handleFieldChange("weekdaysHours", value)}
                  t={t}
                />
                <HoursInputRow
                  label={t("saturdayHours")}
                  value={formData.saturdayHours}
                  disabled={!formData.canEdit || saving}
                  onChange={(value) => handleFieldChange("saturdayHours", value)}
                  t={t}
                />
                <HoursInputRow
                  label={t("sundayHours")}
                  value={formData.sundayHours}
                  disabled={!formData.canEdit || saving}
                  onChange={(value) => handleFieldChange("sundayHours", value)}
                  t={t}
                />
              </div>
            </section>
          </SurfaceCard>
        </TabsContent>

        <TabsContent value="social" className="mt-0">
          <SurfaceCard variant="panel" className="gap-6 p-6 sm:p-8">
            <section className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">{t("socialSection")}</h2>
                <p className="text-sm text-muted-foreground">
                  {t("socialSectionDescription")}
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="website">{t("website")}</Label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleChange}
                    disabled={!formData.canEdit || saving}
                    autoCapitalize="none"
                    spellCheck={false}
                    inputMode="url"
                    placeholder="https://example.com"
                    aria-invalid={invalidUrls.website}
                    className={cn(invalidUrls.website && "border-red-500 ring-1 ring-red-500/20")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook">{t("facebook")}</Label>
                  <Input
                    id="facebook"
                    name="facebook"
                    type="url"
                    value={formData.facebook}
                    onChange={handleChange}
                    disabled={!formData.canEdit || saving}
                    autoCapitalize="none"
                    spellCheck={false}
                    inputMode="url"
                    placeholder="https://facebook.com/..."
                    aria-invalid={invalidUrls.facebook}
                    className={cn(invalidUrls.facebook && "border-red-500 ring-1 ring-red-500/20")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">{t("instagram")}</Label>
                  <Input
                    id="instagram"
                    name="instagram"
                    type="url"
                    value={formData.instagram}
                    onChange={handleChange}
                    disabled={!formData.canEdit || saving}
                    autoCapitalize="none"
                    spellCheck={false}
                    inputMode="url"
                    placeholder="https://instagram.com/..."
                    aria-invalid={invalidUrls.instagram}
                    className={cn(
                      invalidUrls.instagram && "border-red-500 ring-1 ring-red-500/20",
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">{t("linkedin")}</Label>
                  <Input
                    id="linkedin"
                    name="linkedin"
                    type="url"
                    value={formData.linkedin}
                    onChange={handleChange}
                    disabled={!formData.canEdit || saving}
                    autoCapitalize="none"
                    spellCheck={false}
                    inputMode="url"
                    placeholder="https://linkedin.com/..."
                    aria-invalid={invalidUrls.linkedin}
                    className={cn(invalidUrls.linkedin && "border-red-500 ring-1 ring-red-500/20")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter">{t("twitter")}</Label>
                  <Input
                    id="twitter"
                    name="twitter"
                    type="url"
                    value={formData.twitter}
                    onChange={handleChange}
                    disabled={!formData.canEdit || saving}
                    autoCapitalize="none"
                    spellCheck={false}
                    inputMode="url"
                    placeholder="https://x.com/..."
                    aria-invalid={invalidUrls.twitter}
                    className={cn(invalidUrls.twitter && "border-red-500 ring-1 ring-red-500/20")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tiktok">{t("tiktok")}</Label>
                  <Input
                    id="tiktok"
                    name="tiktok"
                    type="url"
                    value={formData.tiktok}
                    onChange={handleChange}
                    disabled={!formData.canEdit || saving}
                    autoCapitalize="none"
                    spellCheck={false}
                    inputMode="url"
                    placeholder="https://tiktok.com/..."
                    aria-invalid={invalidUrls.tiktok}
                    className={cn(invalidUrls.tiktok && "border-red-500 ring-1 ring-red-500/20")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtube">{t("youtube")}</Label>
                  <Input
                    id="youtube"
                    name="youtube"
                    type="url"
                    value={formData.youtube}
                    onChange={handleChange}
                    disabled={!formData.canEdit || saving}
                    autoCapitalize="none"
                    spellCheck={false}
                    inputMode="url"
                    placeholder="https://youtube.com/..."
                    aria-invalid={invalidUrls.youtube}
                    className={cn(invalidUrls.youtube && "border-red-500 ring-1 ring-red-500/20")}
                  />
                </div>
              </div>
            </section>
          </SurfaceCard>
        </TabsContent>
      </Tabs>
    </form>
  );
}
