export const LANDING_PAGE_LOCALES = ["en-US", "es-MX"] as const

export type LandingPageLocale = (typeof LANDING_PAGE_LOCALES)[number]

export const DEFAULT_LANDING_PAGE_LOCALE: LandingPageLocale = "en-US"

export type LandingPageLocalizedText = Record<LandingPageLocale, string>

export type LandingPageCardContent = {
  title: LandingPageLocalizedText
  description: LandingPageLocalizedText
}

export type LandingPageHeroSection = {
  visible: boolean
  badge: LandingPageLocalizedText
  helper: LandingPageLocalizedText
  showcaseSummary: LandingPageLocalizedText
}

export type LandingPageSupportSection = {
  visible: boolean
  eyebrow: LandingPageLocalizedText
  title: LandingPageLocalizedText
  description: LandingPageLocalizedText
  cards: LandingPageCardContent[]
}

export type LandingPageJourneySection = {
  visible: boolean
  eyebrow: LandingPageLocalizedText
  title: LandingPageLocalizedText
  description: LandingPageLocalizedText
  steps: LandingPageCardContent[]
}

export type LandingPageLocationsSection = {
  visible: boolean
  eyebrow: LandingPageLocalizedText
  title: LandingPageLocalizedText
  description: LandingPageLocalizedText
  emptyMessage: LandingPageLocalizedText
}

export type LandingPageSimpleSection = {
  visible: boolean
  title: LandingPageLocalizedText
  description: LandingPageLocalizedText
}

export type LandingPageThemePalette = {
  primary: string
  accent: string
}

export type LandingPageThemeConfig = LandingPageThemePalette

export type LandingPageConfig = {
  theme: LandingPageThemeConfig
  hero: LandingPageHeroSection
  support: LandingPageSupportSection
  journey: LandingPageJourneySection
  locations: LandingPageLocationsSection
  blog: LandingPageSimpleSection
  specialties: LandingPageSimpleSection
}

export type LandingPageResolvedCardContent = {
  title: string
  description: string
}

export type LandingPageResolvedHeroSection = {
  visible: boolean
  badge: string
  helper: string
  showcaseSummary: string
}

export type LandingPageResolvedSupportSection = {
  visible: boolean
  eyebrow: string
  title: string
  description: string
  cards: LandingPageResolvedCardContent[]
}

export type LandingPageResolvedJourneySection = {
  visible: boolean
  eyebrow: string
  title: string
  description: string
  steps: LandingPageResolvedCardContent[]
}

export type LandingPageResolvedLocationsSection = {
  visible: boolean
  eyebrow: string
  title: string
  description: string
  emptyMessage: string
}

export type LandingPageResolvedSimpleSection = {
  visible: boolean
  title: string
  description: string
}

export type LandingPageResolvedConfig = {
  hero: LandingPageResolvedHeroSection
  support: LandingPageResolvedSupportSection
  journey: LandingPageResolvedJourneySection
  locations: LandingPageResolvedLocationsSection
  blog: LandingPageResolvedSimpleSection
  specialties: LandingPageResolvedSimpleSection
}

function createEmptyLocalizedText(): LandingPageLocalizedText {
  return {
    "en-US": "",
    "es-MX": "",
  }
}

function createDefaultCardContent(): LandingPageCardContent {
  return {
    title: createEmptyLocalizedText(),
    description: createEmptyLocalizedText(),
  }
}

function createDefaultThemePalette(): LandingPageThemePalette {
  return {
    primary: "#1272b8",
    accent: "#79d4ff",
  }
}

function createDefaultThemeConfig(): LandingPageThemeConfig {
  return createDefaultThemePalette()
}

function createDefaultLandingPageConfig(): LandingPageConfig {
  return {
    theme: createDefaultThemeConfig(),
    hero: {
      visible: true,
      badge: createEmptyLocalizedText(),
      helper: createEmptyLocalizedText(),
      showcaseSummary: createEmptyLocalizedText(),
    },
    support: {
      visible: true,
      eyebrow: createEmptyLocalizedText(),
      title: createEmptyLocalizedText(),
      description: createEmptyLocalizedText(),
      cards: [
        createDefaultCardContent(),
        createDefaultCardContent(),
        createDefaultCardContent(),
      ],
    },
    journey: {
      visible: true,
      eyebrow: createEmptyLocalizedText(),
      title: createEmptyLocalizedText(),
      description: createEmptyLocalizedText(),
      steps: [
        createDefaultCardContent(),
        createDefaultCardContent(),
        createDefaultCardContent(),
      ],
    },
    locations: {
      visible: true,
      eyebrow: createEmptyLocalizedText(),
      title: createEmptyLocalizedText(),
      description: createEmptyLocalizedText(),
      emptyMessage: createEmptyLocalizedText(),
    },
    blog: {
      visible: true,
      title: createEmptyLocalizedText(),
      description: createEmptyLocalizedText(),
    },
    specialties: {
      visible: true,
      title: createEmptyLocalizedText(),
      description: createEmptyLocalizedText(),
    },
  }
}

export const DEFAULT_LANDING_PAGE_CONFIG = createDefaultLandingPageConfig()

function normalizeString(value: unknown) {
  return typeof value === "string" ? value : ""
}

function normalizeBoolean(value: unknown, fallback = true) {
  return typeof value === "boolean" ? value : fallback
}

function normalizeHexColor(value: unknown, fallback: string) {
  if (typeof value !== "string") {
    return fallback
  }

  const normalized = value.trim().toLowerCase()
  return /^#[0-9a-f]{6}$/.test(normalized) ? normalized : fallback
}

export function normalizeLandingPageLocale(value: unknown): LandingPageLocale {
  return LANDING_PAGE_LOCALES.includes(value as LandingPageLocale)
    ? (value as LandingPageLocale)
    : DEFAULT_LANDING_PAGE_LOCALE
}

function normalizeLocalizedText(value: unknown): LandingPageLocalizedText {
  if (typeof value === "string") {
    return {
      "en-US": value,
      "es-MX": value,
    }
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return createEmptyLocalizedText()
  }

  const rawValue = value as Record<string, unknown>

  return {
    "en-US": normalizeString(rawValue["en-US"]),
    "es-MX": normalizeString(rawValue["es-MX"]),
  }
}

function normalizeCardContentList(value: unknown, size = 3) {
  const items = Array.isArray(value) ? value : []

  return Array.from({ length: size }, (_, index) => {
    const item = items[index]
    if (!item || typeof item !== "object") {
      return createDefaultCardContent()
    }

    const rawItem = item as {
      title?: unknown
      description?: unknown
    }

    return {
      title: normalizeLocalizedText(rawItem.title),
      description: normalizeLocalizedText(rawItem.description),
    }
  })
}

export function getLocalizedLandingText(
  value: unknown,
  locale: LandingPageLocale,
) {
  return normalizeLocalizedText(value)[locale]
}

export function setLocalizedLandingText(
  value: unknown,
  locale: LandingPageLocale,
  nextValue: string,
) {
  return {
    ...normalizeLocalizedText(value),
    [locale]: nextValue,
  } satisfies LandingPageLocalizedText
}

export function normalizeLandingPageConfig(value: unknown): LandingPageConfig {
  const raw =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Partial<LandingPageConfig>)
      : {}

  const hero = raw.hero && typeof raw.hero === "object" ? raw.hero : {}
  const support =
    raw.support && typeof raw.support === "object" ? raw.support : {}
  const journey =
    raw.journey && typeof raw.journey === "object" ? raw.journey : {}
  const locations =
    raw.locations && typeof raw.locations === "object" ? raw.locations : {}
  const blog = raw.blog && typeof raw.blog === "object" ? raw.blog : {}
  const specialties =
    raw.specialties && typeof raw.specialties === "object" ? raw.specialties : {}
  const theme = raw.theme && typeof raw.theme === "object" ? raw.theme : {}
  const directTheme = theme as Partial<LandingPageThemePalette>
  const legacyPublicTheme =
    (theme as { public?: unknown }).public &&
    typeof (theme as { public?: unknown }).public === "object"
      ? ((theme as { public?: unknown }).public as Partial<LandingPageThemePalette>)
      : {}
  const defaultTheme = createDefaultThemeConfig()

  return {
    theme: {
      primary: normalizeHexColor(
        directTheme.primary ?? legacyPublicTheme.primary,
        defaultTheme.primary,
      ),
      accent: normalizeHexColor(
        directTheme.accent ?? legacyPublicTheme.accent,
        defaultTheme.accent,
      ),
    },
    hero: {
      visible: normalizeBoolean((hero as { visible?: unknown }).visible),
      badge: normalizeLocalizedText((hero as { badge?: unknown }).badge),
      helper: normalizeLocalizedText((hero as { helper?: unknown }).helper),
      showcaseSummary: normalizeLocalizedText(
        (hero as { showcaseSummary?: unknown }).showcaseSummary,
      ),
    },
    support: {
      visible: normalizeBoolean((support as { visible?: unknown }).visible),
      eyebrow: normalizeLocalizedText(
        (support as { eyebrow?: unknown }).eyebrow,
      ),
      title: normalizeLocalizedText((support as { title?: unknown }).title),
      description: normalizeLocalizedText(
        (support as { description?: unknown }).description,
      ),
      cards: normalizeCardContentList((support as { cards?: unknown }).cards),
    },
    journey: {
      visible: normalizeBoolean((journey as { visible?: unknown }).visible),
      eyebrow: normalizeLocalizedText(
        (journey as { eyebrow?: unknown }).eyebrow,
      ),
      title: normalizeLocalizedText((journey as { title?: unknown }).title),
      description: normalizeLocalizedText(
        (journey as { description?: unknown }).description,
      ),
      steps: normalizeCardContentList((journey as { steps?: unknown }).steps),
    },
    locations: {
      visible: normalizeBoolean((locations as { visible?: unknown }).visible),
      eyebrow: normalizeLocalizedText(
        (locations as { eyebrow?: unknown }).eyebrow,
      ),
      title: normalizeLocalizedText((locations as { title?: unknown }).title),
      description: normalizeLocalizedText(
        (locations as { description?: unknown }).description,
      ),
      emptyMessage: normalizeLocalizedText(
        (locations as { emptyMessage?: unknown }).emptyMessage,
      ),
    },
    blog: {
      visible: normalizeBoolean((blog as { visible?: unknown }).visible),
      title: normalizeLocalizedText((blog as { title?: unknown }).title),
      description: normalizeLocalizedText(
        (blog as { description?: unknown }).description,
      ),
    },
    specialties: {
      visible: normalizeBoolean(
        (specialties as { visible?: unknown }).visible,
      ),
      title: normalizeLocalizedText(
        (specialties as { title?: unknown }).title,
      ),
      description: normalizeLocalizedText(
        (specialties as { description?: unknown }).description,
      ),
    },
  }
}

export function parseLandingPageConfig(value: unknown): LandingPageConfig {
  if (typeof value === "string" && value.trim()) {
    try {
      return normalizeLandingPageConfig(JSON.parse(value))
    } catch {
      return createDefaultLandingPageConfig()
    }
  }

  return normalizeLandingPageConfig(value)
}

export function resolveLandingPageConfigForLocale(
  value: unknown,
  locale: LandingPageLocale,
): LandingPageResolvedConfig {
  const config = parseLandingPageConfig(value)

  return {
    hero: {
      visible: config.hero.visible,
      badge: getLocalizedLandingText(config.hero.badge, locale),
      helper: getLocalizedLandingText(config.hero.helper, locale),
      showcaseSummary: getLocalizedLandingText(
        config.hero.showcaseSummary,
        locale,
      ),
    },
    support: {
      visible: config.support.visible,
      eyebrow: getLocalizedLandingText(config.support.eyebrow, locale),
      title: getLocalizedLandingText(config.support.title, locale),
      description: getLocalizedLandingText(config.support.description, locale),
      cards: config.support.cards.map((card) => ({
        title: getLocalizedLandingText(card.title, locale),
        description: getLocalizedLandingText(card.description, locale),
      })),
    },
    journey: {
      visible: config.journey.visible,
      eyebrow: getLocalizedLandingText(config.journey.eyebrow, locale),
      title: getLocalizedLandingText(config.journey.title, locale),
      description: getLocalizedLandingText(config.journey.description, locale),
      steps: config.journey.steps.map((step) => ({
        title: getLocalizedLandingText(step.title, locale),
        description: getLocalizedLandingText(step.description, locale),
      })),
    },
    locations: {
      visible: config.locations.visible,
      eyebrow: getLocalizedLandingText(config.locations.eyebrow, locale),
      title: getLocalizedLandingText(config.locations.title, locale),
      description: getLocalizedLandingText(config.locations.description, locale),
      emptyMessage: getLocalizedLandingText(
        config.locations.emptyMessage,
        locale,
      ),
    },
    blog: {
      visible: config.blog.visible,
      title: getLocalizedLandingText(config.blog.title, locale),
      description: getLocalizedLandingText(config.blog.description, locale),
    },
    specialties: {
      visible: config.specialties.visible,
      title: getLocalizedLandingText(config.specialties.title, locale),
      description: getLocalizedLandingText(
        config.specialties.description,
        locale,
      ),
    },
  }
}

export function serializeLandingPageConfig(value: unknown) {
  return JSON.stringify(normalizeLandingPageConfig(value))
}
