import { Pressable, StyleSheet, Switch, View } from "react-native";
import { AppText } from "../../../components/ui/AppText";
import { palette, radius, space } from "../../../theme";

type ToggleRowProps = {
  title: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

/** An on/off option with one line explaining it; the switch alone shows the state. */
export function ToggleRow({ title, description, value, onChange }: ToggleRowProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      aria-checked={value}
      onPress={() => onChange(!value)}
      style={({ pressed }) => [styles.row, pressed ? styles.pressed : null]}
    >
      <View style={styles.texts}>
        <AppText variant="label">{title}</AppText>
        <AppText variant="caption">{description}</AppText>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: palette.rule, true: palette.accent }}
        thumbColor={palette.sheet}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.md,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: palette.rule,
    backgroundColor: palette.sheet,
    paddingHorizontal: space.md + 2,
    paddingVertical: space.md,
    marginBottom: space.lg,
  },
  pressed: {
    backgroundColor: palette.paper,
  },
  texts: {
    flex: 1,
  },
});
