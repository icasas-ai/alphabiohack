"use client"

import { CalendarDays, MapPin } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Button } from "@/components/ui/button"
import { PublicBrandLogo } from "@/components/common/public-brand-logo"
import { useRouter } from "@/i18n/navigation";
import { type LandingPageResolvedHeroSection } from "@/lib/company/landing-page-config";
import { readJsonResponse } from "@/lib/utils/read-json-response";
import { useTranslations } from 'next-intl';
import { useState, useEffect } from "react";
import { HeroSkeleton } from "@/components/sections/hero-skeleton";

interface HeroData {
  name: string;
  publicSpecialty?: string | null;
  publicSummary?: string | null;
  logo?: string | null;
}

interface HeroSectionProps {
  readonly initialPublicData: HeroData | null;
  readonly initialLocations: Array<{
    id: string;
    title: string;
  }>;
  readonly content?: LandingPageResolvedHeroSection | null;
}

export function HeroSection({
  initialPublicData,
  initialLocations,
  content = null,
}: HeroSectionProps) {
  const t = useTranslations('Hero');
  const router = useRouter();
  const publicCardRadiusClass = "rounded-[24px]";
  const [publicData, setPublicData] = useState<HeroData | null>(initialPublicData);
  const [publicLoading, setPublicLoading] = useState(!initialPublicData);
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");

  useEffect(() => {
    if (!initialPublicData) {
      const fetchPublicHero = async () => {
        try {
          const response = await fetch("/api/public/hero");
          if (response.ok) {
            const data = await readJsonResponse<HeroData>(response);
            setPublicData(data);
          }
        } catch (error) {
          console.error("Error fetching public hero data:", error);
        } finally {
          setPublicLoading(false);
        }
      };
      fetchPublicHero();
    }
  }, [initialPublicData]);

  const heroData = publicData;
  const loading = publicLoading && !heroData;
  const brandName = heroData?.name || t("title");
  const specialty = heroData?.publicSpecialty || t("subtitle");
  const summary = heroData?.publicSummary || t("description");
  const badge = content?.badge || t("badge");
  const helper = content?.helper || t("helper");
  const showcaseSummary = content?.showcaseSummary || t("showcaseSummary");
  const displayLogoSource = heroData?.logo || null;
  const hasDisplayLogo = Boolean(displayLogoSource);

  const handleBookNow = () => {
    if (selectedLocationId) {
      router.push({
        pathname: "/booking",
        query: {
          locationId: selectedLocationId,
          step: "1",
        },
      });
      return;
    }

    router.push("/booking");
  };
  
  return (
    <section
      id="home-hero"
      className="relative flex flex-1 items-center overflow-hidden bg-transparent py-16 lg:py-24"
      suppressHydrationWarning
    >
      {loading || !heroData ? (
        <HeroSkeleton />
      ) : (
        <>
          <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_top_left,oklch(var(--primary)/0.16),transparent_32%),radial-gradient(circle_at_78%_18%,oklch(var(--accent)/0.16),transparent_28%)]" />
          <div className="absolute left-[-6rem] top-12 h-48 w-48 rounded-full bg-[radial-gradient(circle,oklch(var(--accent)/0.18),transparent_72%)] blur-3xl" />
          <div className="absolute right-[-5rem] bottom-10 h-56 w-56 rounded-full bg-[radial-gradient(circle,oklch(var(--primary)/0.14),transparent_72%)] blur-3xl" />

          <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-14 lg:grid-cols-[1.04fr_0.96fr]">
              <div className="space-y-8">
                <div className="space-y-5">
                  <p className="inline-flex rounded-full border border-primary/16 bg-primary/8 px-4 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-primary">
                    {badge}
                  </p>
                  <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl lg:text-[4.3rem] lg:leading-[1.02]">
                    <span>{brandName}</span>
                    {specialty ? (
                      <span className="mt-2 block text-primary">
                        {specialty}
                      </span>
                    ) : null}
                  </h1>
                  <p className="max-w-xl text-lg leading-8 text-muted-foreground text-pretty">
                    {summary}
                  </p>
                </div>

                <div className={`surface-panel ${publicCardRadiusClass} p-6 sm:p-7`}>
                  <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                      <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
                        <SelectTrigger className="h-12 w-full rounded-xl border-border/80 bg-background pl-10">
                          <SelectValue placeholder={t('locationPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          {initialLocations.map((location) => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button className="h-12 w-full cursor-pointer rounded-xl px-6 md:w-auto" onClick={handleBookNow}>
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {t('bookNow')}
                    </Button>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-muted-foreground">
                    {helper}
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="relative mx-auto max-w-lg">
                  <div className="absolute inset-x-8 top-10 h-64 rounded-full bg-[radial-gradient(circle,oklch(var(--primary)/0.2),transparent_72%)] blur-3xl" />
                  <div className={`brand-showcase-panel relative overflow-hidden ${publicCardRadiusClass} p-8 sm:p-10`}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.06),transparent_46%)]" />

                    {hasDisplayLogo ? (
                      <div className={`brand-showcase-glass relative mx-auto flex w-fit max-w-full items-center justify-center overflow-hidden ${publicCardRadiusClass} px-2.5 py-2.5 sm:px-3.5 sm:py-3.5`}>
                        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.24),transparent_48%),radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_52%)]" />
                        <PublicBrandLogo
                          src={displayLogoSource}
                          alt={brandName || t("doctorImageAlt")}
                          variant="showcase"
                          className="relative z-10 max-w-full"
                        />
                      </div>
                    ) : (
                      <div className="relative space-y-3">
                        <h3 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                          {brandName}
                        </h3>
                        {specialty ? (
                          <p className="text-sm font-medium uppercase tracking-[0.22em] text-white/72">
                            {specialty}
                          </p>
                        ) : null}
                      </div>
                    )}

                    <p className="relative mt-8 max-w-md text-sm leading-7 text-white/76">
                      {showcaseSummary}
                    </p>

                    <div className="relative mt-8 grid gap-3 sm:grid-cols-2">
                      <div className={`border border-white/10 bg-white/[0.1] px-4 py-4 ${publicCardRadiusClass}`}>
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/62">
                          {t("logoCardSpecialtyLabel")}
                        </p>
                        <p className="mt-2 text-sm font-medium text-white">
                          {specialty}
                        </p>
                      </div>
                      <div className={`border border-white/10 bg-white/[0.08] px-4 py-4 ${publicCardRadiusClass}`}>
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/62">
                          {t("logoCardBookingLabel")}
                        </p>
                        <p className="mt-2 text-sm font-medium text-white">
                          {t("logoCardBookingValue")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
