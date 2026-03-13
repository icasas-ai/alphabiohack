import { getTranslations } from "next-intl/server";

import { AppointmentsEmailRequest } from "@/components/contact/appointments-email-request";

interface ContactAppointmentsSectionProps {
  companyDescription?: string | null;
  companyEmail?: string | null;
  companyPhone?: string | null;
}

export async function ContactAppointmentsSection({
  companyDescription,
  companyEmail,
  companyPhone,
}: Readonly<ContactAppointmentsSectionProps>) {
  const t = await getTranslations("Contact.appointments");
  const insetCardClass = "surface-inset rounded-[24px] p-5";

  return (
    <section
      id="contact-appointments-lookup"
      className="relative overflow-hidden border-b border-border/50 py-14 lg:py-16"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,oklch(var(--primary)/0.1),transparent_34%),radial-gradient(circle_at_85%_18%,oklch(var(--accent)/0.12),transparent_32%)]" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="surface-panel relative rounded-[24px] p-8 lg:p-10">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-stretch">
            <div className="flex h-full flex-col">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-primary/72">
                {t("eyebrow")}
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {t("supportTitle")}
              </h2>
              <p className="mt-4 text-base leading-8 text-muted-foreground">
                {companyDescription || t("supportDescription")}
              </p>

              <div className="mt-8 space-y-4">
                <div className={insetCardClass}>
                  <h3 className="font-semibold text-foreground">
                    {t("supportPointOneTitle")}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {t("supportPointOneDescription")}
                  </p>
                </div>
                <div className={insetCardClass}>
                  <h3 className="font-semibold text-foreground">
                    {t("supportPointTwoTitle")}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {t("supportPointTwoDescription")}
                  </p>
                </div>
              </div>
            </div>

            <AppointmentsEmailRequest
              companyEmail={companyEmail}
              companyPhone={companyPhone}
              embedded
              className="border-t border-border/60 pt-10 lg:border-t-0 lg:border-l lg:pl-10 lg:pt-0"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
