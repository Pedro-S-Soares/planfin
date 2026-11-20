import { Platform, StyleSheet, Text as NativeText, type TextProps, type TextStyle } from "react-native";
import { font, type FontWeight } from "../../theme";

function themeWeight(weight: TextStyle["fontWeight"]): FontWeight {
  if (weight === "800" || weight === "900" || weight === 800 || weight === 900) return "extrabold";
  if (weight === "700" || weight === "bold" || weight === 700) return "bold";
  if (weight === "600" || weight === 600) return "semibold";
  return "medium";
}

/**
 * Drop-in for react-native's Text that draws in Manrope, keeping whatever size, weight and
 * color the caller sets. New code prefers AppText (the type scale); this one lets older
 * screens share the typeface without rewriting every style.
 */
export function Text({ style, ...rest }: TextProps) {
  const weight = themeWeight(StyleSheet.flatten(style)?.fontWeight);
  // Native: the family already carries the weight, so drop fontWeight to avoid fake bold.
  const nativeFix = Platform.OS === "web" ? null : { fontWeight: undefined };
  return <NativeText style={[font(weight), style, nativeFix]} {...rest} />;
}
