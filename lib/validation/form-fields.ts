import { isValidPhoneNumber } from "libphonenumber-js/min";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function asTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeWhitespace(value: unknown) {
  return asTrimmedString(value).replace(/\s+/g, " ");
}

export function normalizeMultilineText(value: unknown) {
  return typeof value === "string" ? value.replace(/\r\n/g, "\n").trim() : "";
}

export function normalizeEmailInput(value: unknown) {
  return asTrimmedString(value).toLowerCase();
}

export function isValidEmailInput(value: string) {
  return EMAIL_REGEX.test(normalizeEmailInput(value));
}

export function normalizePhoneInput(value: unknown) {
  const trimmed = asTrimmedString(value);
  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("+")) {
    const normalized = `+${trimmed.slice(1).replace(/\D/g, "")}`;
    return normalized.length > 1 ? normalized : "";
  }

  return trimmed.replace(/[^\d()+\-\s]/g, "").trim();
}

export function isValidPhoneInput(value: string) {
  const normalized = normalizePhoneInput(value);
  if (!normalized) {
    return false;
  }

  if (normalized.startsWith("+")) {
    try {
      return isValidPhoneNumber(normalized);
    } catch {
      return false;
    }
  }

  return /^\+?[\d()\-\s]{7,20}$/.test(normalized);
}

export function normalizeUrlInput(value: unknown) {
  const trimmed = asTrimmedString(value);
  if (!trimmed) {
    return "";
  }

  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export function isValidUrlInput(value: string) {
  const normalized = normalizeUrlInput(value);
  if (!normalized) {
    return false;
  }

  try {
    const parsed = new URL(normalized);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    return parsed.hostname === "localhost" || parsed.hostname.includes(".");
  } catch {
    return false;
  }
}

export function normalizeSlugInput(value: unknown) {
  return asTrimmedString(value)
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function isValidSlugInput(value: string) {
  return SLUG_REGEX.test(normalizeSlugInput(value));
}

export function toOptionalString(value: string) {
  return value ? value : undefined;
}

export function toOptionalNullableString(value: string) {
  return value ? value : null;
}
