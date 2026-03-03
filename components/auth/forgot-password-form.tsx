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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { getAuthCapabilities, requestPasswordReset } from "@/services/auth.service";
import { useState } from "react";
import { useTranslations } from "next-intl";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations('Auth');
  const authCapabilities = getAuthCapabilities();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await requestPasswordReset(email);
      if (!result.supported) {
        setError(t("passwordResetUnavailableLocal"));
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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {success ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t('checkEmail')}</CardTitle>
            <CardDescription>{t('passwordResetInstructions')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('passwordResetEmailSent')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t('forgotPasswordTitle')}</CardTitle>
            <CardDescription>
              {t('forgotPasswordDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword}>
              <div className="flex flex-col gap-6">
                {!authCapabilities.supportsPasswordResetByEmail && (
                  <Alert variant="warning">
                    <AlertDescription>{t("passwordResetUnavailableLocal")}</AlertDescription>
                  </Alert>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="email">{t('email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !authCapabilities.supportsPasswordResetByEmail}
                >
                  {isLoading ? t('sending') : t('sendResetEmail')}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                {t('haveAccount')}{" "}
                <Link
                  href="/auth/login"
                  className="underline underline-offset-4"
                >
                  {t('login')}
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
