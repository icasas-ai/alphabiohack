import type { CSSProperties } from "react";

import { parseLandingPageConfig } from "@/lib/company/landing-page-config";

type ThemeSurface = "public" | "private";

const LIGHT_FOREGROUND_HEX = "#f8fafc";
const DARK_FOREGROUND_HEX = "#0f172a";

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);

  return { r, g, b };
}

function srgbToLinear(value: number) {
  const normalized = value / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function hexToOklchTriplet(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const linearR = srgbToLinear(r);
  const linearG = srgbToLinear(g);
  const linearB = srgbToLinear(b);

  const l =
    0.4122214708 * linearR +
    0.5363325363 * linearG +
    0.0514459929 * linearB;
  const m =
    0.2119034982 * linearR +
    0.6806995451 * linearG +
    0.1073969566 * linearB;
  const s =
    0.0883024619 * linearR +
    0.2817188376 * linearG +
    0.6299787005 * linearB;

  const lRoot = Math.cbrt(l);
  const mRoot = Math.cbrt(m);
  const sRoot = Math.cbrt(s);

  const okL = 0.2104542553 * lRoot + 0.793617785 * mRoot - 0.0040720468 * sRoot;
  const okA = 1.9779984951 * lRoot - 2.428592205 * mRoot + 0.4505937099 * sRoot;
  const okB = 0.0259040371 * lRoot + 0.7827717662 * mRoot - 0.808675766 * sRoot;

  const chroma = Math.sqrt(okA * okA + okB * okB);
  let hue = (Math.atan2(okB, okA) * 180) / Math.PI;
  if (hue < 0) {
    hue += 360;
  }

  return `${okL.toFixed(3)} ${chroma.toFixed(3)} ${hue.toFixed(1)}`;
}

function getRelativeLuminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const linearR = srgbToLinear(r);
  const linearG = srgbToLinear(g);
  const linearB = srgbToLinear(b);

  return 0.2126 * linearR + 0.7152 * linearG + 0.0722 * linearB;
}

function getReadableForegroundHex(hex: string) {
  return getRelativeLuminance(hex) > 0.48 ? DARK_FOREGROUND_HEX : LIGHT_FOREGROUND_HEX;
}

function getRgbTuple(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return `${r} ${g} ${b}`;
}

export function getCompanyThemeStyle(
  landingPageConfig: unknown,
  surface: ThemeSurface,
): CSSProperties {
  const palette = parseLandingPageConfig(landingPageConfig).theme;
  const primaryForegroundHex = getReadableForegroundHex(palette.primary);
  const accentForegroundHex = getReadableForegroundHex(palette.accent);

  const style: Record<string, string> = {
    "--primary": hexToOklchTriplet(palette.primary),
    "--primary-foreground": hexToOklchTriplet(primaryForegroundHex),
    "--accent": hexToOklchTriplet(palette.accent),
    "--accent-foreground": hexToOklchTriplet(accentForegroundHex),
    "--ring": hexToOklchTriplet(palette.primary),
    "--chart-1": hexToOklchTriplet(palette.primary),
    "--chart-2": hexToOklchTriplet(palette.accent),
    "--interactive-selected-rgb": getRgbTuple(palette.primary),
    "--interactive-selected-strong-rgb": getRgbTuple(palette.primary),
  };

  if (surface === "private") {
    style["--sidebar-primary"] = style["--primary"];
    style["--sidebar-primary-foreground"] = style["--primary-foreground"];
    style["--sidebar-ring"] = style["--ring"];
  }

  return style as CSSProperties;
}
