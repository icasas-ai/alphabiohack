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
import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import { CalendarDays, LayoutDashboard, Loader2, ShieldCheck, UserRound } from "lucide-react";
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
  const nav = useTranslations("Navigation");
  const prefersReducedMotion = useReducedMotion();
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
  const containerVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1] as const,
        staggerChildren: prefersReducedMotion ? 0 : 0.08,
      },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

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
    <LazyMotion features={domAnimation}>
      <m.div
        initial="hidden"
        animate="show"
        variants={containerVariants}
        className={cn("grid gap-6 lg:grid-cols-[1.08fr_minmax(0,0.92fr)]", className)}
        {...props}
      >
        <m.section
          variants={itemVariants}
          className="relative overflow-hidden rounded-[2rem] border border-[#1172B8]/28 bg-[linear-gradient(155deg,#081c31_0%,#0d4673_34%,#1172B8_68%,#79d4ff_100%)] p-6 text-white shadow-[0_32px_70px_-34px_rgba(10,42,71,0.72)] sm:p-8 lg:min-h-[40rem] lg:p-10"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(138,217,255,0.32),transparent_32%),radial-gradient(circle_at_78%_18%,rgba(17,114,184,0.3),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.18),transparent_26%)]" />
          <div className="absolute -left-12 top-16 h-40 w-40 rounded-full bg-[#8ad9ff]/18 blur-3xl motion-safe:animate-pulse" />
          <div className="absolute bottom-0 right-0 h-48 w-48 translate-x-10 translate-y-10 rounded-full bg-[#1172B8]/26 blur-3xl" />

          <div className="relative flex h-full flex-col justify-between gap-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-white/86 backdrop-blur">
                <ShieldCheck className="h-3.5 w-3.5" />
                {t("loginEyebrow")}
              </div>

              <div className="max-w-xl space-y-4">
                <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-[2.7rem] lg:leading-[1.05]">
                  {t("loginHeroTitle")}
                </h2>
                <p className="max-w-lg text-sm leading-7 text-white/80 sm:text-base">
                  {t("loginHeroDescription")}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {featureItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/14 bg-white/10 p-4 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1"
                  >
                    <Icon className="h-5 w-5 text-[#b8ebff]" />
                    <p className="mt-6 text-sm font-medium text-white/92">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </m.section>

        <m.div variants={itemVariants} className="flex items-center justify-center">
          <Card className="w-full max-w-[35rem] rounded-[2rem] border-border/65 bg-card/88 shadow-[0_32px_72px_-40px_rgba(24,32,48,0.45)]">
            <CardHeader className="border-b border-border/65 pb-6">
              <CardTitle className="text-3xl font-semibold tracking-tight text-foreground">
                {t('loginTitle')}
              </CardTitle>
              <CardDescription className="max-w-md text-[15px] leading-7 text-muted-foreground">
                {t('loginDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
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
                    className="h-12 w-full rounded-xl border border-black/10 text-base font-medium text-white shadow-[0_24px_40px_-24px_rgba(34,49,75,0.9)] transition-[transform,box-shadow,filter] duration-200 hover:-translate-y-0.5 hover:shadow-[0_28px_46px_-24px_rgba(34,49,75,0.95)]"
                    style={{
                      backgroundImage:
                        "linear-gradient(135deg, #0d4673 0%, #1172B8 100%)",
                    }}
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
            </CardContent>
          </Card>
        </m.div>
      </m.div>
    </LazyMotion>
  );
}
