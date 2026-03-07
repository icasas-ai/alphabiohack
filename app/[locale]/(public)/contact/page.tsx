import { ContactForm, ContactHeader, ContactInfo, UrgentHelp } from "@/components/contact";
import { getPublicCompanyProfile } from "@/services/public-profile.service";

import { BusinessHours } from "@/components/contact/business-hours";
import { Card } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const t = await getTranslations("Contact");
  const company = await getPublicCompanyProfile().catch(() => null);
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
  const publicSummary =
    company?.publicSummary || company?.publicDescription || t("description");

  return (
    <div className="w-full">
      <section className="border-b border-border/60 bg-[linear-gradient(180deg,oklch(var(--background))_0%,oklch(var(--accent)/0.07)_100%)]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="space-y-8">
              <ContactHeader className="mx-0 text-left" />

              <div className="max-w-2xl space-y-4">
                {company?.name ? (
                  <p className="text-sm font-medium text-foreground/72">
                    {company.name}
                  </p>
                ) : null}
                <p className="text-base leading-8 text-muted-foreground">
                  {publicSummary}
                </p>
              </div>

              <ContactInfo
                initialData={initialContactData}
                showBusinessHours={false}
              />
            </div>

            <Card className="overflow-hidden rounded-[28px] border-border/70 bg-background px-0 py-0 shadow-[0_20px_44px_-36px_rgba(10,44,76,0.28)]">
              <div className="border-b border-border/60 bg-accent/10 px-8 py-7">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {t("form.submit")}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                  {t("description")}
                </p>
              </div>
              <div className="px-8 py-8">
                <ContactForm />
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <BusinessHours
            weekdaysHours={company?.weekdaysHours}
            saturdayHours={company?.saturdayHours}
            sundayHours={company?.sundayHours}
          />

          <UrgentHelp
            className="self-start"
            phoneNumber={company?.publicPhone}
            emailAddress={company?.publicEmail}
          />
        </div>
      </section>
    </div>
  );
}
