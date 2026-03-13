/**
 * Componente Presentacional de Información de Contacto
 *
 * Componente reutilizable que muestra la información de contacto
 * usando las traducciones de next-intl.
 */

"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import { useState, useEffect } from "react";

import { BusinessHours } from "@/components/contact/business-hours";
import { InfoCard } from "@/components/contact/info-card";
import { useTranslations } from "next-intl";
import { ContactInfoSkeleton } from "@/components/contact/contact-info-skeleton";
import { readJsonResponse } from "@/lib/utils/read-json-response";
import { SocialLinks } from "@/components/common/social-links";

interface ContactData {
  email?: string | null;
  telefono?: string | null;
  informacionPublica?: string | null;
  weekdaysHours?: string | null;
  saturdayHours?: string | null;
  sundayHours?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
  tiktok?: string | null;
  youtube?: string | null;
  website?: string | null;
}

interface ContactDataResponse {
  data?: ContactData;
}

interface ContactInfoProps {
  readonly className?: string;
  readonly initialData?: ContactData | null;
  readonly showBusinessHours?: boolean;
}

export function ContactInfo({
  className,
  initialData = null,
  showBusinessHours = true,
}: ContactInfoProps) {
  const t = useTranslations("Contact");
  const [publicData, setPublicData] = useState<ContactData | null>(initialData);
  const [publicLoading, setPublicLoading] = useState(!initialData);

  useEffect(() => {
    if (initialData) {
      return;
    }

    const fetchPublicContact = async () => {
      try {
        const response = await fetch("/api/public/contact");
        if (response.ok) {
          const data = await readJsonResponse<ContactDataResponse>(response);
          setPublicData(data?.data ?? null);
        }
      } catch (error) {
        console.error("Error fetching public contact data:", error);
      } finally {
        setPublicLoading(false);
      }
    };
    fetchPublicContact();
  }, [initialData]);

  if (publicLoading || !publicData) {
    return (
      <div className={`${className || ""}`}>
        <ContactInfoSkeleton showBusinessHours={showBusinessHours} />
      </div>
    );
  }

  const phoneNumber = publicData.telefono || "";
  const email = publicData.email || "";
  const address = publicData.informacionPublica || "";
  const socialData = publicData;

  return (
    <div className={`space-y-6 ${className || ""}`}>
      <InfoCard
        icon={<MapPin className="h-6 w-6" />}
        title={t("subtitle")}
      >
        <div className="space-y-4">
          {address ? (
            <div className="flex items-start gap-3 border-b border-border/60 pb-4">
              <MapPin className="mt-1 h-4 w-4 shrink-0 text-primary" />
              <div className="space-y-1">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-primary/68">
                  {t("address")}
                </p>
                <p>{address}</p>
              </div>
            </div>
          ) : null}

          {phoneNumber ? (
            <div className="flex items-start gap-3 border-b border-border/60 pb-4">
              <Phone className="mt-1 h-4 w-4 shrink-0 text-primary" />
              <div className="space-y-1">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-primary/68">
                  {t("phone")}
                </p>
                <p>{phoneNumber}</p>
              </div>
            </div>
          ) : null}

          <div className="flex items-start gap-3">
            <Mail className="mt-1 h-4 w-4 shrink-0 text-primary" />
            <div className="space-y-1">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-primary/68">
                {t("email")}
              </p>
              <p>{email || t("emailAddress")}</p>
            </div>
          </div>

          <div className="pt-2">
            <SocialLinks
              facebook={socialData?.facebook}
              instagram={socialData?.instagram}
              linkedin={socialData?.linkedin}
              twitter={socialData?.twitter}
              tiktok={socialData?.tiktok}
              youtube={socialData?.youtube}
              website={socialData?.website}
              iconSize={22}
            />
          </div>
        </div>
      </InfoCard>

      {showBusinessHours ? (
        <BusinessHours 
          weekdaysHours={publicData.weekdaysHours}
          saturdayHours={publicData.saturdayHours}
          sundayHours={publicData.sundayHours}
        />
      ) : null}
    </div>
  );
}
