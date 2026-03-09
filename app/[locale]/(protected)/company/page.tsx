import { CompanyProfileForm } from "@/components/company/company-profile-form";
import { SurfaceCard } from "@/components/ui/surface-card";
import { useTranslations } from "next-intl";

export const metadata = {
  title: "Company",
};

export default function CompanyPage() {
  const t = useTranslations("CompanyProfile");

  return (
    <div className="space-y-8">
      <SurfaceCard
        variant="highlight"
        className="gap-2 overflow-hidden rounded-[30px] px-6 py-7 sm:px-8"
      >
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            {t("description")}
          </p>
        </div>
      </SurfaceCard>

      <CompanyProfileForm />
    </div>
  );
}
