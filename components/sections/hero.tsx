"use client"

import { CalendarDays, MapPin } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Link } from "@/i18n/navigation";
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

export function HeroSection() {
  const t = useTranslations('Hero');
  const { prismaUser, loading: authLoading, isAuthenticated } = useUser();
  const [publicData, setPublicData] = useState<HeroData | null>(null);
  const [publicLoading, setPublicLoading] = useState(true);

  // Cuando no estamos autenticados, traer datos públicos
  useEffect(() => {
    if (!isAuthenticated) {
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
  }, [isAuthenticated]);

  // Determinar si estamos cargando
  const loading = isAuthenticated ? authLoading : publicLoading;

  // Usar datos autenticados si existen, sino usar públicos
  const heroData = isAuthenticated ? prismaUser : publicData;
  const imageSource = heroData?.avatar || "";
  const fullName = heroData ? `${heroData.firstname} ${heroData.lastname}` : "";
  const especialidad = heroData?.especialidad || "";
  const summary = heroData?.summary || "";
  
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
                  
                  <Select >
                    <SelectTrigger className="w-full pl-10">
                      <SelectValue placeholder={t('locationPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="albuquerque">{t('locations.albuquerque')}</SelectItem>
                      <SelectItem value="dallas">{t('locations.dallas')}</SelectItem>
                      <SelectItem value="phoenix">{t('locations.phoenix')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Link href="/booking" className="w-full cursor-pointer">
                  <Button className="w-full cursor-pointer">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  {t('bookNow')}
                </Button>
                </Link>
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
