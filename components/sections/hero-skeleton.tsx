"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function HeroSkeleton() {
  return (
    <section className="bg-linear-to-br from-background to-muted py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-16 w-3/4" />
                <Skeleton className="h-16 w-1/2" />
              </div>
              <Skeleton className="h-24 w-full" />
            </div>

            <div className="bg-card p-6 rounded-lg shadow-xs border border-border">
              <div className="grid md:grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>

          {/* Right Content - Doctor Image */}
          <div className="relative">
            <div className="relative w-full max-w-md mx-auto">
              <Skeleton className="w-full aspect-square rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
