"use client";

import { AlertCircle, CheckCircle2, Loader2, Mail, Phone } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isValidEmailInput, normalizeEmailInput } from "@/lib/validation/form-fields";
import { cn } from "@/lib/utils";

interface AppointmentsEmailRequestProps {
  companyEmail?: string | null;
  companyPhone?: string | null;
  className?: string;
  embedded?: boolean;
}

export function AppointmentsEmailRequest({
  companyEmail,
  companyPhone,
  className,
  embedded = false,
}: Readonly<AppointmentsEmailRequestProps>) {
  const t = useTranslations("Contact.appointments");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitLockRef = useRef(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitLockRef.current) {
      return;
    }

    const normalizedEmail = normalizeEmailInput(email);

    if (!normalizedEmail || !isValidEmailInput(normalizedEmail)) {
      setSuccess(false);
      setError(t("invalidEmail"));
      return;
    }

    try {
      submitLockRef.current = true;
      setSubmitting(true);
      setError(null);
      setSuccess(false);

      const response = await fetch("/api/public/appointments-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      if (!response.ok) {
        throw new Error("request_failed");
      }

      setEmail("");
      setSuccess(true);
    } catch {
      setSuccess(false);
      setError(t("error"));
    } finally {
      submitLockRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <div
      className={cn(
        "flex h-full flex-col",
        embedded ? "" : "surface-panel rounded-[24px] p-8 lg:p-10",
        className,
      )}
    >
      <div className="space-y-3">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {t("title")}
        </h2>
        <p className="max-w-2xl text-base leading-8 text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="appointments-email-request"
            className="text-sm font-medium text-foreground"
          >
            {t("emailLabel")}
          </label>
          <Input
            id="appointments-email-request"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (success) {
                setSuccess(false);
              }
              if (error) {
                setError(null);
              }
            }}
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder={t("emailPlaceholder")}
            aria-invalid={Boolean(error)}
            disabled={submitting}
            className={cn(
              "h-12 rounded-xl bg-background/88",
              error && "border-red-500 ring-1 ring-red-500/20",
            )}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="h-12 rounded-full px-6"
        >
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              {t("submitting")}
            </span>
          ) : (
            t("submit")
          )}
        </Button>
      </form>

      {success ? (
        <div className="mt-6 rounded-[24px] border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-900 dark:text-emerald-200">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-medium">{t("successTitle")}</p>
              <p className="mt-1 text-emerald-900/80 dark:text-emerald-100/80">
                {t("successDescription")}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="mt-6 rounded-[24px] border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-800 dark:text-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <p>{error}</p>
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          "surface-inset mt-8 rounded-[24px] p-5",
          embedded && "bg-[linear-gradient(180deg,oklch(var(--background)/0.92)_0%,oklch(var(--accent)/0.11)_100%)]",
        )}
      >
        <p className="text-sm font-semibold text-foreground">
          {t("contactTitle")}
        </p>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          {t("contactDescription")}
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          {companyEmail ? (
            <a
              href={`mailto:${companyEmail}`}
              className="surface-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/20 hover:text-primary"
            >
              <Mail className="size-4" />
              {companyEmail}
            </a>
          ) : null}
          {companyPhone ? (
            <a
              href={`tel:${companyPhone}`}
              className="surface-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/20 hover:text-primary"
            >
              <Phone className="size-4" />
              {companyPhone}
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
