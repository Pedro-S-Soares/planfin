import { Pressable, StyleSheet, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { isIconName } from "./icons/curated-icons";
import { palette, radius, space } from "../../theme";
import { AppText } from "./AppText";

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  dot?: string;
  // MaterialCommunityIcons glyph name; takes priority over `dot` when valid.
  icon?: string | null;
  /** "radio" in a single-choice list (default), "tab" in a ChipGroup. */
  accessibilityRole?: "radio" | "tab";
}

/** A short single choice (Gasto/Receita, an account, a category): 36 high, fully rounded. */
export function Chip({ label, selected = false, onPress, dot, icon, accessibilityRole = "radio" }: ChipProps) {
  return (
    <Pressable
      accessibilityRole={accessibilityRole}
      aria-checked={accessibilityRole === "radio" ? selected : undefined}
      aria-selected={accessibilityRole === "tab" ? selected : undefined}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, selected ? styles.selected : null, pressed ? styles.pressed : null]}
    >
      {isIconName(icon) ? (
        <MaterialCommunityIcons name={icon} size={16} color={dot ?? palette.muted} />
      ) : dot ? (
        <View style={[styles.dot, { backgroundColor: dot }]} />
      ) : null}
      <AppText variant={selected ? "label" : "body"} tone={selected ? "accent" : "ink"} numberOfLines={1}>
        {label}
      </AppText>
    </Pressable>
  );
}

interface ChipGroupOption<T extends string> {
  value: T;
  label: string;
}

interface ChipGroupProps<T extends string> {
  options: ChipGroupOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** A pair (or trio) of chips acting as one switch, e.g. Diário/Total or Gasto/Receita. */
export function ChipGroup<T extends string>({ options, value, onChange }: ChipGroupProps<T>) {
  return (
    <View accessibilityRole="tablist" style={styles.group}>
      {options.map((option) => (
        <Chip
          key={option.value}
          label={option.label}
          selected={option.value === value}
          accessibilityRole="tab"
          onPress={() => onChange(option.value)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: palette.rule,
    backgroundColor: palette.sheet,
  },
  selected: {
    borderColor: palette.accent,
    backgroundColor: palette.accentSoft,
  },
  pressed: {
    opacity: 0.75,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
  group: {
    flexDirection: "row",
    gap: space.sm,
  },
});
