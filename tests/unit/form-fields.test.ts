import { describe, expect, it } from "vitest";

import {
  isValidEmailInput,
  isValidPhoneInput,
  isValidSlugInput,
  isValidUrlInput,
  normalizeEmailInput,
  normalizePhoneInput,
  normalizeSlugInput,
  normalizeUrlInput,
  normalizeWhitespace,
} from "@/lib/validation/form-fields";

describe("form field normalization", () => {
  it("normalizes emails to trimmed lowercase strings", () => {
    expect(normalizeEmailInput("  Omar@Test.COM ")).toBe("omar@test.com");
    expect(isValidEmailInput("omar@test.com")).toBe(true);
  });

  it("normalizes phone numbers and validates e.164 values", () => {
    expect(normalizePhoneInput("+1 555 123 4567")).toBe("+15551234567");
    expect(isValidPhoneInput("+14155552671")).toBe(true);
    expect(isValidPhoneInput("123")).toBe(false);
  });

  it("normalizes URLs and supports bare domains", () => {
    expect(normalizeUrlInput("example.com")).toBe("https://example.com");
    expect(isValidUrlInput("example.com")).toBe(true);
    expect(isValidUrlInput("notaurl")).toBe(false);
  });

  it("normalizes slugs and whitespace", () => {
    expect(normalizeSlugInput(" My Company_Name ")).toBe("my-company-name");
    expect(isValidSlugInput("my-company-name")).toBe(true);
    expect(normalizeWhitespace("  Dr.   Jane   Doe  ")).toBe("Dr. Jane Doe");
  });
});
