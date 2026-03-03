"use client"

import { CalendarDays, MapPin } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from 'next-intl';
import { useUser } from "@/contexts/user-context";
import { useState, useEffect } from "react";
import { HeroSkeleton } from "@/components/sections/hero-skeleton";

interface HeroData {
  firstname: string;
  lastname: string;
  especialidad?: string | null;
  summary?: string | null;
  avatar?: string | null;
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
  const { prismaUser, loading: authLoading, isAuthenticated } = useUser();
  const router = useRouter();
  const [publicData, setPublicData] = useState<HeroData | null>(initialPublicData);
  const [publicLoading, setPublicLoading] = useState(!initialPublicData);
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");

  // Cuando no estamos autenticados, traer datos públicos
  useEffect(() => {
    if (!isAuthenticated && !initialPublicData) {
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
  }, [initialPublicData, isAuthenticated]);

  // Usar datos autenticados si existen, sino usar públicos
  const heroData = prismaUser || publicData;
  const loading = authLoading && !heroData && publicLoading;
  const imageSource = heroData?.avatar || "";
  const fullName = heroData ? `${heroData.firstname} ${heroData.lastname}` : "";
  const especialidad = heroData?.especialidad || "";
  const summary = heroData?.summary || "";

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
    <section className="bg-linear-to-br from-background to-muted py-20 lg:py-32" suppressHydrationWarning>
      {loading || !heroData ? (
        <HeroSkeleton />
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-balance">
                <span className="text-primary">Hello, I`m {fullName}</span>
                <br />
                <span className="text-foreground">{especialidad}</span>
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
              <div className="relative bg-primary rounded-full p-8">
                {imageSource && (
                  <>
                    {imageSource.startsWith('data:image') ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageSource}
                        alt={`${fullName} profile`}
                        className="w-full h-auto rounded-full object-cover"
                      />
                    ) : (
                      <Image
                        src={imageSource}
                        alt={`${fullName} profile`}
                        className="w-full h-auto rounded-full object-cover"
                        width={500}
                        height={500}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>
      )}
    </section>
  )
}
