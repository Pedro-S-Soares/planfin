export const Colors = {
  primary: "#6255EA",
  primaryDark: "#4A3FBB",
  primaryLight: "#EEEDFD",
  primaryText: "#4535CC",
  primaryRing: "rgba(98,85,234,0.18)",
  gradStart: "#5547E0",
  gradEnd: "#7B5CF0",
  fabShadow: "rgba(98,85,234,0.40)",

  success: "#0EAD70",
  successLight: "#E8FBF2",
  successText: "#0A7A50",
  danger: "#E5392B",
  dangerLight: "#FEF0EE",
  dangerGradStart: "#D0301F",
  dangerGradEnd: "#F04840",

  bg: "#F0EFF9",
  surface: "#FFFFFF",
  text: "#17162B",
  textSec: "#6B6987",
  textTer: "#ADABCA",
  border: "#E4E2F0",
};

export const Radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 24,
  full: 9999,
};

export const Shadow = {
  xs: {
    shadowColor: "#5046C8",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  sm: {
    shadowColor: "#5046C8",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: "#5046C8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 14,
    elevation: 4,
  },
  lg: {
    shadowColor: "#5046C8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.13,
    shadowRadius: 32,
    elevation: 8,
  },
};

export const CategoryColors: Record<string, { dot: string; bg: string }> = {
  Alimentação: { dot: "#F97316", bg: "#FFF4ED" },
  Transporte: { dot: "#0EA5E9", bg: "#EFF8FF" },
  Lazer: { dot: "#A855F7", bg: "#F5F0FF" },
  Saúde: { dot: "#10B981", bg: "#ECFCF5" },
  Compras: { dot: "#EC4899", bg: "#FDF0F8" },
};

export function categoryColor(name: string) {
  return CategoryColors[name] ?? { dot: "#94A3B8", bg: "#F1F5F9" };
}
