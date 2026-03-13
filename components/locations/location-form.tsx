"use client";

import { ALLOWED_MIME_TYPES, MAX_FILE_SIZES, STORAGE_BUCKETS, STORAGE_PATHS } from "@/lib/config/storage";
import {
  AlertCircle,
  Building2,
  Check,
  ChevronsUpDown,
  ImageIcon,
  Info,
  MapPin,
  RotateCcw,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "@/components/ui/dropzone";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { hasSupabaseStorage } from "@/lib/auth/config";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SaveReminderCallout } from "@/components/ui/save-reminder-callout";
import { SUPPORTED_COMPANY_TIMEZONES } from "@/lib/constants/supported-timezones";
import { Location } from "@/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useSupabaseUpload } from "@/hooks";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { normalizeWhitespace } from "@/lib/validation/form-fields";

interface LocationFormProps {
  location?: Location;
  isNew: boolean;
  onCancel?: () => void;
  onSubmit?: (formData: {
    title: string;
    address: string;
    description: string;
    timezone: string;
    logo: string;
    lat?: number;
    lon?: number;
  }) => Promise<void>;
  onDelete?: () => Promise<void>;
  loading?: boolean;
}

interface LocationFormState {
  title: string;
  address: string;
  description: string;
  timezone: string;
  logo: string;
  lat: string;
  lon: string;
}

function createInitialState(location?: Location): LocationFormState {
  return {
    title: location?.title || "",
    address: location?.address || "",
    description: location?.description || "",
    timezone: location?.timezone || "",
    logo: location?.logo || "",
    lat: location?.lat !== undefined && location?.lat !== null ? String(location.lat) : "",
    lon: location?.lon !== undefined && location?.lon !== null ? String(location.lon) : "",
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

export function LocationForm({
  location,
  isNew,
  onCancel,
  onSubmit,
  onDelete,
  loading = false,
}: LocationFormProps) {
  const t = useTranslations("Locations");
  const [formData, setFormData] = useState<LocationFormState>(createInitialState(location));
  const [timeZoneOpen, setTimeZoneOpen] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const initialState = useMemo(() => createInitialState(location), [location]);

  useEffect(() => {
    setFormData(initialState);
    setHasAttemptedSubmit(false);
  }, [initialState]);

  const logoUpload = useSupabaseUpload({
    bucketName: STORAGE_BUCKETS.LOCATIONS,
    path: STORAGE_PATHS.LOCATION_LOGOS,
    allowedMimeTypes: ALLOWED_MIME_TYPES.IMAGES,
    maxFiles: 1,
    maxFileSize: MAX_FILE_SIZES.MEDIUM,
  });

  useEffect(() => {
    if (logoUpload.successes.length > 0 && logoUpload.successes[0] !== formData.logo) {
      setFormData((prev) => ({ ...prev, logo: logoUpload.successes[0] }));
    }
  }, [formData.logo, logoUpload.successes]);

  const handleInputChange = (field: keyof LocationFormState, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]:
        field === "title" || field === "address"
          ? normalizeWhitespace(value)
          : value,
    }));
  };

  const handleReset = () => {
    logoUpload.setFiles([]);
    setFormData(initialState);
    onCancel?.();
  };

  const handleLogoRemove = () => {
    logoUpload.setFiles([]);
    setFormData((prev) => ({ ...prev, logo: "" }));
  };

  const parsedLat = Number(formData.lat);
  const parsedLon = Number(formData.lon);
  const timezoneMissing = !formData.timezone.trim();
  const timezoneRequired = isNew && timezoneMissing;
  const coordinatesTouched = formData.lat.trim() !== "" || formData.lon.trim() !== "";
  const coordinatesIncomplete = coordinatesTouched && (!formData.lat.trim() || !formData.lon.trim());
  const coordinatesInvalid =
    coordinatesTouched &&
    !coordinatesIncomplete &&
    (Number.isNaN(parsedLat) || Number.isNaN(parsedLon));
  const disableSubmit =
    loading ||
    !formData.title.trim() ||
    !formData.address.trim() ||
    timezoneRequired ||
    coordinatesIncomplete ||
    coordinatesInvalid;
  const fieldErrors = {
    title: hasAttemptedSubmit && !formData.title.trim(),
    address: hasAttemptedSubmit && !formData.address.trim(),
    timezone: hasAttemptedSubmit && timezoneRequired,
    lat: hasAttemptedSubmit && (coordinatesIncomplete || coordinatesInvalid),
    lon: hasAttemptedSubmit && (coordinatesIncomplete || coordinatesInvalid),
  };
  const hasPendingLogoChange = formData.logo !== initialState.logo;

  const handleSubmit = async () => {
    setHasAttemptedSubmit(true);
    if (!onSubmit || disableSubmit) return;

    await onSubmit({
      title: formData.title.trim(),
      address: formData.address.trim(),
      description: formData.description.trim(),
      timezone: formData.timezone.trim(),
      logo: formData.logo,
      ...(coordinatesTouched && !coordinatesIncomplete && !coordinatesInvalid
        ? { lat: parsedLat, lon: parsedLon }
        : {}),
    });
  };

  const timeZoneOptions = useMemo(() => [...SUPPORTED_COMPANY_TIMEZONES], []);

  return (
    <TooltipProvider delayDuration={150}>
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle>
                {isNew ? t("createTitle") : formData.title || t("locationDetails")}
              </CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              {isNew ? t("createDescription") : t("reviewDescription")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {formData.timezone ? (
              <Badge variant="outline">{formData.timezone}</Badge>
            ) : (
              <Badge variant="outline">{t("timezonePending")}</Badge>
            )}
            {formData.logo ? (
              <Badge variant="outline">{t("logoReady")}</Badge>
            ) : (
              <Badge variant="outline">{t("logoMissing")}</Badge>
            )}
            {!isNew && onDelete ? (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={onDelete}
                disabled={loading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("deleteLocation")}
              </Button>
            ) : null}
          </div>
        </div>

        {(timezoneRequired || timezoneMissing || coordinatesIncomplete || coordinatesInvalid) && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              {timezoneRequired
                ? t("timezoneRequired")
                : timezoneMissing
                ? t("timezoneAutodetectNotice")
                : coordinatesIncomplete
                  ? t("coordinatesOptionalIncomplete")
                  : t("coordinatesInvalid")}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <section className="space-y-4 rounded-lg border bg-muted/10 p-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">{t("basicInformation")}</h3>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label>{t("clinicName")}</Label>
                    <InfoHint label={t("clinicName")} content={t("help.officeName")} />
                  </div>
                  <Input
                    value={formData.title}
                    onChange={(event) => handleInputChange("title", event.target.value)}
                    placeholder={t("clinicNamePlaceholder")}
                    aria-invalid={fieldErrors.title}
                    className={cn(fieldErrors.title && "border-red-500 ring-1 ring-red-500/20")}
                    autoComplete="organization"
                    maxLength={120}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label>{t("address")}</Label>
                    <InfoHint label={t("address")} content={t("help.address")} />
                  </div>
                  <Input
                    value={formData.address}
                    onChange={(event) => handleInputChange("address", event.target.value)}
                    placeholder={t("addressPlaceholder")}
                    aria-invalid={fieldErrors.address}
                    className={cn(fieldErrors.address && "border-red-500 ring-1 ring-red-500/20")}
                    autoComplete="street-address"
                    maxLength={160}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>{t("descriptionLabel")}</Label>
                  <InfoHint label={t("descriptionLabel")} content={t("help.description")} />
                </div>
                <Textarea
                  value={formData.description}
                    onChange={(event) => handleInputChange("description", event.target.value)}
                  placeholder={t("descriptionPlaceholder")}
                  className="min-h-24 resize-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>
                    {t("timeZoneField")}
                    {isNew ? <span className="text-destructive"> *</span> : null}
                  </Label>
                  <InfoHint label={t("timeZoneField")} content={t("help.timeZone")} />
                </div>
                <Popover
                  open={timeZoneOpen}
                  onOpenChange={(open) => setTimeZoneOpen(open)}
                >
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      aria-expanded={timeZoneOpen}
                      aria-invalid={fieldErrors.timezone}
                      className={cn(
                        "w-full justify-between font-normal",
                        fieldErrors.timezone && "border-red-500 ring-1 ring-red-500/20",
                      )}
                    >
                      <span className="truncate text-left">
                        {formData.timezone || t("timeZonePlaceholderShort")}
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
                            {timeZoneOptions.map((timezone) => (
                              <CommandItem
                                key={timezone}
                                value={timezone}
                                onSelect={() => {
                                  handleInputChange("timezone", timezone);
                                  setTimeZoneOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.timezone === timezone ? "opacity-100" : "opacity-0",
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
                <p className="text-xs text-muted-foreground">{t("timeZoneHelp")}</p>
                {fieldErrors.timezone ? (
                  <p className="text-xs text-red-600">{t("timezoneRequired")}</p>
                ) : null}
              </div>
            </section>

            <section className="space-y-4 rounded-lg border bg-muted/10 p-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">{t("coordinatesOptional")}</h3>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label>{t("latitude")}</Label>
                    <InfoHint label={t("latitude")} content={t("help.latitude")} />
                  </div>
                  <Input
                    type="number"
                    step="any"
                    inputMode="decimal"
                    value={formData.lat}
                    onChange={(event) => handleInputChange("lat", event.target.value)}
                    placeholder={t("latitudePlaceholder")}
                    aria-invalid={fieldErrors.lat}
                    className={cn(fieldErrors.lat && "border-red-500 ring-1 ring-red-500/20")}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label>{t("longitude")}</Label>
                    <InfoHint label={t("longitude")} content={t("help.longitude")} />
                  </div>
                  <Input
                    type="number"
                    step="any"
                    inputMode="decimal"
                    value={formData.lon}
                    onChange={(event) => handleInputChange("lon", event.target.value)}
                    placeholder={t("longitudePlaceholder")}
                    aria-invalid={fieldErrors.lon}
                    className={cn(fieldErrors.lon && "border-red-500 ring-1 ring-red-500/20")}
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                {t("coordinatesOptionalHelp")}
              </p>
            </section>
          </div>

          <section className="space-y-4 rounded-lg border bg-muted/10 p-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">{t("logo")}</h3>
            </div>

            {formData.logo ? (
              <div className="space-y-3">
                <div className="overflow-hidden rounded-xl border bg-background">
                  <div className="flex aspect-square items-center justify-center bg-muted/40">
                    <Image
                      src={formData.logo}
                      alt={formData.title || t("clinic")}
                      width={280}
                      height={280}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{t("currentLogo")}</p>
                    <p className="text-xs text-muted-foreground">{t("logoUploaded")}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLogoRemove}>
                    <X className="mr-2 h-4 w-4" />
                    {t("remove")}
                  </Button>
                </div>
              </div>
            ) : hasSupabaseStorage ? (
              <div className="space-y-2">
                <Dropzone {...logoUpload}>
                  <DropzoneEmptyState />
                  <DropzoneContent />
                </Dropzone>
                <p className="text-xs text-muted-foreground">{t("imageGuidelines")}</p>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                {t("storageUploadUnavailable")}
              </div>
            )}

            {!formData.logo ? (
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <Upload className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>{t("logoHelp")}</div>
                </div>
              </div>
            ) : null}

            {hasPendingLogoChange ? (
              <SaveReminderCallout>{t("logoPendingSave")}</SaveReminderCallout>
            ) : null}
          </section>
        </div>

        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={handleReset} disabled={loading}>
            <RotateCcw className="mr-2 h-4 w-4" />
            {t("reset")}
          </Button>
          {onSubmit ? (
            <Button onClick={handleSubmit} disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? t("saving") : isNew ? t("create") : t("update")}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
    </TooltipProvider>
  );
}
