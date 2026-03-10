"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type BaseProps = {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  autoComplete?: React.ComponentProps<"input">["autoComplete"];
  inputMode?: React.ComponentProps<"input">["inputMode"];
  maxLength?: number;
  autoCapitalize?: React.ComponentProps<"input">["autoCapitalize"];
  spellCheck?: boolean;
  error?: string;
};

type FieldType = "input" | "textarea";

type FormFieldProps = BaseProps & {
  type?: FieldType;
  inputType?: React.ComponentProps<"input">["type"];
};

export function FormField({
  id,
  name,
  label,
  placeholder,
  required,
  className,
  value,
  onChange,
  onBlur,
  type = "input",
  inputType = "text",
  autoComplete,
  inputMode,
  maxLength,
  autoCapitalize,
  spellCheck,
  error,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      {type === "textarea" ? (
        <Textarea
          id={id}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          rows={5}
          maxLength={maxLength}
          spellCheck={spellCheck}
          aria-invalid={Boolean(error)}
          className={cn("w-full resize-none", error && "border-red-500 ring-1 ring-red-500/20")}
        />
      ) : (
        <Input
          id={id}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          spellCheck={spellCheck}
          aria-invalid={Boolean(error)}
          className={cn("w-full", error && "border-red-500 ring-1 ring-red-500/20")}
        />
      )}
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  );
}
