"use client";

import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { cn } from "@/lib/utils";

interface AuthCardShellProps extends React.ComponentPropsWithoutRef<typeof Card> {
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthCardShell({
  title,
  description,
  children,
  className,
  ...props
}: AuthCardShellProps) {
  return (
    <Card
      className={cn(
        "w-full max-w-[35rem] rounded-[2rem] border-border/65 bg-card/88 shadow-[0_32px_72px_-40px_rgba(24,32,48,0.45)]",
        className,
      )}
      {...props}
    >
      <CardHeader className="border-b border-border/65 pb-6">
        <CardTitle className="text-3xl font-semibold tracking-tight text-foreground">
          {title}
        </CardTitle>
        <CardDescription className="max-w-md text-[15px] leading-7 text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-8">{children}</CardContent>
    </Card>
  );
}
