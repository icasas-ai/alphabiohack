"use client";

import { Card } from "@/components/ui/card";

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function InfoCard({ icon, title, children, className }: InfoCardProps) {
  return (
    <Card className={`rounded-[24px] border-border/70 bg-background p-6 shadow-none transition-colors duration-200 hover:border-primary/18 ${className || ''}`}>
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          {icon}
        </div>
        <div className="space-y-1.5">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <div className="text-sm leading-7 text-muted-foreground">
            {children}
          </div>
        </div>
      </div>
    </Card>
  );
}
