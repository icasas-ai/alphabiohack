"use client";

import { useEffect } from "react";
import type { CSSProperties } from "react";

type ThemeStyleBridgeProps = {
  style?: CSSProperties;
};

export function ThemeStyleBridge({ style }: ThemeStyleBridgeProps) {
  useEffect(() => {
    if (!style) {
      return;
    }

    const rootStyle = document.documentElement.style;
    const styleEntries = Object.entries(style).filter(
      (entry): entry is [string, string | number] => entry[1] !== undefined,
    );
    const previousValues = new Map<string, string>();

    for (const [property, value] of styleEntries) {
      previousValues.set(property, rootStyle.getPropertyValue(property));
      rootStyle.setProperty(property, String(value));
    }

    return () => {
      for (const [property] of styleEntries) {
        const previousValue = previousValues.get(property);

        if (previousValue) {
          rootStyle.setProperty(property, previousValue);
        } else {
          rootStyle.removeProperty(property);
        }
      }
    };
  }, [style]);

  return null;
}
