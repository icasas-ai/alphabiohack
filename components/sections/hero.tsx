"use client"

import { CalendarDays, MapPin } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Button } from "@/components/ui/button"
import { PublicBrandLogo } from "@/components/common/public-brand-logo"
import { useRouter } from "@/i18n/navigation";
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
}

export function HeroSection({ initialPublicData, initialLocations }: HeroSectionProps) {
  const t = useTranslations('Hero');
  const router = useRouter();
  const [publicData, setPublicData] = useState<HeroData | null>(initialPublicData);
  const [publicLoading, setPublicLoading] = useState(!initialPublicData);
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");

  useEffect(() => {
    if (!initialPublicData) {
      const fetchPublicHero = async () => {
        try {
          const response = await fetch("/api/public/hero");
          if (response.ok) {
            const data = await response.json();
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
  const brandName = heroData?.name || "";
  const specialty = heroData?.publicSpecialty || "";
  const summary = heroData?.publicSummary || "";
  const imageSource = heroData?.logo || "/images/logo.png";

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
    <section className="flex flex-1 items-center bg-linear-to-br from-background to-muted py-20 lg:py-32" suppressHydrationWarning>
      {loading || !heroData ? (
        <HeroSkeleton />
      ) : (
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-balance">
                <span className="text-primary">{brandName}</span>
                <br />
                <span className="text-foreground">{specialty}</span>
              </h1>
              <p className="text-lg text-muted-foreground text-pretty max-w-lg">
                {summary}
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-xs border border-border">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  
                  <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
                    <SelectTrigger className="w-full pl-10">
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
                
                <Button className="w-full cursor-pointer" onClick={handleBookNow}>
                  <CalendarDays className="h-4 w-4 mr-2" />
                  {t('bookNow')}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Content - Doctor Image */}
          <div className="relative">
            <div className="relative w-full max-w-md mx-auto">
              <div className="absolute inset-0 bg-primary rounded-full transform scale-110 opacity-20"></div>
              <div className="relative flex items-center justify-center rounded-full bg-primary/20 p-6 sm:p-8">
                <PublicBrandLogo
                  src={imageSource}
                  alt={brandName || t("doctorImageAlt")}
                  variant="hero"
                />
              </div>
            </div>
          </div>
        </div>
        </div>
      )}
    </section>
  )
}
