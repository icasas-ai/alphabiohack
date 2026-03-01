import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation"
import { LogoutButton } from "./logout-button";
import { getCurrentUser } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";

export async function AuthButton() {
  const t = await getTranslations('Auth');
  const { authUser } = await getCurrentUser();
  const user = authUser;
  return user ? (
    <div className="flex items-center gap-4">
      {t('welcomeBack', { email: user?.email })}
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">{t('signIn')}</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/auth/sign-up">{t('signUp')}</Link>
      </Button>
    </div>
  );
}
