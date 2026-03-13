"use client"

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation"
import { useTranslations } from "next-intl";
import { useUser } from "@/contexts/user-context";

export function AuthButton() {
  const { loading, isAuthenticated } = useUser();
  const t = useTranslations("Auth");

  if (loading) {
    return (
      <div className="flex space-x-2">
        <div className="h-9 w-36 bg-muted animate-pulse rounded-md"></div>
      </div>
    );
  }

  return (
    <Button variant={isAuthenticated ? "outline" : "default"}>
      <Link href={isAuthenticated ? "/dashboard" : "/auth/login"}>
        {isAuthenticated ? t("therapistPortal") : t("therapistSignIn")}
      </Link>
    </Button>
  );
}
