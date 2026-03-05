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
import { Link } from "@/i18n/navigation"
import { Loader2 } from "lucide-react";
import { UserRole } from "@/lib/prisma-browser";
import { cn } from "@/lib/utils";
import { hasSupabaseAuth } from "@/lib/auth/config";
import { useRouter } from "@/i18n/navigation";
import { loginUser } from "@/services/auth.service";
import { isValidEmailInput, normalizeEmailInput } from "@/lib/validation/form-fields";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useUser } from "@/contexts/user-context";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const router = useRouter();
  const { refreshAuthState } = useUser();
  const t = useTranslations('Auth');
  const normalizedEmail = normalizeEmailInput(email);
  const emailError =
    hasAttemptedSubmit && (!normalizedEmail ? t("emailRequired") : !isValidEmailInput(normalizedEmail) ? t("emailInvalid") : null);
  const passwordError = hasAttemptedSubmit && !password ? t("passwordRequired") : null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);
    setIsLoading(true);
    setError(null);

    try {
      if (!normalizedEmail || !isValidEmailInput(normalizedEmail) || !password) {
        setIsLoading(false);
        return;
      }

      const result = await loginUser(normalizedEmail, password);

      if (hasSupabaseAuth && result?.user) {
        const prismaUser = await fetch(`/api/users?email=${encodeURIComponent(normalizedEmail)}`);
        const prismaUserData = await prismaUser.json();
        if (!prismaUserData?.data?.length) {
          await fetch(`/api/users`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: normalizedEmail,
              supabaseId: result.user.id,
              firstname: "",
              lastname: "",
              avatar: "",
              role: [UserRole.Patient],
            }),
          });
        }
      }

      await refreshAuthState();
      const destination =
        !hasSupabaseAuth && result?.mustChangePassword
          ? "/auth/update-password"
          : "/dashboard";

      router.replace(destination);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : t('errorOccurred'));
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">{t('loginTitle')}</CardTitle>
          <CardDescription>
            {t('loginDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  required
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={Boolean(emailError)}
                  className={cn(emailError && "border-red-500 ring-1 ring-red-500/20")}
                  autoComplete="email"
                  autoCapitalize="none"
                  inputMode="email"
                  spellCheck={false}
                />
                {emailError ? <p className="text-sm text-red-500">{emailError}</p> : null}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">{t('password')}</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    {t('forgotPassword')}
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder={t('passwordPlaceholder')}
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={Boolean(passwordError)}
                  className={cn(passwordError && "border-red-500 ring-1 ring-red-500/20")}
                  autoComplete="current-password"
                />
                {passwordError ? <p className="text-sm text-red-500">{passwordError}</p> : null}
              </div>
              {isLoading ? (
                <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
                  <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-primary" />
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{t('signingInTitle')}</p>
                    <p className="text-muted-foreground">{t('signingInDescription')}</p>
                  </div>
                </div>
              ) : null}
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full text-accent-foreground" disabled={isLoading}>
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('signingInButton')}
                  </span>
                ) : (
                  t('signInButton')
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
