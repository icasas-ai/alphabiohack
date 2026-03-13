import { ArrowRight, CalendarCheck2, MapPin, Sparkles, Waves, Waypoints } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { type LandingPageResolvedConfig } from "@/lib/company/landing-page-config"
import { getTranslations } from "next-intl/server"

type LocationData = {
  id: string
  title: string
}

interface HomeBodySectionProps {
  locations: LocationData[]
  content?: Pick<LandingPageResolvedConfig, "support" | "journey" | "locations"> | null
}

export async function HomeBodySection({
  locations,
  content = null,
}: HomeBodySectionProps) {
  const t = await getTranslations("HomeLanding")
  const shouldScrollLocations = locations.length > 5
  const visibleSplitSectionCount =
    (content?.journey.visible !== false ? 1 : 0) +
    (content?.locations.visible !== false ? 1 : 0)
  const splitGridClass =
    visibleSplitSectionCount > 1
      ? "grid gap-8 lg:grid-cols-2 lg:items-stretch"
      : "grid gap-8"
  const surfacePanelClass = "surface-panel flex h-full flex-col rounded-[24px] p-8 lg:p-10"
  const insetCardClass = "surface-inset rounded-[24px] p-5"
  const accentPanelClass =
    "surface-brand-tint flex h-full flex-col rounded-[24px] p-8 lg:p-10"

  const pillars = [
    {
      icon: Sparkles,
      title: content?.support.cards[0]?.title || t("pillars.oneTitle"),
      description:
        content?.support.cards[0]?.description || t("pillars.oneDescription"),
    },
    {
      icon: Waves,
      title: content?.support.cards[1]?.title || t("pillars.twoTitle"),
      description:
        content?.support.cards[1]?.description || t("pillars.twoDescription"),
    },
    {
      icon: Waypoints,
      title: content?.support.cards[2]?.title || t("pillars.threeTitle"),
      description:
        content?.support.cards[2]?.description || t("pillars.threeDescription"),
    },
  ]
  const careEyebrow = content?.support.eyebrow || t("careEyebrow")
  const careTitle = content?.support.title || t("careTitle")
  const careDescription = content?.support.description || t("careDescription")
  const journeyEyebrow = content?.journey.eyebrow || t("journeyEyebrow")
  const journeyTitle = content?.journey.title || t("journeyTitle")
  const journeyDescription =
    content?.journey.description || t("journeyDescription")
  const locationsEyebrow = content?.locations.eyebrow || t("locationsEyebrow")
  const locationsTitle = content?.locations.title || t("locationsTitle")
  const locationsDescription =
    content?.locations.description || t("locationsDescription")
  const locationsEmptyMessage =
    content?.locations.emptyMessage || t("locationsEmpty")

  const steps = [
    {
      title: content?.journey.steps[0]?.title || t("steps.oneTitle"),
      description:
        content?.journey.steps[0]?.description || t("steps.oneDescription"),
    },
    {
      title: content?.journey.steps[1]?.title || t("steps.twoTitle"),
      description:
        content?.journey.steps[1]?.description || t("steps.twoDescription"),
    },
    {
      title: content?.journey.steps[2]?.title || t("steps.threeTitle"),
      description:
        content?.journey.steps[2]?.description || t("steps.threeDescription"),
    },
  ]

  return (
    <>
      {content?.support.visible !== false ? (
        <section
          id="home-care-overview"
          className="relative border-t border-border/50 py-16 lg:py-20"
        >
          <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_top_left,oklch(var(--accent)/0.14),transparent_35%),radial-gradient(circle_at_85%_15%,oklch(var(--primary)/0.1),transparent_32%)]" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className={surfacePanelClass}>
              <div className="max-w-3xl space-y-4">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-primary/72">
                  {careEyebrow}
                </p>
                <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {careTitle}
                </h2>
                <p className="text-base leading-8 text-muted-foreground">
                  {careDescription}
                </p>
              </div>

              <div className="mt-8 grid gap-4 lg:grid-cols-3">
                {pillars.map(({ icon: Icon, title, description }) => (
                  <div
                    key={title}
                    className={`${insetCardClass} h-full`}
                  >
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-5 text-base font-semibold text-foreground">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      {description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {content?.journey.visible !== false || content?.locations.visible !== false ? (
        <section id="home-booking-journey" className="py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className={splitGridClass}>
              {content?.journey.visible !== false ? (
                <div className={accentPanelClass}>
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-primary/72">
                    {journeyEyebrow}
                  </p>
                  <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    {journeyTitle}
                  </h2>
                  <p className="mt-4 max-w-2xl text-base leading-8 text-muted-foreground">
                    {journeyDescription}
                  </p>

                  <div className="mt-8 space-y-4">
                    {steps.map((step, index) => (
                      <div
                        key={step.title}
                        className={insetCardClass}
                      >
                        <div className="flex gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                            {index + 1}
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-semibold text-foreground">
                              {step.title}
                            </h3>
                            <p className="text-sm leading-7 text-muted-foreground">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {content?.locations.visible !== false ? (
                <div className={surfacePanelClass}>
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div className="max-w-2xl space-y-3">
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-primary/72">
                        {locationsEyebrow}
                      </p>
                      <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                        {locationsTitle}
                      </h2>
                      <p className="text-base leading-8 text-muted-foreground">
                        {locationsDescription}
                      </p>
                    </div>

                    {locations.length ? (
                      <span className="surface-chip rounded-full px-4 py-2 text-sm font-medium text-foreground/82">
                        {t("guideLocations", {count: locations.length})}
                      </span>
                    ) : null}
                  </div>

                  <div className={`mt-8 grid gap-4 ${shouldScrollLocations ? "max-h-[360px] overflow-y-auto pr-1" : ""}`}>
                    {locations.length ? (
                      locations.map((location) => (
                        <Link
                          key={location.id}
                          href={{
                            pathname: "/booking",
                            query: {
                              locationId: location.id,
                              step: "1",
                            },
                          }}
                          className={`group flex items-center justify-between ${insetCardClass} transition-colors hover:border-primary/25 hover:bg-primary/6`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/14">
                              <MapPin className="h-4 w-4" />
                            </span>
                            <span className="text-sm font-medium text-foreground">
                              {location.title}
                            </span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-primary/68 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      ))
                    ) : (
                      <div className="rounded-[24px] border border-dashed border-border/80 bg-background/70 px-5 py-6 text-sm leading-7 text-muted-foreground">
                        {locationsEmptyMessage}
                      </div>
                    )}
                  </div>

                  <div className="mt-auto flex flex-wrap gap-3 pt-8">
                    <Button asChild size="lg" className="rounded-full px-6">
                      <Link href="/booking">
                        <CalendarCheck2 className="h-4 w-4" />
                        {t("bookNow")}
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="rounded-full px-6">
                      <Link href="/contact">
                        {t("contactLink")}
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

    </>
  )
}
