import { Platform, type TextStyle } from "react-native";
import { palette } from "./colors";

export type FontWeight = "medium" | "semibold" | "bold" | "extrabold";

const NUMERIC_WEIGHT: Record<FontWeight, TextStyle["fontWeight"]> = {
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
};

// Native: expo-font registers one family per weight (see use-theme-fonts.ts).
const NATIVE_FAMILY: Record<FontWeight, string> = {
  medium: "Manrope_500Medium",
  semibold: "Manrope_600SemiBold",
  bold: "Manrope_700Bold",
  extrabold: "Manrope_800ExtraBold",
};

// Web: Google Fonts serves Manrope as one family with real weights (public/index.html);
// the system stack draws the text until it arrives, or if it never does (offline).
const WEB_FAMILY =
  'Manrope, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

/** Family + weight for one of the four weights the app uses. */
export function font(weight: FontWeight): Pick<TextStyle, "fontFamily" | "fontWeight"> {
  if (Platform.OS === "web") return { fontFamily: WEB_FAMILY, fontWeight: NUMERIC_WEIGHT[weight] };
  // Each native family already is the weight; setting fontWeight too would fake-bold it on Android.
  return { fontFamily: NATIVE_FAMILY[weight] };
}

/** Digits of equal width, so amounts line up in a column like on a statement. */
export const tabularNums: TextStyle = { fontVariant: ["tabular-nums"] };

/**
 * Type scale (px): 12 caption · 14 row text · 16 base and fields · 20 screen title ·
 * 28 highlighted amount · 44 hero number (Home only). Labels in sentence case, never
 * spaced capitals.
 */
export const textVariants = {
  caption: { ...font("medium"), fontSize: 12, lineHeight: 16, color: palette.muted },
  body: { ...font("medium"), fontSize: 14, lineHeight: 20, color: palette.ink },
  label: { ...font("semibold"), fontSize: 14, lineHeight: 20, color: palette.ink },
  base: { ...font("medium"), fontSize: 16, lineHeight: 22, color: palette.ink },
  baseStrong: { ...font("semibold"), fontSize: 16, lineHeight: 22, color: palette.ink },
  /** An amount at the end of a list row. */
  value: { ...font("bold"), fontSize: 16, lineHeight: 22, color: palette.ink, ...tabularNums },
  title: { ...font("bold"), fontSize: 20, lineHeight: 26, color: palette.ink, letterSpacing: -0.2 },
  amount: { ...font("bold"), fontSize: 28, lineHeight: 34, color: palette.ink, letterSpacing: -0.4, ...tabularNums },
  hero: { ...font("extrabold"), fontSize: 44, lineHeight: 52, color: palette.ink, letterSpacing: -1, ...tabularNums },
} satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof textVariants;
