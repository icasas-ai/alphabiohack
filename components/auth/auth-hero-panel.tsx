"use client";

import type { LucideIcon } from "lucide-react";

import { ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";

export type AuthFeatureItem = {
  icon: LucideIcon;
  label: string;
};

interface AuthHeroPanelProps extends React.ComponentPropsWithoutRef<"section"> {
  eyebrow: string;
  title: string;
  description: string;
  eyebrowIcon?: LucideIcon;
  features?: AuthFeatureItem[];
}

export function AuthHeroPanel({
  eyebrow,
  title,
  description,
  eyebrowIcon: EyebrowIcon = ShieldCheck,
  features = [],
  className,
  ...props
}: AuthHeroPanelProps) {
  return (
    <section
      className={cn(
        "brand-showcase-panel relative overflow-hidden rounded-[2rem] p-6 text-white sm:p-8 lg:min-h-[40rem] lg:p-10",
        className,
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,oklch(var(--accent)/0.24),transparent_32%),radial-gradient(circle_at_78%_18%,oklch(var(--primary)/0.26),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.18),transparent_26%)]" />
      <div className="absolute -left-12 top-16 h-40 w-40 rounded-full bg-[radial-gradient(circle,oklch(var(--accent)/0.24),transparent_72%)] blur-3xl motion-safe:animate-pulse" />
      <div className="absolute bottom-0 right-0 h-48 w-48 translate-x-10 translate-y-10 rounded-full bg-[radial-gradient(circle,oklch(var(--primary)/0.28),transparent_72%)] blur-3xl" />

      <div className="relative flex h-full flex-col justify-between gap-10">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-white/86 backdrop-blur">
            <EyebrowIcon className="h-3.5 w-3.5" />
            {eyebrow}
          </div>

          <div className="max-w-xl space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-[2.7rem] lg:leading-[1.05]">
              {title}
            </h2>
            <p className="max-w-lg text-sm leading-7 text-white/80 sm:text-base">
              {description}
            </p>
          </div>
        </div>

        {features.length ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {features.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/14 bg-white/10 p-4 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1"
                >
                  <Icon className="h-5 w-5 text-accent" />
                  <p className="mt-6 text-sm font-medium text-white/92">{item.label}</p>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
