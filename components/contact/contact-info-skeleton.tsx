"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface ContactInfoSkeletonProps {
  showBusinessHours?: boolean;
}

export function ContactInfoSkeleton({
  showBusinessHours = true,
}: ContactInfoSkeletonProps) {
  return (
    <div className="space-y-6">
      {/* Combined Contact Card */}
      <div className="rounded-[24px] border border-border bg-card p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="h-6 w-6 rounded" />
          <div className="flex-1 space-y-5">
            <div className="space-y-2 border-b border-border/60 pb-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="space-y-2 border-b border-border/60 pb-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-36" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-44" />
            </div>
          </div>
        </div>
      </div>

      {showBusinessHours ? (
        <div className="rounded-[24px] border border-border bg-card p-6">
          <Skeleton className="mb-3 h-4 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
