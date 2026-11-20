import { StyleSheet, View } from "react-native";
import { space } from "../../theme";
import { AppText } from "./AppText";
import { IconButton } from "./IconButton";

interface MonthStepperProps {
  label: string;
  onPrevious: () => void;
  onNext: () => void;
  /** "title": the month a whole screen is about. "inline": a month inside a form. */
  size?: "title" | "inline";
}

/** ‹ Nov/2026 › — moves a month back or forward. */
export function MonthStepper({ label, onPrevious, onNext, size = "inline" }: MonthStepperProps) {
  return (
    <View style={[styles.row, size === "title" ? styles.title : null]}>
      <IconButton icon="chevron-left" accessibilityLabel="Mês anterior" onPress={onPrevious} />
      <AppText variant={size === "title" ? "title" : "label"} tone={size === "title" ? "ink" : "accent"} style={styles.label}>
        {label}
      </AppText>
      <IconButton icon="chevron-right" accessibilityLabel="Próximo mês" onPress={onNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
  },
  title: {
    justifyContent: "space-between",
    marginBottom: space.md,
  },
  label: {
    minWidth: 72,
    textAlign: "center",
  },
});
