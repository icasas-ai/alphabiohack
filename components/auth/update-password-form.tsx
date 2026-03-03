"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { hasSupabaseAuth } from "@/lib/auth/config";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useUser } from "@/contexts/user-context";
import { UserRole } from "@prisma/client";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations('Auth');
  const { refreshAuthState } = useUser();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!hasSupabaseAuth) {
        const response = await fetch("/api/auth/local/update-password", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.error || t('errorOccurred'));
        }

        await refreshAuthState();
        const roles = Array.isArray(data.user?.role) ? data.user.role : [];
        if (roles.includes(UserRole.FrontDesk)) {
          router.push("/appointments");
          return;
        }

        router.push("/dashboard");
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      router.push("/dashboard");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : t('errorOccurred'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t('updatePasswordTitle')}</CardTitle>
          <CardDescription>
            {t('updatePasswordDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleForgotPassword}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password">{t('newPassword')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t('newPasswordPlaceholder')}
                  required
                  minLength={8}
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('saving')}
                  </span>
                ) : t('saveNewPassword')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
