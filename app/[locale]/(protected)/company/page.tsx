import { CompanyProfileForm } from "@/components/company/company-profile-form";
import { useTranslations } from "next-intl";

export const metadata = {
  title: "Company",
};

export default function CompanyPage() {
  const t = useTranslations("CompanyProfile");

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <div className="rounded-lg border p-6">
        <CompanyProfileForm />
      </div>
    </div>
  );
}
