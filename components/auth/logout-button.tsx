"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/user-context";
import { useRouter } from "@/i18n/navigation";
import { logoutUser } from "@/services/auth.service";
import { useTranslations } from "next-intl";

export function LogoutButton() {
  const router = useRouter();
  const { refreshAuthState } = useUser();
  const t = useTranslations('Auth');

  const logout = async () => {
    await logoutUser();
    await refreshAuthState();
    router.refresh();
    router.push("/auth/login");
  };

  return <Button className="hover:bg-destructive hover:text-destructive-foreground cursor-pointer" onClick={logout}>{t('logout')}</Button>;
}
