import { Colors } from "../../../theme/tokens";

/** Chart-only roles layered on the app tokens. Text always uses text tokens, never series colours. */
export const ChartColors = {
  grid: "#ECEBF4",
  track: "#F3F2F9",
  axisText: Colors.textSec,
  reference: "#8A88A6",
  referenceLight: Colors.textTer,
  series: Colors.primary,
  seriesText: Colors.primaryText,
  under: "#9C93F0",
  over: "#D0301F",
  overText: "#B42318",
  hover: Colors.primaryLight,
  tooltipBg: Colors.text,
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
