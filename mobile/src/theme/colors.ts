/**
 * "Extrato da casa" palette (docs/ux-audit/README.md): the app as a well-printed bank
 * statement. One strong color (accent) for actions; expenses stay in ink, only income
 * gets a color and a "+" sign.
 *
 * Contrast (WCAG 2.1, checked with the relative-luminance formula):
 *   ink      15.7:1 on paper · 17.0:1 on sheet
 *   muted     5.0:1 on paper ·  5.4:1 on sheet · 4.6:1 on accentSoft
 *   accent    6.6:1 on paper ·  7.2:1 on sheet · white text on accent 7.2:1
 *   income    4.6:1 on paper ·  5.0:1 on sheet
 *   danger    5.0:1 on paper ·  5.4:1 on sheet · 4.6:1 on dangerSoft
 *   income    4.6:1 on incomeSoft · warning 5.9:1 on warningSoft
 * Every text color passes AA (4.5:1) on both backgrounds. Keep it that way when adding one.
 */
export const palette = {
  /** Main text and amounts. */
  ink: "#1C1A2E",
  /** Screen background. */
  paper: "#F6F5FA",
  /** Blocks, sheets, fields. */
  sheet: "#FFFFFF",
  /** 1px dividers and field borders. */
  rule: "#E4E1EE",
  /** Secondary text. */
  muted: "#6A6785",
  /** Primary button, links, selection. */
  accent: "#4B3FD1",
  /** Selected chip and secondary button background. */
  accentSoft: "#ECEAFC",
  /** Incoming money (the amount only; never a green card). */
  income: "#0E7F57",
  /** Delete, over the limit, negative balance. */
  danger: "#C2372C",
  /** Background behind an income/ok status label. */
  incomeSoft: "#EEF8F3",
  /** Background behind a danger status label or warning box. */
  dangerSoft: "#FBE9E7",
  /** Attention without alarm (closed invoice, partial payment). */
  warning: "#8F4C00",
  warningSoft: "#FFF1DE",
  /** Dimmed screen behind a sheet. */
  backdrop: "rgba(28,26,46,0.45)",
  /** Text on accent. */
  onAccent: "#FFFFFF",
} as const;

export type PaletteColor = keyof typeof palette;

/** A category color at 12% for the row icon background. */
export function tint(hex: string, alpha = 0.12): string {
  const value = hex.replace("#", "");
  if (value.length !== 6) return palette.paper;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16));
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Category hues (icon and its 12% tile), by category name; unknown names get a neutral gray. */
export const CATEGORY_COLORS: Record<string, string> = {
  Alimentação: "#F97316",
  Transporte: "#0EA5E9",
  Lazer: "#A855F7",
  Saúde: "#10B981",
  Compras: "#EC4899",
};

export function categoryColor(name: string): { dot: string; bg: string } {
  const dot = CATEGORY_COLORS[name] ?? "#94A3B8";
  return { dot, bg: tint(dot) };
}
