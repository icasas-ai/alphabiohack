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
import { PhoneInput } from "@/components/ui/phone-input";
import { cn } from "@/lib/utils";
import { useRouter } from "@/i18n/navigation";
import {
  isValidEmailInput,
  isValidPhoneInput,
  normalizeEmailInput,
  normalizePhoneInput,
  normalizeWhitespace,
} from "@/lib/validation/form-fields";
import { registerUser } from "@/services/auth.service";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useUser } from "@/contexts/user-context";
import { useSearchParams } from "next/navigation";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const searchParams = useSearchParams();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const router = useRouter();
  const { refreshAuthState } = useUser();
  const t = useTranslations('Auth');
  const normalizedFirstName = normalizeWhitespace(firstName);
  const normalizedLastName = normalizeWhitespace(lastName);
  const normalizedPhone = normalizePhoneInput(phone);
  const normalizedEmail = normalizeEmailInput(email);
  const firstNameError =
    hasAttemptedSubmit && !normalizedFirstName ? t("firstNameRequired") : null;
  const lastNameError =
    hasAttemptedSubmit && !normalizedLastName ? t("lastNameRequired") : null;
  const phoneError =
    hasAttemptedSubmit &&
    (!normalizedPhone ? t("phoneRequired") : !isValidPhoneInput(normalizedPhone) ? t("phoneInvalid") : null);
  const emailError =
    hasAttemptedSubmit && (!normalizedEmail ? t("emailRequired") : !isValidEmailInput(normalizedEmail) ? t("emailInvalid") : null);
  const passwordError =
    hasAttemptedSubmit && (!password ? t("passwordRequired") : password.length < 8 ? t("passwordTooShort") : null);
  const repeatPasswordError =
    hasAttemptedSubmit && (!repeatPassword ? t("passwordRequired") : password !== repeatPassword ? t("passwordMismatch") : null);

  useEffect(() => {
    const queryEmail = normalizeEmailInput(searchParams.get("email") ?? "");
    const queryFirstName = normalizeWhitespace(searchParams.get("firstname") ?? "");
    const queryLastName = normalizeWhitespace(searchParams.get("lastname") ?? "");
    const queryPhone = normalizePhoneInput(searchParams.get("phone") ?? "");

    if (queryFirstName && !normalizeWhitespace(firstName)) {
      setFirstName(queryFirstName);
    }

    if (queryLastName && !normalizeWhitespace(lastName)) {
      setLastName(queryLastName);
    }

    if (queryPhone && !normalizePhoneInput(phone)) {
      setPhone(queryPhone);
    }

    if (queryEmail && !normalizeEmailInput(email)) {
      setEmail(queryEmail);
    }
  }, [email, firstName, lastName, phone, searchParams]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);
    setIsLoading(true);
    setError(null);

    if (
      !normalizedFirstName ||
      !normalizedLastName ||
      !normalizedPhone ||
      !isValidPhoneInput(normalizedPhone) ||
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
      await registerUser(normalizedEmail, password, {
        firstname: normalizedFirstName,
        lastname: normalizedLastName,
        phone: normalizedPhone,
      });

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
                <Label htmlFor="first-name">{t('firstName')}</Label>
                <Input
                  id="first-name"
                  type="text"
                  placeholder={t('firstName')}
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  aria-invalid={Boolean(firstNameError)}
                  className={cn(firstNameError && "border-red-500 ring-1 ring-red-500/20")}
                  autoComplete="given-name"
                  autoCapitalize="words"
                />
                {firstNameError ? <p className="text-sm text-red-500">{firstNameError}</p> : null}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">{t('lastName')}</Label>
                <Input
                  id="last-name"
                  type="text"
                  placeholder={t('lastName')}
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  aria-invalid={Boolean(lastNameError)}
                  className={cn(lastNameError && "border-red-500 ring-1 ring-red-500/20")}
                  autoComplete="family-name"
                  autoCapitalize="words"
                />
                {lastNameError ? <p className="text-sm text-red-500">{lastNameError}</p> : null}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">{t('phone')}</Label>
                <PhoneInput
                  id="phone"
                  value={phone}
                  onChange={(value) => setPhone(value || "")}
                  defaultCountry="US"
                  aria-invalid={Boolean(phoneError)}
                  className={cn(
                    phoneError &&
                      "[&_input]:border-red-500 [&_input]:ring-1 [&_input]:ring-red-500/20",
                  )}
                />
                {phoneError ? <p className="text-sm text-red-500">{phoneError}</p> : null}
              </div>
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
