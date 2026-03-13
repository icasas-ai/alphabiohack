import { clsx, type ClassValue } from "clsx";
import { hasSupabaseStorage } from "@/lib/auth/config";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const hasEnvVars = hasSupabaseStorage;
