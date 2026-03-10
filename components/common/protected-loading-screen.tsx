"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Skeleton } from "@/components/ui/skeleton";

export function ProtectedLoadingScreen() {
  const t = useTranslations("Dashboard");

  return (
    <div className="min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-[272px_minmax(0,1fr)]">
        <aside className="hidden border-r bg-muted/20 lg:block">
          <div className="space-y-4 p-4">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <div className="space-y-2 pt-4">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="flex h-16 items-center justify-between border-b bg-background px-4 lg:px-6">
            <Skeleton className="h-5 w-40" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
          </header>

          <main className="flex-1 p-4 lg:p-8">
            <div className="mx-auto flex max-w-5xl flex-col gap-6">
              <div className="flex items-center gap-3 rounded-2xl border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>{t("loading")}</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Skeleton className="h-32 rounded-2xl" />
                <Skeleton className="h-32 rounded-2xl" />
                <Skeleton className="h-32 rounded-2xl" />
                <Skeleton className="h-32 rounded-2xl" />
              </div>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
                <Skeleton className="h-80 rounded-3xl" />
                <div className="space-y-6">
                  <Skeleton className="h-40 rounded-3xl" />
                  <Skeleton className="h-32 rounded-3xl" />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
