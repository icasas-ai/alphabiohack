import { ProfileForm } from "@/components/profile/profile-form";
import { useTranslations } from "next-intl";

export const metadata = {
  title: "Profile",
};

export default function ProfilePage() {
  const t = useTranslations("Profile");

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t("myProfile")}</h1>
        <p className="text-muted-foreground">
          {t("manageYourProfileInformation")}
        </p>
      </div>

      <div className="rounded-lg border p-6">
        <ProfileForm />
      </div>
    </div>
  );
}
