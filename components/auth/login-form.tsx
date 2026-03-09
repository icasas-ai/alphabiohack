"use client";

import { AuthCardShell } from "@/components/auth/auth-card-shell";
import { AuthHeroPanel } from "@/components/auth/auth-hero-panel";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/navigation"
import { CalendarDays, LayoutDashboard, Loader2, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "@/i18n/navigation";
import { loginUser } from "@/services/auth.service";
import { isValidEmailInput, normalizeEmailInput } from "@/lib/validation/form-fields";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useUser } from "@/contexts/user-context";

type LoginFormProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration"
>;

export function LoginForm({
  className,
  ...props
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const router = useRouter();
  const { refreshAuthState } = useUser();
  const t = useTranslations('Auth');
  const nav = useTranslations("Navigation");
  const normalizedEmail = normalizeEmailInput(email);
  const emailError =
    hasAttemptedSubmit && (!normalizedEmail ? t("emailRequired") : !isValidEmailInput(normalizedEmail) ? t("emailInvalid") : null);
  const passwordError = hasAttemptedSubmit && !password ? t("passwordRequired") : null;
  const featureItems = [
    {
      icon: CalendarDays,
      label: nav("appointments"),
    },
    {
      icon: LayoutDashboard,
      label: nav("dashboard"),
    },
    {
      icon: UserRound,
      label: nav("profile"),
    },
  ];

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

      await refreshAuthState();
      const destination =
        result?.mustChangePassword ? "/auth/update-password" : "/dashboard";

      router.replace(destination);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : t('errorOccurred'));
      setIsLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      className={className}
      hero={
        <AuthHeroPanel
          eyebrow={t("loginEyebrow")}
          title={t("loginHeroTitle")}
          description={t("loginHeroDescription")}
          features={featureItems}
        />
      }
      form={
        <AuthCardShell
          title={t("loginTitle")}
          description={t("loginDescription")}
        >
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2.5">
                <Label htmlFor="email" className="text-[0.78rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {t('email')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  required
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={Boolean(emailError)}
                  className={cn(
                    "h-12 rounded-xl border-border/75 bg-background/78 px-4 text-sm shadow-none hover:border-primary/30 focus-visible:border-primary/50 focus-visible:ring-primary/12",
                    emailError && "border-red-500 ring-1 ring-red-500/20",
                  )}
                  autoComplete="email"
                  autoCapitalize="none"
                  inputMode="email"
                  spellCheck={false}
                />
                {emailError ? <p className="text-sm text-red-500">{emailError}</p> : null}
              </div>
              <div className="grid gap-2.5">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="password" className="text-[0.78rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    {t('password')}
                  </Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
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
                  className={cn(
                    "h-12 rounded-xl border-border/75 bg-background/78 px-4 text-sm shadow-none hover:border-primary/30 focus-visible:border-primary/50 focus-visible:ring-primary/12",
                    passwordError && "border-red-500 ring-1 ring-red-500/20",
                  )}
                  autoComplete="current-password"
                />
                {passwordError ? <p className="text-sm text-red-500">{passwordError}</p> : null}
              </div>
              {isLoading ? (
                <div className="flex items-start gap-3 rounded-2xl border border-primary/16 bg-primary/6 px-4 py-4 text-sm">
                  <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-primary" />
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{t('signingInTitle')}</p>
                    <p className="text-muted-foreground">{t('signingInDescription')}</p>
                  </div>
                </div>
              ) : null}
              {error ? (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              ) : null}
              <Button
                type="submit"
                className="brand-button h-12 w-full rounded-xl text-base font-medium transition-[transform,box-shadow,filter] duration-200 hover:-translate-y-0.5 hover:shadow-[0_28px_46px_-24px_rgba(34,49,75,0.95)]"
                disabled={isLoading}
              >
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
        </AuthCardShell>
      }
      {...props}
    />
  );
}
