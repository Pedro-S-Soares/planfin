import {
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/manrope";

/**
 * Native: loads the four Manrope weights with expo-font. True once they are ready, or
 * once loading failed (the text then falls back to the system font).
 */
export function useThemeFonts(): boolean {
  const [isLoaded, error] = useFonts({
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });
  return isLoaded || error !== null;
}
