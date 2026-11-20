import { StyleSheet, View } from "react-native";
import { palette } from "../../theme";
import { AppText } from "./AppText";

interface LogoProps {
  size?: number;
}

/** The app mark: a solid accent square with the "P", no gradient. */
export function Logo({ size = 48 }: LogoProps) {
  return (
    <View style={[styles.mark, { width: size, height: size, borderRadius: size * 0.26 }]}>
      <AppText
        variant="hero"
        tone="onAccent"
        style={{ fontSize: size * 0.46, lineHeight: size * 0.56, letterSpacing: 0 }}
      >
        P
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  mark: {
    backgroundColor: palette.accent,
    alignItems: "center",
    justifyContent: "center",
  },
});
