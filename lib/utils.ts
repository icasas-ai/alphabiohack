import { clsx, type ClassValue } from "clsx";
import { hasSupabaseAuth } from "@/lib/auth/config";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const hasEnvVars = hasSupabaseAuth;
