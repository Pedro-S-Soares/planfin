import { palette } from "../../../theme";

/** Chart-only roles layered on the app tokens. Text always uses text tokens, never series colours. */
export const ChartColors = {
  grid: "#ECEBF4",
  track: "#F3F2F9",
  axisText: palette.muted,
  reference: "#8A88A6",
  referenceLight: palette.muted,
  series: palette.accent,
  seriesText: palette.accent,
  under: "#9C93F0",
  over: "#D0301F",
  overText: "#B42318",
  hover: palette.accentSoft,
  tooltipBg: palette.ink,
  tooltipMuted: "#C9C7E0",
  tooltipBad: "#FF9B8F",
  tooltipGood: "#7FE0B5",
  /** Sequential ramp for the calendar, empty → heavy */
  ramp: ["#ECEBF4", "#D9D5FB", "#A99FF3", "#7467EC", "#3A2DB0"],
  /** Member tones, darkest first */
  members: ["#4535CC", "#9C93F0", "#C9C4F7", "#6B6987"],
} as const;

export const AxisTextStyle = {
  position: "absolute",
  fontSize: 11,
  color: ChartColors.axisText,
} as const;
