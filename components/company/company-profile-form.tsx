"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronsUpDown, Loader2, Upload } from "lucide-react";
import { useTranslations } from "next-intl";

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
import { Textarea } from "@/components/ui/textarea";
import { useAppToast } from "@/hooks/use-app-toast";
import { SUPPORTED_COMPANY_TIMEZONES } from "@/lib/constants/supported-timezones";
import {
  isValidEmailInput,
  isValidPhoneInput,
  isValidUrlInput,
  normalizeEmailInput,
  normalizePhoneInput,
  normalizeSlugInput,
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

export function CompanyProfileForm() {
  const t = useTranslations("CompanyProfile");
  const toast = useAppToast();
  const [formData, setFormData] = useState<CompanyProfile>(EMPTY_COMPANY);
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

        setFormData(normalizeCompanyProfile(data));
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
      name === "slug"
        ? normalizeSlugInput(value)
        : name === "publicEmail"
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

  const handleFieldChange = (name: keyof CompanyProfile, value: string | boolean) => {
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
        slug: normalizeSlugInput(formData.slug),
        publicEmail: normalizeEmailInput(formData.publicEmail),
        publicPhone: normalizePhoneInput(formData.publicPhone),
        publicDescription: formData.publicDescription.trim(),
        publicSummary: formData.publicSummary.trim(),
        publicSpecialty: normalizeWhitespace(formData.publicSpecialty),
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
        toast.error(t("saveError"));
        return;
      }

      if (payload.publicEmail && !isValidEmailInput(payload.publicEmail)) {
        toast.error(t("saveError"));
        return;
      }

      if (payload.publicPhone && !isValidPhoneInput(payload.publicPhone)) {
        toast.error(t("saveError"));
        return;
      }

      for (const field of [
        "website",
        "facebook",
        "instagram",
        "linkedin",
        "twitter",
        "tiktok",
        "youtube",
      ] as const) {
        if (payload[field] && !isValidUrlInput(payload[field])) {
          toast.error(t("saveError"));
          return;
        }
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

      setFormData((prev) =>
        normalizeCompanyProfile({
          ...prev,
          ...data,
          canEdit: prev.canEdit,
        }),
      );
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

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {!formData.canEdit ? (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
          {t("readOnlyNotice")}
        </div>
      ) : null}

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">{t("brandSection")}</h2>
          <p className="text-sm text-muted-foreground">{t("brandSectionDescription")}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">{t("name")}</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} disabled={!formData.canEdit || saving} autoComplete="organization" maxLength={120} aria-invalid={invalidName} className={cn(invalidName && "border-red-500 ring-1 ring-red-500/20")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">{t("slug")}</Label>
            <Input id="slug" name="slug" value={formData.slug} onChange={handleChange} disabled={!formData.canEdit || saving} spellCheck={false} autoCapitalize="none" maxLength={80} />
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
                className="h-20 w-20 rounded-xl border object-cover"
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
                className="h-16 w-40 rounded-xl border object-cover"
              />
            ) : (
              <div className="flex h-16 min-w-40 items-center justify-center rounded-xl border border-dashed px-4 text-sm text-muted-foreground">
                {formData.name || t("headerLogoFallback")}
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{t("headerLogoHint")}</p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">{t("publicSection")}</h2>
          <p className="text-sm text-muted-foreground">{t("publicSectionDescription")}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="publicSpecialty">{t("publicSpecialty")}</Label>
            <Input id="publicSpecialty" name="publicSpecialty" value={formData.publicSpecialty} onChange={handleChange} disabled={!formData.canEdit || saving} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultTimezone">{t("defaultTimezone")}</Label>
            <Popover
              open={timeZoneOpen}
              onOpenChange={setTimeZoneOpen}
              modal
            >
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
              <PopoverContent className="w-[--radix-popover-trigger-width] min-w-[320px] p-0" align="start">
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
                                formData.defaultTimezone === timezone ? "opacity-100" : "opacity-0",
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
            <p className="text-xs text-muted-foreground">{t("defaultTimezoneHint")}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="publicSummary">{t("publicSummary")}</Label>
          <Textarea id="publicSummary" name="publicSummary" value={formData.publicSummary} onChange={handleChange} disabled={!formData.canEdit || saving} rows={4} maxLength={300} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="publicDescription">{t("publicDescription")}</Label>
          <Textarea id="publicDescription" name="publicDescription" value={formData.publicDescription} onChange={handleChange} disabled={!formData.canEdit || saving} rows={3} maxLength={1000} />
          <p className="text-xs text-muted-foreground">{t("publicDescriptionHint")}</p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">{t("contactSection")}</h2>
          <p className="text-sm text-muted-foreground">{t("contactSectionDescription")}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="publicEmail">{t("publicEmail")}</Label>
            <Input id="publicEmail" name="publicEmail" type="email" value={formData.publicEmail} onChange={handleChange} disabled={!formData.canEdit || saving} autoComplete="email" autoCapitalize="none" inputMode="email" spellCheck={false} aria-invalid={invalidPublicEmail} className={cn(invalidPublicEmail && "border-red-500 ring-1 ring-red-500/20")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="publicPhone">{t("publicPhone")}</Label>
            <PhoneInput
              id="publicPhone"
              name="publicPhone"
              value={formData.publicPhone}
              onChange={(value) => handleFieldChange("publicPhone", normalizePhoneInput(value || ""))}
              defaultCountry="US"
              international
              disabled={!formData.canEdit || saving}
              autoComplete="tel"
              aria-invalid={invalidPublicPhone}
              className={cn(invalidPublicPhone && "[&_input]:border-red-500 [&_input]:ring-1 [&_input]:ring-red-500/20")}
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

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">{t("socialSection")}</h2>
          <p className="text-sm text-muted-foreground">{t("socialSectionDescription")}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="website">{t("website")}</Label>
            <Input id="website" name="website" type="url" value={formData.website} onChange={handleChange} disabled={!formData.canEdit || saving} autoCapitalize="none" spellCheck={false} inputMode="url" placeholder="https://example.com" aria-invalid={invalidUrls.website} className={cn(invalidUrls.website && "border-red-500 ring-1 ring-red-500/20")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="facebook">{t("facebook")}</Label>
            <Input id="facebook" name="facebook" type="url" value={formData.facebook} onChange={handleChange} disabled={!formData.canEdit || saving} autoCapitalize="none" spellCheck={false} inputMode="url" placeholder="https://facebook.com/..." aria-invalid={invalidUrls.facebook} className={cn(invalidUrls.facebook && "border-red-500 ring-1 ring-red-500/20")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram">{t("instagram")}</Label>
            <Input id="instagram" name="instagram" type="url" value={formData.instagram} onChange={handleChange} disabled={!formData.canEdit || saving} autoCapitalize="none" spellCheck={false} inputMode="url" placeholder="https://instagram.com/..." aria-invalid={invalidUrls.instagram} className={cn(invalidUrls.instagram && "border-red-500 ring-1 ring-red-500/20")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedin">{t("linkedin")}</Label>
            <Input id="linkedin" name="linkedin" type="url" value={formData.linkedin} onChange={handleChange} disabled={!formData.canEdit || saving} autoCapitalize="none" spellCheck={false} inputMode="url" placeholder="https://linkedin.com/..." aria-invalid={invalidUrls.linkedin} className={cn(invalidUrls.linkedin && "border-red-500 ring-1 ring-red-500/20")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="twitter">{t("twitter")}</Label>
            <Input id="twitter" name="twitter" type="url" value={formData.twitter} onChange={handleChange} disabled={!formData.canEdit || saving} autoCapitalize="none" spellCheck={false} inputMode="url" placeholder="https://x.com/..." aria-invalid={invalidUrls.twitter} className={cn(invalidUrls.twitter && "border-red-500 ring-1 ring-red-500/20")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tiktok">{t("tiktok")}</Label>
            <Input id="tiktok" name="tiktok" type="url" value={formData.tiktok} onChange={handleChange} disabled={!formData.canEdit || saving} autoCapitalize="none" spellCheck={false} inputMode="url" placeholder="https://tiktok.com/..." aria-invalid={invalidUrls.tiktok} className={cn(invalidUrls.tiktok && "border-red-500 ring-1 ring-red-500/20")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="youtube">{t("youtube")}</Label>
            <Input id="youtube" name="youtube" type="url" value={formData.youtube} onChange={handleChange} disabled={!formData.canEdit || saving} autoCapitalize="none" spellCheck={false} inputMode="url" placeholder="https://youtube.com/..." aria-invalid={invalidUrls.youtube} className={cn(invalidUrls.youtube && "border-red-500 ring-1 ring-red-500/20")} />
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" disabled={!formData.canEdit || saving}>
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
    </form>
  );
}
