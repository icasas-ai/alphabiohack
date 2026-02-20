"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ContactInfoSkeleton() {
  return (
    <div className="space-y-6">
      {/* Address Card */}
      <div className="p-6 rounded-lg bg-card border border-border">
        <div className="flex items-start gap-4">
          <Skeleton className="h-6 w-6 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>

      {/* Phone Card */}
      <div className="p-6 rounded-lg bg-card border border-border">
        <div className="flex items-start gap-4">
          <Skeleton className="h-6 w-6 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>

      {/* Email Card */}
      <div className="p-6 rounded-lg bg-card border border-border">
        <div className="flex items-start gap-4">
          <Skeleton className="h-6 w-6 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </div>

      {/* Business Hours Card */}
      <div className="p-6 rounded-lg bg-card border border-border">
        <Skeleton className="h-4 w-32 mb-3" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    </div>
  );
}
