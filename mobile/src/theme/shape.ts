import type { ViewStyle } from "react-native";
import { palette } from "./colors";

/** 8 fields and buttons, 12 blocks, 20 only the top of a sheet, full only chips. */
export const radius = {
  control: 8,
  block: 12,
  sheet: 20,
  full: 9999,
} as const;

/** Blocks have no shadow (the rule and the paper background already separate them). */
export const shadow = {
  /** The bottom sheet, lifted over the dimmed screen. */
  sheet: {
    shadowColor: palette.ink,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  /** The floating action button. */
  floating: {
    shadowColor: palette.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 6,
  },
} satisfies Record<string, ViewStyle>;

export const hairline = 1;
