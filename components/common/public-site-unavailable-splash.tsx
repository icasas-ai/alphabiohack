import { Leaf, TimerReset } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function PublicSiteUnavailableSplash() {
  const t = await getTranslations("PublicSiteUnavailable");

  return (
    <section
      id="public-site-unavailable"
      className="relative flex min-h-[70vh] items-center overflow-hidden px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,oklch(var(--accent)/0.12),transparent_28%),radial-gradient(circle_at_80%_20%,oklch(var(--primary)/0.12),transparent_26%)]" />
      <div className="absolute left-[-5rem] top-10 h-44 w-44 rounded-full bg-[radial-gradient(circle,oklch(var(--accent)/0.18),transparent_72%)] blur-3xl" />
      <div className="absolute bottom-[-4rem] right-[-4rem] h-56 w-56 rounded-full bg-[radial-gradient(circle,oklch(var(--primary)/0.14),transparent_72%)] blur-3xl" />

      <div className="relative mx-auto w-full max-w-3xl">
        <div className="overflow-hidden rounded-[24px] border border-border/70 bg-[linear-gradient(180deg,oklch(var(--background))_0%,oklch(var(--accent)/0.06)_100%)] p-8 shadow-[0_28px_80px_-48px_rgba(10,44,76,0.38)] sm:p-10 lg:p-12">
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/85 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-foreground/72 backdrop-blur">
              <Leaf className="h-3.5 w-3.5 text-primary" />
              {t("badge")}
            </div>

            <div className="mt-8 flex h-16 w-16 items-center justify-center rounded-full border border-primary/18 bg-primary/8 text-primary">
              <TimerReset className="h-7 w-7" />
            </div>

            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {t("title")}
            </h1>

            <p className="mt-4 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
              {t("description")}
            </p>

            <p className="mt-6 rounded-full border border-border/70 bg-background/80 px-5 py-2 text-sm text-foreground/70">
              {t("returnLater")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
