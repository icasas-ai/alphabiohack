import type { ReactNode } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

type SaveReminderCalloutProps = {
  children: ReactNode;
  className?: string;
};

export function SaveReminderCallout({
  children,
  className,
}: SaveReminderCalloutProps) {
  return (
    <Alert variant="warning" className={cn("px-4 py-3", className)}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}
