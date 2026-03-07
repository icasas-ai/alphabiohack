import { ArrowRight, CalendarCheck2, MapPin, Sparkles, Waves, Waypoints } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { getTranslations } from "next-intl/server"

type CompanyData = {
  name?: string | null
  publicSummary?: string | null
  publicSpecialty?: string | null
} | null

type TherapistData = {
  firstname?: string | null
  lastname?: string | null
  especialidad?: string | null
  summary?: string | null
  informacionPublica?: string | null
} | null

type LocationData = {
  id: string
  title: string
}

interface HomeBodySectionProps {
  company: CompanyData
  therapist: TherapistData
  locations: LocationData[]
}

export async function HomeBodySection({
  company,
  therapist,
  locations,
}: HomeBodySectionProps) {
  const t = await getTranslations("HomeLanding")
  const shouldScrollLocations = locations.length > 5

  const therapistName =
    [therapist?.firstname, therapist?.lastname].filter(Boolean).join(" ") ||
    t("guideFallbackName")
  const therapistSpecialty =
    therapist?.especialidad || company?.publicSpecialty || t("guideFallbackSpecialty")
  const therapistSummary =
    therapist?.summary ||
    therapist?.informacionPublica ||
    company?.publicSummary ||
    t("guideFallbackBio")

  const pillars = [
    {
      icon: Sparkles,
      title: t("pillars.oneTitle"),
      description: t("pillars.oneDescription"),
    },
    {
      icon: Waves,
      title: t("pillars.twoTitle"),
      description: t("pillars.twoDescription"),
    },
    {
      icon: Waypoints,
      title: t("pillars.threeTitle"),
      description: t("pillars.threeDescription"),
    },
  ]

  const steps = [
    {
      title: t("steps.oneTitle"),
      description: t("steps.oneDescription"),
    },
    {
      title: t("steps.twoTitle"),
      description: t("steps.twoDescription"),
    },
    {
      title: t("steps.threeTitle"),
      description: t("steps.threeDescription"),
    },
  ]

  return (
    <>
      <section className="relative border-t border-border/50 py-16 lg:py-24">
        <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_top_left,oklch(var(--accent)/0.14),transparent_35%),radial-gradient(circle_at_85%_15%,oklch(var(--primary)/0.1),transparent_32%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div className="space-y-6">
              <div className="max-w-2xl space-y-4">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-primary/72">
                  {t("careEyebrow")}
                </p>
                <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {t("careTitle")}
                </h2>
                <p className="text-base leading-8 text-muted-foreground">
                  {t("careDescription")}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {pillars.map(({ icon: Icon, title, description }) => (
                  <div
                    key={title}
                    className="surface-panel rounded-[28px] p-6"
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

            <div className="surface-panel rounded-[32px] p-8 lg:p-10">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-primary/72">
                {t("guideEyebrow")}
              </p>
              <div className="mt-4 space-y-2">
                <h3 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {therapistName}
                </h3>
                <p className="text-sm font-medium uppercase tracking-[0.22em] text-primary/72">
                  {therapistSpecialty}
                </p>
              </div>

              <p className="mt-6 text-sm leading-8 text-muted-foreground sm:text-base">
                {therapistSummary}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full border border-primary/18 bg-primary/10 px-4 py-2 text-xs font-medium text-primary">
                  {company?.publicSpecialty || t("guideAppointments")}
                </span>
                <span className="rounded-full border border-border/70 bg-background/82 px-4 py-2 text-xs font-medium text-foreground/80">
                  {t("guideLanguages")}
                </span>
                {locations.length ? (
                  <span className="rounded-full border border-border/70 bg-background/82 px-4 py-2 text-xs font-medium text-foreground/80">
                    {t("guideLocations", {count: locations.length})}
                  </span>
                ) : null}
              </div>

              <div className="mt-8 border-t border-border/60 pt-6">
                <p className="text-sm leading-7 text-muted-foreground">
                  {t("guideNote")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.94fr_1.06fr] lg:items-stretch">
            <div className="flex h-full flex-col rounded-[32px] border border-primary/14 bg-[linear-gradient(160deg,oklch(var(--primary)/0.09)_0%,oklch(var(--accent)/0.06)_100%)] p-8 shadow-[0_22px_60px_-42px_rgba(10,44,76,0.28)] lg:p-10">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-primary/72">
                {t("journeyEyebrow")}
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {t("journeyTitle")}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-muted-foreground">
                {t("journeyDescription")}
              </p>

              <div className="mt-8 space-y-4">
                {steps.map((step, index) => (
                  <div
                    key={step.title}
                    className="rounded-[24px] border border-border/70 bg-background/82 p-5"
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

            <div className="surface-panel flex h-full flex-col rounded-[32px] p-8 lg:p-10">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="max-w-2xl space-y-3">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-primary/72">
                    {t("locationsEyebrow")}
                  </p>
                  <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    {t("locationsTitle")}
                  </h2>
                  <p className="text-base leading-8 text-muted-foreground">
                    {t("locationsDescription")}
                  </p>
                </div>

                {locations.length ? (
                  <span className="rounded-full border border-border/70 bg-background/86 px-4 py-2 text-sm font-medium text-foreground/82">
                    {t("guideLocations", {count: locations.length})}
                  </span>
                ) : null}
              </div>

              <div className={`mt-8 grid gap-3 ${shouldScrollLocations ? "max-h-[360px] overflow-y-auto pr-1" : ""}`}>
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
                      className="group flex items-center justify-between rounded-[22px] border border-border/70 bg-background/86 px-5 py-4 transition-colors hover:border-primary/25 hover:bg-primary/6"
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
                  <div className="rounded-[22px] border border-dashed border-border/80 bg-background/70 px-5 py-6 text-sm leading-7 text-muted-foreground">
                    {t("locationsEmpty")}
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
          </div>
        </div>
      </section>
    </>
  )
}
