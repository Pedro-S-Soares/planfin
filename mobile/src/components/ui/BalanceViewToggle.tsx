import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors, Radius } from "../../theme/tokens";

export type BalanceView = "daily" | "total";

const OPTIONS: { value: BalanceView; label: string }[] = [
  { value: "daily", label: "Diário" },
  { value: "total", label: "Total" },
];

interface BalanceViewToggleProps {
  value: BalanceView;
  onChange: (value: BalanceView) => void;
}

export function BalanceViewToggle({ value, onChange }: BalanceViewToggleProps) {
  return (
    <View style={styles.container} accessibilityRole="tablist">
      {OPTIONS.map((option) => {
        const isSelected = option.value === value;
        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => onChange(option.value)}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            style={[styles.option, isSelected && styles.optionSelected]}
          >
            <Text style={[styles.label, isSelected && styles.labelSelected]}>{option.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.full,
    padding: 3,
    marginBottom: 12,
  },
  option: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: Radius.full,
    alignItems: "center",
  },
  optionSelected: {
    backgroundColor: Colors.primaryLight,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSec,
  },
  labelSelected: {
    color: Colors.primary,
    fontWeight: "700",
  },
});
