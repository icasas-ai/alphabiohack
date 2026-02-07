import { CalendarDays, MapPin } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Link } from "@/i18n/navigation";
import { useTranslations } from 'next-intl';

export function HeroSection() {
  const t = useTranslations('Hero');
  return (
    <section className="bg-linear-to-br from-background to-muted py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-balance">
                <span className="text-primary">{t('title')}</span>
                <br />
                <span className="text-foreground">{t('subtitle')}</span>
              </h1>
              <p className="text-lg text-muted-foreground text-pretty max-w-lg">
                {t('description')}
              </p>
            </div>

            {/* Search Form */}
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
                <Image
                  src="https://bwqlvbnkfkrchjdbbcfl.supabase.co/storage/v1/object/public/avatars/ff21719d-ad00-4c1b-9274-c9452b556728/Imagen%20de%20WhatsApp%202025-09-09%20a%20las%2012.47.07_7afb8bfa.jpg"
                  alt={t('doctorImageAlt')}
                  className="w-full h-auto rounded-full object-cover"
                  width={500}
                  height={500}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
