import {
  ContactAppointmentsSection,
  ContactForm,
  ContactHeader,
  ContactInfo,
  UrgentHelp,
} from "@/components/contact";
import { PublicSiteUnavailableSplash } from "@/components/common/public-site-unavailable-splash";
import { getPublicCompanyProfile } from "@/services/public-profile.service";

import { BusinessHours } from "@/components/contact/business-hours";
import { Card } from "@/components/ui/card";
import { isPublicSiteUnavailableError } from "@/services/company.service";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const t = await getTranslations("Contact");
  let company: Awaited<ReturnType<typeof getPublicCompanyProfile>>;

  try {
    company = await getPublicCompanyProfile();
  } catch (error) {
    if (isPublicSiteUnavailableError(error)) {
      return <PublicSiteUnavailableSplash />;
    }

    throw error;
  }
  const twoCardGridClass = "grid gap-8 lg:grid-cols-2 lg:items-stretch";
  const surfacePanelClass = "surface-panel flex h-full flex-col rounded-[24px] p-8 lg:p-10";
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
      <section className="border-b border-border/60 bg-[radial-gradient(circle_at_top_left,oklch(var(--primary)/0.14),transparent_34%),radial-gradient(circle_at_85%_12%,oklch(var(--accent)/0.18),transparent_28%),linear-gradient(180deg,oklch(var(--background))_0%,oklch(var(--accent)/0.1)_100%)]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className={twoCardGridClass}>
            <div className={surfacePanelClass}>
              <ContactHeader className="mx-0 text-left" />

              <div className="mt-8 max-w-2xl space-y-4">
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
                className="mt-8"
                initialData={initialContactData}
                showBusinessHours={false}
              />
            </div>

            <Card className="surface-panel flex h-full flex-col overflow-hidden rounded-[24px] px-0 py-0">
              <div className="border-b border-primary/12 bg-[linear-gradient(135deg,oklch(var(--primary)/0.14)_0%,oklch(var(--accent)/0.16)_100%)] px-8 py-7">
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

      <ContactAppointmentsSection
        companyDescription={company?.publicDescription}
        companyEmail={company?.publicEmail}
        companyPhone={company?.publicPhone}
      />

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className={twoCardGridClass}>
          <BusinessHours
            className="h-full"
            weekdaysHours={company?.weekdaysHours}
            saturdayHours={company?.saturdayHours}
            sundayHours={company?.sundayHours}
          />

          <UrgentHelp
            className="h-full"
            phoneNumber={company?.publicPhone}
            emailAddress={company?.publicEmail}
          />
        </div>
      </section>
    </div>
  );
}
