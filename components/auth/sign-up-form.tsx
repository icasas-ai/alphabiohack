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
import { UserRole } from "@/lib/prisma-browser";
import { cn } from "@/lib/utils";
import { hasSupabaseAuth } from "@/lib/auth/config";
import { useRouter } from "@/i18n/navigation";
import { isValidEmailInput, normalizeEmailInput } from "@/lib/validation/form-fields";
import { registerUser } from "@/services/auth.service";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useUser } from "@/contexts/user-context";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const router = useRouter();
  const { refreshAuthState } = useUser();
  const t = useTranslations('Auth');
  const normalizedEmail = normalizeEmailInput(email);
  const emailError =
    hasAttemptedSubmit && (!normalizedEmail ? t("emailRequired") : !isValidEmailInput(normalizedEmail) ? t("emailInvalid") : null);
  const passwordError =
    hasAttemptedSubmit && (!password ? t("passwordRequired") : password.length < 8 ? t("passwordTooShort") : null);
  const repeatPasswordError =
    hasAttemptedSubmit && (!repeatPassword ? t("passwordRequired") : password !== repeatPassword ? t("passwordMismatch") : null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);
    setIsLoading(true);
    setError(null);

    if (
      !normalizedEmail ||
      !isValidEmailInput(normalizedEmail) ||
      !password ||
      password.length < 8 ||
      !repeatPassword ||
      password !== repeatPassword
    ) {
      if (password && repeatPassword && password !== repeatPassword) {
        setError(t('passwordMismatch'));
      }
      setIsLoading(false);
      return;
    }

    try {
      const result = await registerUser(normalizedEmail, password);

      if (hasSupabaseAuth && result?.user) {
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

      await refreshAuthState();
      router.refresh();
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
          <CardTitle className="text-2xl">{t('signUpTitle')}</CardTitle>
          <CardDescription>{t('signUpDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  required
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
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder={t('passwordPlaceholder')}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={Boolean(passwordError)}
                  className={cn(passwordError && "border-red-500 ring-1 ring-red-500/20")}
                  autoComplete="new-password"
                />
                {passwordError ? <p className="text-sm text-red-500">{passwordError}</p> : null}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="repeat-password">{t('repeatPassword')}</Label>
                </div>
                <Input
                  id="repeat-password"
                  type="password"
                  placeholder={t('passwordPlaceholder')}
                  required
                  minLength={8}
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  aria-invalid={Boolean(repeatPasswordError)}
                  className={cn(repeatPasswordError && "border-red-500 ring-1 ring-red-500/20")}
                  autoComplete="new-password"
                />
                {repeatPasswordError ? <p className="text-sm text-red-500">{repeatPasswordError}</p> : null}
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t('loading') : t('signUpButton')}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              {t('haveAccount')}{" "}
              <Link href="/auth/login" className="underline underline-offset-4">
                {t('login')}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
