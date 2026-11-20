import { Pressable, StyleSheet } from "react-native";
import { space } from "../../theme";
import { AppText } from "./AppText";
import { Icon } from "./Icon";

/** "‹ Voltar" inside a screen that has no navigation header (auth and onboarding steps). */
export function BackLink({ onPress, label = "Voltar" }: { onPress: () => void; label?: string }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} hitSlop={8} style={styles.link}>
      <Icon name="chevron-left" size={20} tone="accent" />
      <AppText variant="label" tone="accent">{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 2,
    marginBottom: space.lg,
  },
});
