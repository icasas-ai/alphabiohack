import { ContactForm, ContactHeader, ContactInfo, UrgentHelp } from "@/components/contact";
import { getPublicCompanyProfile } from "@/services/public-profile.service";

import { Card } from "@/components/ui/card";

export default async function ContactPage() {
  const company = await getPublicCompanyProfile();
  const initialContactData = company
    ? {
        email: company.publicEmail,
        telefono: company.publicPhone,
        informacionPublica: company.publicDescription,
        weekdaysHours: company.weekdaysHours,
        saturdayHours: company.saturdayHours,
        sundayHours: company.sundayHours,
        facebook: company.facebook,
        instagram: company.instagram,
        linkedin: company.linkedin,
        twitter: company.twitter,
        tiktok: company.tiktok,
        youtube: company.youtube,
        website: company.website,
      }
    : null;

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Encabezado */}
          <ContactHeader />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Información de contacto - Lado izquierdo */}
            <ContactInfo initialData={initialContactData} />

            {/* Formulario de contacto - Lado derecho */}
            <Card className="p-8">
              <ContactForm />
            </Card>
          </div>

          {/* Ayuda urgente */}
          <UrgentHelp />
        </div>
      </div>
    </div>
  );
}
