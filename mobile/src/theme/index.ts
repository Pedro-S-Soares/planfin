/**
 * The one theme of the app ("extrato da casa", docs/ux-audit/README.md).
 * Screens and components take colors, type, spacing and shapes from here, never raw values.
 */
import { palette, tint } from "./colors";
import { radius, shadow, hairline } from "./shape";
import { layout, space } from "./spacing";
import { font, tabularNums, textVariants } from "./typography";

export { palette, tint, categoryColor, CATEGORY_COLORS } from "./colors";
export type { PaletteColor } from "./colors";
export { radius, shadow, hairline } from "./shape";
export { layout, space } from "./spacing";
export { font, tabularNums, textVariants } from "./typography";
export type { FontWeight, TextVariant } from "./typography";
export { useThemeFonts } from "./use-theme-fonts";

export const theme = { palette, tint, radius, shadow, hairline, layout, space, font, tabularNums, textVariants } as const;
