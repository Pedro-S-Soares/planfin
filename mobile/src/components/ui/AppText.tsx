import { Text, type TextProps } from "react-native";
import { palette, tabularNums, textVariants, type PaletteColor, type TextVariant } from "../../theme";

export interface AppTextProps extends TextProps {
  /** Step of the type scale; sets size, weight, line height and the default color. */
  variant?: TextVariant;
  /** Overrides the variant's color with a palette color. */
  tone?: PaletteColor;
  /** Digits of equal width (amounts, dates in a column). */
  isTabular?: boolean;
}

/** Text in Manrope on the theme's type scale. Every new screen text goes through it. */
export function AppText({ variant = "body", tone, isTabular = false, style, ...rest }: AppTextProps) {
  return (
    <Text
      style={[textVariants[variant], tone ? { color: palette[tone] } : null, isTabular ? tabularNums : null, style]}
      {...rest}
    />
  );
}
