"use client";

import { AuthCardShell } from "@/components/auth/auth-card-shell";
import { AuthHeroPanel } from "@/components/auth/auth-hero-panel";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { ArrowLeft, KeyRound, Loader2, Mail, MailCheck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils";
import { getAuthCapabilities, requestPasswordReset } from "@/services/auth.service";
import { isValidEmailInput, normalizeEmailInput } from "@/lib/validation/form-fields";
import { useState } from "react";
import { useTranslations } from "next-intl";

type ForgotPasswordFormProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration"
>;

export function ForgotPasswordForm({
  className,
  ...props
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const t = useTranslations('Auth');
  const authCapabilities = getAuthCapabilities();
  const usesTemporaryPassword = authCapabilities.passwordResetMethod === "temporary_password";
  const normalizedEmail = normalizeEmailInput(email);
  const emailError =
    hasAttemptedSubmit && (!normalizedEmail ? t("emailRequired") : !isValidEmailInput(normalizedEmail) ? t("emailInvalid") : null);
  const featureItems = [
    {
      icon: Mail,
      label: t("email"),
    },
    {
      icon: KeyRound,
      label: t("resetPassword"),
    },
    {
      icon: ShieldCheck,
      label: t("loginEyebrow"),
    },
  ];

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);
    setIsLoading(true);
    setError(null);

    try {
      if (!normalizedEmail || !isValidEmailInput(normalizedEmail)) {
        setIsLoading(false);
        return;
      }

      const result = await requestPasswordReset(normalizedEmail);
      if (!result.supported) {
        setError(t("passwordResetUnavailable"));
        return;
      }
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : t('errorOccurred'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      className={className}
      hero={
        <AuthHeroPanel
          eyebrow={t("loginEyebrow")}
          title={success ? t("checkEmail") : t("forgotPasswordTitle")}
          description={
            success
              ? usesTemporaryPassword
                ? t("temporaryPasswordEmailSent")
                : t("passwordResetEmailSent")
              : usesTemporaryPassword
                ? t("forgotPasswordDescriptionTemporary")
                : t("forgotPasswordDescription")
          }
          eyebrowIcon={ShieldCheck}
          features={featureItems}
        />
      }
      form={
        <AuthCardShell
          title={success ? t('checkEmail') : t('forgotPasswordTitle')}
          description={
            success
              ? usesTemporaryPassword
                ? t('temporaryPasswordSent')
                : t('passwordResetInstructions')
              : usesTemporaryPassword
                ? t('forgotPasswordDescriptionTemporary')
                : t('forgotPasswordDescription')
          }
        >
          {success ? (
            <div className="space-y-6">
              <div className="flex items-start gap-3 rounded-2xl border border-primary/16 bg-primary/6 px-4 py-4 text-sm">
                <MailCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div className="space-y-1">
                  <p className="font-medium text-foreground">
                    {usesTemporaryPassword ? t("temporaryPasswordSent") : t("passwordResetInstructions")}
                  </p>
                  <p className="text-muted-foreground">
                    {usesTemporaryPassword ? t("temporaryPasswordEmailSent") : t("passwordResetEmailSent")}
                  </p>
                  {usesTemporaryPassword ? (
                    <p className="text-muted-foreground">{t("temporaryPasswordDeliveryHint")}</p>
                  ) : null}
                </div>
              </div>

              <Button asChild variant="outline" className="h-12 w-full rounded-xl border-border/75 bg-background/72 text-base font-medium">
                <Link href="/auth/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t("backToLogin")}
                </Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword}>
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
                {isLoading ? (
                  <div className="flex items-start gap-3 rounded-2xl border border-primary/16 bg-primary/6 px-4 py-4 text-sm">
                    <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-primary" />
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{t('sending')}</p>
                      <p className="text-muted-foreground">
                        {usesTemporaryPassword ? t('temporaryPasswordSent') : t('passwordResetInstructions')}
                      </p>
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
                  {isLoading ? t('sending') : usesTemporaryPassword ? t('sendTemporaryPassword') : t('sendResetEmail')}
                </Button>
              </div>
              <div className="mt-6 text-center text-sm text-muted-foreground">
                {t('haveAccount')}{" "}
                <Link
                  href="/auth/login"
                  className="font-medium text-foreground transition-colors duration-200 hover:text-primary"
                >
                  {t('login')}
                </Link>
              </div>
            </form>
          )}
        </AuthCardShell>
      }
      {...props}
    />
  );
}
