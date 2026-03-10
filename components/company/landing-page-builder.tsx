"use client"

import {
  CalendarDays,
  ChevronRight,
  LayoutTemplate,
  MapPin,
  Maximize2,
  NotebookPen,
  Sparkles,
  Waves,
  Waypoints,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { type ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SurfaceCard } from "@/components/ui/surface-card"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { featureFlags } from "@/lib/config/features"
import {
  getLocalizedLandingText,
  resolveLandingPageConfigForLocale,
  setLocalizedLandingText,
  type LandingPageConfig,
  type LandingPageLocale,
} from "@/lib/company/landing-page-config"
import { cn } from "@/lib/utils"

interface LandingPageBuilderProps {
  value: LandingPageConfig
  onChange: (nextValue: LandingPageConfig) => void
  disabled?: boolean
  locale: LandingPageLocale
  previewData: {
    companyName: string
    publicSpecialty: string
    publicSummary: string
    logo?: string | null
  }
}

function SectionShell({
  title,
  description,
  visible,
  onVisibleChange,
  disabled,
  children,
}: {
  title: string
  description: string
  visible: boolean
  onVisibleChange: (checked: boolean) => void
  disabled: boolean
  children: ReactNode
}) {
  const t = useTranslations("CompanyProfile")

  return (
    <div className="space-y-5 rounded-[24px] border border-border/60 bg-background/70 p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <LayoutTemplate className="size-4 text-primary" />
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {visible ? t("landingSectionVisible") : t("landingSectionHidden")}
          </span>
          <Switch
            checked={visible}
            onCheckedChange={onVisibleChange}
            disabled={disabled}
            aria-label={title}
          />
        </div>
      </div>
      {visible ? (
        children
      ) : (
        <p className="rounded-2xl border border-dashed border-border/70 px-4 py-3 text-sm text-muted-foreground">
          {t("landingSectionHiddenHint")}
        </p>
      )}
    </div>
  )
}

function SimpleSectionFields({
  titleValue,
  descriptionValue,
  onTitleChange,
  onDescriptionChange,
  disabled,
  titleLabel,
  descriptionLabel,
  titlePlaceholder,
  descriptionPlaceholder,
}: {
  titleValue: string
  descriptionValue: string
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  disabled: boolean
  titleLabel: string
  descriptionLabel: string
  titlePlaceholder: string
  descriptionPlaceholder: string
}) {
  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <Label>{titleLabel}</Label>
        <Input
          value={titleValue}
          onChange={(event) => onTitleChange(event.target.value)}
          disabled={disabled}
          placeholder={titlePlaceholder}
          maxLength={140}
        />
      </div>
      <div className="space-y-2">
        <Label>{descriptionLabel}</Label>
        <Textarea
          value={descriptionValue}
          onChange={(event) => onDescriptionChange(event.target.value)}
          disabled={disabled}
          placeholder={descriptionPlaceholder}
          rows={3}
          maxLength={500}
        />
      </div>
    </div>
  )
}

function LandingPreviewCanvas({
  browserLabel,
  bodyClassName,
  children,
}: {
  browserLabel: string
  bodyClassName?: string
  children: ReactNode
}) {
  return (
    <div className="rounded-[28px] border border-border/60 bg-[linear-gradient(180deg,oklch(var(--background))_0%,oklch(var(--accent)/0.06)_100%)] p-3 shadow-[0_28px_80px_-48px_rgba(15,23,42,0.35)]">
      <div className="overflow-hidden rounded-[24px] border border-border/70 bg-background/95">
        <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3 text-xs font-medium text-muted-foreground">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-rose-400" />
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="ml-2">{browserLabel}</span>
        </div>

        <div
          className={cn(
            "space-y-6 overflow-y-auto p-4",
            bodyClassName ?? "max-h-[78vh]",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export function LandingPageBuilder({
  value,
  onChange,
  disabled = false,
  locale,
  previewData,
}: LandingPageBuilderProps) {
  const t = useTranslations("CompanyProfile")
  const heroT = useTranslations("Hero")
  const homeT = useTranslations("HomeLanding")
  const blogT = useTranslations("Blog")
  const specialtiesT = useTranslations("Specialties")
  const previewConfig = resolveLandingPageConfigForLocale(value, locale)
  const isBlogFeatureEnabled = featureFlags.features.blog
  const isSpecialtiesFeatureEnabled = featureFlags.features.services
  const supportCardTitlePlaceholders = [
    homeT("pillars.oneTitle"),
    homeT("pillars.twoTitle"),
    homeT("pillars.threeTitle"),
  ]
  const supportCardDescriptionPlaceholders = [
    homeT("pillars.oneDescription"),
    homeT("pillars.twoDescription"),
    homeT("pillars.threeDescription"),
  ]
  const journeyStepTitlePlaceholders = [
    homeT("steps.oneTitle"),
    homeT("steps.twoTitle"),
    homeT("steps.threeTitle"),
  ]
  const journeyStepDescriptionPlaceholders = [
    homeT("steps.oneDescription"),
    homeT("steps.twoDescription"),
    homeT("steps.threeDescription"),
  ]
  const previewCompanyName = previewData.companyName.trim() || heroT("title")
  const previewLogo = previewData.logo?.trim() || null
  const previewSpecialty =
    previewData.publicSpecialty.trim() || heroT("subtitle")
  const previewSummary =
    previewData.publicSummary.trim() || heroT("description")
  const previewHeroBadge = previewConfig.hero.badge.trim() || heroT("badge")
  const previewHeroHelper = previewConfig.hero.helper.trim() || heroT("helper")
  const previewHeroShowcaseSummary =
    previewConfig.hero.showcaseSummary.trim() || heroT("showcaseSummary")
  const previewSupportEyebrow =
    previewConfig.support.eyebrow.trim() || homeT("careEyebrow")
  const previewSupportTitle =
    previewConfig.support.title.trim() || homeT("careTitle")
  const previewSupportDescription =
    previewConfig.support.description.trim() || homeT("careDescription")
  const previewSupportCards = previewConfig.support.cards.map((card, index) => ({
    title: card.title.trim() || supportCardTitlePlaceholders[index],
    description:
      card.description.trim() || supportCardDescriptionPlaceholders[index],
  }))
  const previewJourneyEyebrow =
    previewConfig.journey.eyebrow.trim() || homeT("journeyEyebrow")
  const previewJourneyTitle =
    previewConfig.journey.title.trim() || homeT("journeyTitle")
  const previewJourneyDescription =
    previewConfig.journey.description.trim() || homeT("journeyDescription")
  const previewJourneySteps = previewConfig.journey.steps.map((step, index) => ({
    title: step.title.trim() || journeyStepTitlePlaceholders[index],
    description:
      step.description.trim() || journeyStepDescriptionPlaceholders[index],
  }))
  const previewLocationsEyebrow =
    previewConfig.locations.eyebrow.trim() || homeT("locationsEyebrow")
  const previewLocationsTitle =
    previewConfig.locations.title.trim() || homeT("locationsTitle")
  const previewLocationsDescription =
    previewConfig.locations.description.trim() || homeT("locationsDescription")
  const previewLocationsEmptyMessage =
    previewConfig.locations.emptyMessage.trim() || homeT("locationsEmpty")
  const previewBlogTitle = previewConfig.blog.title.trim() || blogT("title")
  const previewBlogDescription =
    previewConfig.blog.description.trim() || blogT("subtitle")
  const previewSpecialtiesTitle =
    previewConfig.specialties.title.trim() || specialtiesT("title")
  const previewSpecialtiesDescription =
    previewConfig.specialties.description.trim() || specialtiesT("description")
  const showBlogPreview = isBlogFeatureEnabled && previewConfig.blog.visible
  const showSpecialtiesPreview =
    isSpecialtiesFeatureEnabled && previewConfig.specialties.visible
  const hasVisiblePreviewSections =
    previewConfig.hero.visible ||
    previewConfig.support.visible ||
    previewConfig.journey.visible ||
    previewConfig.locations.visible ||
    showBlogPreview ||
    showSpecialtiesPreview
  const localeLabel =
    locale === "es-MX" ? t("landingLocaleSpanish") : t("landingLocaleEnglish")

  const updateHeroVisible = (nextValue: boolean) => {
    onChange({
      ...value,
      hero: {
        ...value.hero,
        visible: nextValue,
      },
    })
  }

  const updateHeroText = (
    field: "badge" | "helper" | "showcaseSummary",
    nextValue: string,
  ) => {
    onChange({
      ...value,
      hero: {
        ...value.hero,
        [field]: setLocalizedLandingText(value.hero[field], locale, nextValue),
      },
    })
  }

  const updateSupportVisible = (nextValue: boolean) => {
    onChange({
      ...value,
      support: {
        ...value.support,
        visible: nextValue,
      },
    })
  }

  const updateSupportText = (
    field: "eyebrow" | "title" | "description",
    nextValue: string,
  ) => {
    onChange({
      ...value,
      support: {
        ...value.support,
        [field]: setLocalizedLandingText(
          value.support[field],
          locale,
          nextValue,
        ),
      },
    })
  }

  const updateSupportCard = (
    index: number,
    field: "title" | "description",
    nextValue: string,
  ) => {
    const cards = value.support.cards.map((card, cardIndex) =>
      cardIndex === index
        ? {
            ...card,
            [field]: setLocalizedLandingText(card[field], locale, nextValue),
          }
        : card,
    )

    onChange({
      ...value,
      support: {
        ...value.support,
        cards,
      },
    })
  }

  const updateJourneyVisible = (nextValue: boolean) => {
    onChange({
      ...value,
      journey: {
        ...value.journey,
        visible: nextValue,
      },
    })
  }

  const updateJourneyText = (
    field: "eyebrow" | "title" | "description",
    nextValue: string,
  ) => {
    onChange({
      ...value,
      journey: {
        ...value.journey,
        [field]: setLocalizedLandingText(
          value.journey[field],
          locale,
          nextValue,
        ),
      },
    })
  }

  const updateJourneyStep = (
    index: number,
    field: "title" | "description",
    nextValue: string,
  ) => {
    const steps = value.journey.steps.map((step, stepIndex) =>
      stepIndex === index
        ? {
            ...step,
            [field]: setLocalizedLandingText(step[field], locale, nextValue),
          }
        : step,
    )

    onChange({
      ...value,
      journey: {
        ...value.journey,
        steps,
      },
    })
  }

  const updateLocationsVisible = (nextValue: boolean) => {
    onChange({
      ...value,
      locations: {
        ...value.locations,
        visible: nextValue,
      },
    })
  }

  const updateLocationsText = (
    field: "eyebrow" | "title" | "description" | "emptyMessage",
    nextValue: string,
  ) => {
    onChange({
      ...value,
      locations: {
        ...value.locations,
        [field]: setLocalizedLandingText(
          value.locations[field],
          locale,
          nextValue,
        ),
      },
    })
  }

  const updateSimpleSectionVisible = (
    sectionKey: "blog" | "specialties",
    nextValue: boolean,
  ) => {
    onChange({
      ...value,
      [sectionKey]: {
        ...value[sectionKey],
        visible: nextValue,
      },
    })
  }

  const updateSimpleSectionText = (
    sectionKey: "blog" | "specialties",
    field: "title" | "description",
    nextValue: string,
  ) => {
    onChange({
      ...value,
      [sectionKey]: {
        ...value[sectionKey],
        [field]: setLocalizedLandingText(
          value[sectionKey][field],
          locale,
          nextValue,
        ),
      },
    })
  }

  const renderPreviewSections = () => (
    <>
      {previewConfig.hero.visible ? (
        <section className="surface-brand-tint space-y-4 rounded-[24px] p-5">
          <span className="inline-flex rounded-full border border-primary/16 bg-primary/8 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-primary">
            {previewHeroBadge}
          </span>
          {previewLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewLogo}
              alt={previewCompanyName}
              className="h-12 w-auto max-w-[220px] rounded-2xl border border-border/60 bg-background/90 object-contain p-2"
            />
          ) : null}
          <div className="space-y-3">
            <h4 className="text-2xl font-semibold tracking-tight text-foreground">
              {previewCompanyName}
            </h4>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary/80">
              {previewSpecialty}
            </p>
            <p className="text-sm leading-7 text-muted-foreground">
              {previewSummary}
            </p>
          </div>
          <div className="rounded-[20px] border border-border/60 bg-background/86 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <MapPin className="size-4 text-primary" />
              {heroT("locationPlaceholder")}
            </div>
            <div className="mt-3 flex items-center justify-between rounded-[18px] border border-border/60 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
              <span>{previewHeroHelper}</span>
              <CalendarDays className="size-4 text-primary" />
            </div>
          </div>
          <div className="brand-showcase-panel rounded-[20px] p-4 text-white">
            <p className="text-sm leading-7 text-white/78">
              {previewHeroShowcaseSummary}
            </p>
          </div>
        </section>
      ) : null}

      {previewConfig.support.visible ? (
        <section className="space-y-4 rounded-[24px] border border-border/70 bg-background/90 p-5">
          <div className="space-y-2">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-primary/72">
              {previewSupportEyebrow}
            </p>
            <h4 className="text-xl font-semibold text-foreground">
              {previewSupportTitle}
            </h4>
            <p className="text-sm leading-7 text-muted-foreground">
              {previewSupportDescription}
            </p>
          </div>
          <div className="grid gap-3">
            {previewSupportCards.map((card, index) => {
              const Icon = index === 0 ? Sparkles : index === 1 ? Waves : Waypoints

              return (
                <div
                  key={`preview-support-${index + 1}`}
                  className="rounded-[20px] border border-border/60 bg-background/85 p-4"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </span>
                  <h5 className="mt-4 text-sm font-semibold text-foreground">
                    {card.title}
                  </h5>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {card.description}
                  </p>
                </div>
              )
            })}
          </div>
        </section>
      ) : null}

      {previewConfig.journey.visible || previewConfig.locations.visible ? (
        <section className="grid gap-4">
          {previewConfig.journey.visible ? (
            <div className="surface-brand-tint rounded-[24px] p-5">
              <div className="space-y-2">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-primary/72">
                  {previewJourneyEyebrow}
                </p>
                <h4 className="text-xl font-semibold text-foreground">
                  {previewJourneyTitle}
                </h4>
                <p className="text-sm leading-7 text-muted-foreground">
                  {previewJourneyDescription}
                </p>
              </div>
              <div className="mt-4 space-y-3">
                {previewJourneySteps.map((step, index) => (
                  <div
                    key={`preview-step-${index + 1}`}
                    className="rounded-[20px] border border-border/60 bg-background/86 p-4"
                  >
                    <div className="flex gap-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                        {index + 1}
                      </span>
                      <div className="space-y-1">
                        <h5 className="text-sm font-semibold text-foreground">
                          {step.title}
                        </h5>
                        <p className="text-sm leading-6 text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {previewConfig.locations.visible ? (
            <div className="rounded-[24px] border border-border/70 bg-background/90 p-5">
              <div className="space-y-2">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-primary/72">
                  {previewLocationsEyebrow}
                </p>
                <h4 className="text-xl font-semibold text-foreground">
                  {previewLocationsTitle}
                </h4>
                <p className="text-sm leading-7 text-muted-foreground">
                  {previewLocationsDescription}
                </p>
              </div>
              <div className="mt-4 space-y-3">
                {[1, 2].map((item) => (
                  <div
                    key={`preview-location-${item}`}
                    className="flex items-center justify-between rounded-[20px] border border-border/60 bg-background/85 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <MapPin className="size-4" />
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {t("landingPreviewLocationLabel", { index: item })}
                      </span>
                    </div>
                    <ChevronRight className="size-4 text-primary/70" />
                  </div>
                ))}
                <div className="rounded-[20px] border border-dashed border-border/70 bg-background/75 px-4 py-3 text-sm text-muted-foreground">
                  {previewLocationsEmptyMessage}
                </div>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {showBlogPreview ? (
        <section className="rounded-[24px] border border-border/70 bg-background/90 p-5">
          <div className="space-y-2">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-primary/72">
              {t("landingPreviewBlogLabel")}
            </p>
            <h4 className="text-xl font-semibold text-foreground">
              {previewBlogTitle}
            </h4>
            <p className="text-sm leading-7 text-muted-foreground">
              {previewBlogDescription}
            </p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[1, 2].map((item) => (
              <div
                key={`preview-blog-${item}`}
                className="rounded-[20px] border border-border/60 bg-background/85 p-4"
              >
                <div className="h-24 rounded-2xl bg-muted/40" />
                <p className="mt-3 text-sm font-semibold text-foreground">
                  {t("landingPreviewBlogPost", { index: item })}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {blogT("readMore")}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {showSpecialtiesPreview ? (
        <section className="rounded-[24px] border border-border/70 bg-background/90 p-5">
          <div className="space-y-2">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-primary/72">
              {t("landingPreviewSpecialtiesLabel")}
            </p>
            <h4 className="text-xl font-semibold text-foreground">
              {previewSpecialtiesTitle}
            </h4>
            <p className="text-sm leading-7 text-muted-foreground">
              {previewSpecialtiesDescription}
            </p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              specialtiesT("urology"),
              specialtiesT("neurology"),
              specialtiesT("dentist"),
              specialtiesT("orthopedic"),
            ].map((label) => (
              <div
                key={label}
                className="rounded-[20px] border border-border/60 bg-background/85 p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <NotebookPen className="size-4" />
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {!hasVisiblePreviewSections ? (
        <div className="rounded-[24px] border border-dashed border-border/70 bg-background/75 px-5 py-6 text-sm leading-7 text-muted-foreground">
          {t("landingPreviewEmpty")}
        </div>
      ) : null}
    </>
  )

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] xl:items-start">
      <div className="space-y-6">
        <div className="rounded-[24px] border border-border/60 bg-background/60 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">{t("landingSection")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("landingSectionDescription")}
              </p>
            </div>
            <span className="inline-flex rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
              {t("landingLocaleBadge", { locale: localeLabel })}
            </span>
          </div>
          <p className="mt-4 text-xs leading-6 text-muted-foreground">
            {t("landingLocaleHint")}
          </p>
        </div>

        <SectionShell
          title={t("landingHeroTitle")}
          description={t("landingHeroDescription")}
          visible={value.hero.visible}
          onVisibleChange={updateHeroVisible}
          disabled={disabled}
        >
          <div className="rounded-2xl border border-border/60 bg-background/75 px-4 py-3 text-sm text-muted-foreground">
            {t("landingHeroPublicFieldsHint")}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("landingHeroBadge")}</Label>
              <Input
                value={getLocalizedLandingText(value.hero.badge, locale)}
                onChange={(event) => updateHeroText("badge", event.target.value)}
                disabled={disabled}
                placeholder={heroT("badge")}
                maxLength={90}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>{t("landingHeroHelper")}</Label>
              <Textarea
                value={getLocalizedLandingText(value.hero.helper, locale)}
                onChange={(event) => updateHeroText("helper", event.target.value)}
                disabled={disabled}
                placeholder={heroT("helper")}
                rows={3}
                maxLength={300}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>{t("landingHeroShowcaseSummary")}</Label>
              <Textarea
                value={getLocalizedLandingText(
                  value.hero.showcaseSummary,
                  locale,
                )}
                onChange={(event) =>
                  updateHeroText("showcaseSummary", event.target.value)
                }
                disabled={disabled}
                placeholder={heroT("showcaseSummary")}
                rows={3}
                maxLength={320}
              />
            </div>
          </div>
        </SectionShell>

        <SectionShell
          title={t("landingSupportTitle")}
          description={t("landingSupportDescription")}
          visible={value.support.visible}
          onVisibleChange={updateSupportVisible}
          disabled={disabled}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("landingSupportEyebrow")}</Label>
              <Input
                value={getLocalizedLandingText(value.support.eyebrow, locale)}
                onChange={(event) =>
                  updateSupportText("eyebrow", event.target.value)
                }
                disabled={disabled}
                placeholder={homeT("careEyebrow")}
                maxLength={90}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("landingSupportHeading")}</Label>
              <Input
                value={getLocalizedLandingText(value.support.title, locale)}
                onChange={(event) => updateSupportText("title", event.target.value)}
                disabled={disabled}
                placeholder={homeT("careTitle")}
                maxLength={160}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>{t("landingSupportBody")}</Label>
              <Textarea
                value={getLocalizedLandingText(value.support.description, locale)}
                onChange={(event) =>
                  updateSupportText("description", event.target.value)
                }
                disabled={disabled}
                placeholder={homeT("careDescription")}
                rows={4}
                maxLength={500}
              />
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {value.support.cards.map((card, index) => (
              <div
                key={`support-card-${index + 1}`}
                className="space-y-3 rounded-2xl border border-border/60 bg-background/75 p-4"
              >
                <p className="text-sm font-semibold text-foreground">
                  {t("landingSupportCard", { index: index + 1 })}
                </p>
                <div className="space-y-2">
                  <Label>{t("landingCardTitle")}</Label>
                  <Input
                    value={getLocalizedLandingText(card.title, locale)}
                    onChange={(event) =>
                      updateSupportCard(index, "title", event.target.value)
                    }
                    disabled={disabled}
                    placeholder={supportCardTitlePlaceholders[index]}
                    maxLength={120}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("landingCardDescription")}</Label>
                  <Textarea
                    value={getLocalizedLandingText(card.description, locale)}
                    onChange={(event) =>
                      updateSupportCard(index, "description", event.target.value)
                    }
                    disabled={disabled}
                    placeholder={supportCardDescriptionPlaceholders[index]}
                    rows={4}
                    maxLength={320}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionShell>

        <SectionShell
          title={t("landingJourneyTitle")}
          description={t("landingJourneyDescription")}
          visible={value.journey.visible}
          onVisibleChange={updateJourneyVisible}
          disabled={disabled}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("landingJourneyEyebrow")}</Label>
              <Input
                value={getLocalizedLandingText(value.journey.eyebrow, locale)}
                onChange={(event) =>
                  updateJourneyText("eyebrow", event.target.value)
                }
                disabled={disabled}
                placeholder={homeT("journeyEyebrow")}
                maxLength={90}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("landingJourneyHeading")}</Label>
              <Input
                value={getLocalizedLandingText(value.journey.title, locale)}
                onChange={(event) => updateJourneyText("title", event.target.value)}
                disabled={disabled}
                placeholder={homeT("journeyTitle")}
                maxLength={160}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>{t("landingJourneyBody")}</Label>
              <Textarea
                value={getLocalizedLandingText(value.journey.description, locale)}
                onChange={(event) =>
                  updateJourneyText("description", event.target.value)
                }
                disabled={disabled}
                placeholder={homeT("journeyDescription")}
                rows={4}
                maxLength={500}
              />
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {value.journey.steps.map((step, index) => (
              <div
                key={`journey-step-${index + 1}`}
                className="space-y-3 rounded-2xl border border-border/60 bg-background/75 p-4"
              >
                <p className="text-sm font-semibold text-foreground">
                  {t("landingJourneyStep", { index: index + 1 })}
                </p>
                <div className="space-y-2">
                  <Label>{t("landingCardTitle")}</Label>
                  <Input
                    value={getLocalizedLandingText(step.title, locale)}
                    onChange={(event) =>
                      updateJourneyStep(index, "title", event.target.value)
                    }
                    disabled={disabled}
                    placeholder={journeyStepTitlePlaceholders[index]}
                    maxLength={120}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("landingCardDescription")}</Label>
                  <Textarea
                    value={getLocalizedLandingText(step.description, locale)}
                    onChange={(event) =>
                      updateJourneyStep(index, "description", event.target.value)
                    }
                    disabled={disabled}
                    placeholder={journeyStepDescriptionPlaceholders[index]}
                    rows={4}
                    maxLength={320}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionShell>

        <SectionShell
          title={t("landingLocationsTitle")}
          description={t("landingLocationsDescription")}
          visible={value.locations.visible}
          onVisibleChange={updateLocationsVisible}
          disabled={disabled}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("landingLocationsEyebrow")}</Label>
              <Input
                value={getLocalizedLandingText(value.locations.eyebrow, locale)}
                onChange={(event) =>
                  updateLocationsText("eyebrow", event.target.value)
                }
                disabled={disabled}
                placeholder={homeT("locationsEyebrow")}
                maxLength={90}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("landingLocationsHeading")}</Label>
              <Input
                value={getLocalizedLandingText(value.locations.title, locale)}
                onChange={(event) =>
                  updateLocationsText("title", event.target.value)
                }
                disabled={disabled}
                placeholder={homeT("locationsTitle")}
                maxLength={160}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>{t("landingLocationsBody")}</Label>
              <Textarea
                value={getLocalizedLandingText(
                  value.locations.description,
                  locale,
                )}
                onChange={(event) =>
                  updateLocationsText("description", event.target.value)
                }
                disabled={disabled}
                placeholder={homeT("locationsDescription")}
                rows={4}
                maxLength={500}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>{t("landingLocationsEmptyState")}</Label>
              <Textarea
                value={getLocalizedLandingText(
                  value.locations.emptyMessage,
                  locale,
                )}
                onChange={(event) =>
                  updateLocationsText("emptyMessage", event.target.value)
                }
                disabled={disabled}
                placeholder={homeT("locationsEmpty")}
                rows={3}
                maxLength={260}
              />
            </div>
          </div>
        </SectionShell>

        {isBlogFeatureEnabled ? (
          <SectionShell
            title={t("landingBlogTitle")}
            description={t("landingBlogDescription")}
            visible={value.blog.visible}
            onVisibleChange={(checked) =>
              updateSimpleSectionVisible("blog", checked)
            }
            disabled={disabled}
          >
            <SimpleSectionFields
              titleValue={getLocalizedLandingText(value.blog.title, locale)}
              descriptionValue={getLocalizedLandingText(
                value.blog.description,
                locale,
              )}
              onTitleChange={(nextValue) =>
                updateSimpleSectionText("blog", "title", nextValue)
              }
              onDescriptionChange={(nextValue) =>
                updateSimpleSectionText("blog", "description", nextValue)
              }
              disabled={disabled}
              titleLabel={t("landingSectionHeading")}
              descriptionLabel={t("landingSectionBody")}
              titlePlaceholder={blogT("title")}
              descriptionPlaceholder={blogT("subtitle")}
            />
          </SectionShell>
        ) : null}

        {isSpecialtiesFeatureEnabled ? (
          <SectionShell
            title={t("landingSpecialtiesTitle")}
            description={t("landingSpecialtiesDescription")}
            visible={value.specialties.visible}
            onVisibleChange={(checked) =>
              updateSimpleSectionVisible("specialties", checked)
            }
            disabled={disabled}
          >
            <SimpleSectionFields
              titleValue={getLocalizedLandingText(
                value.specialties.title,
                locale,
              )}
              descriptionValue={getLocalizedLandingText(
                value.specialties.description,
                locale,
              )}
              onTitleChange={(nextValue) =>
                updateSimpleSectionText("specialties", "title", nextValue)
              }
              onDescriptionChange={(nextValue) =>
                updateSimpleSectionText("specialties", "description", nextValue)
              }
              disabled={disabled}
              titleLabel={t("landingSectionHeading")}
              descriptionLabel={t("landingSectionBody")}
              titlePlaceholder={specialtiesT("title")}
              descriptionPlaceholder={specialtiesT("description")}
            />
          </SectionShell>
        ) : null}
      </div>

      <Dialog>
        <div className="space-y-4 xl:sticky xl:top-[calc(var(--visible-header-offset,0px)+1rem)] xl:self-start xl:h-fit">
          <SurfaceCard variant="glass" className="gap-3 p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <h3 className="text-base font-semibold">
                  {t("landingPreviewTitle")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("landingPreviewDescription")}
                </p>
              </div>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <Maximize2 className="size-4" />
                  {t("landingPreviewOpen")}
                </Button>
              </DialogTrigger>
            </div>
            <p className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3 text-xs leading-6 text-muted-foreground">
              {t("landingPreviewFallbackHint")}
            </p>
          </SurfaceCard>

          <LandingPreviewCanvas browserLabel={t("landingPreviewBrowserLabel")}>
            {renderPreviewSections()}
          </LandingPreviewCanvas>
        </div>

        <DialogContent className="max-h-[92vh] overflow-hidden p-0 sm:max-w-5xl xl:max-w-6xl">
          <DialogHeader className="gap-1 border-b border-border/60 px-6 py-5 pr-14">
            <DialogTitle>{t("landingPreviewTitle")}</DialogTitle>
            <DialogDescription>
              {t("landingPreviewDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 p-4 sm:p-6">
            <p className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3 text-xs leading-6 text-muted-foreground">
              {t("landingPreviewFallbackHint")}
            </p>
            <LandingPreviewCanvas
              browserLabel={t("landingPreviewBrowserLabel")}
              bodyClassName="min-h-[24rem] max-h-[calc(92vh-14rem)]"
            >
              {renderPreviewSections()}
            </LandingPreviewCanvas>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
