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

interface ContactInfoProps {
  readonly className?: string;
  readonly initialData?: ContactData | null;
}

export function ContactInfo({ className, initialData = null }: ContactInfoProps) {
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
          const data = await response.json();
          setPublicData(data);
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
        <ContactInfoSkeleton />
      </div>
    );
  }

  const phoneNumber = publicData.telefono || "";
  const email = publicData.email || "";
  const address = publicData.informacionPublica || "";
  const socialData = publicData;

  return (
    <div className={`space-y-6 ${className || ""}`}>
      {/* Dirección */}
      {address && (
        <InfoCard
          icon={<MapPin className="h-6 w-6 text-blue-600" />}
          title={t("address")}
        >
          <p className="">{address}</p>
        </InfoCard>
      )}

      {/* Teléfono */}
      {phoneNumber && (
        <InfoCard
          icon={<Phone className="h-6 w-6 text-blue-600" />}
          title={t("phone")}
        >
          <p className="">{phoneNumber}</p>
        </InfoCard>
      )}

      {/* Email */}
      <InfoCard
        icon={<Mail className="h-6 w-6 text-blue-600" />}
        title={t("email")}
      >
        <div className="space-y-4">
          <p className="">{email || t("emailAddress")}</p>
          
          {/* Social Links */}
          <SocialLinks
            facebook={socialData?.facebook}
            instagram={socialData?.instagram}
            linkedin={socialData?.linkedin}
            twitter={socialData?.twitter}
            tiktok={socialData?.tiktok}
            youtube={socialData?.youtube}
            website={socialData?.website}
            iconSize={24}
          />
        </div>
      </InfoCard>

      {/* Horarios de Atención */}
      <BusinessHours 
        weekdaysHours={publicData.weekdaysHours}
        saturdayHours={publicData.saturdayHours}
        sundayHours={publicData.sundayHours}
      />
    </div>
  );
}
