import { Pressable, StyleSheet, View } from "react-native";
import { Icon } from "../../../components/ui/Icon";
import { palette, radius, shadow } from "../../../theme";

/** The [+] in the middle of the tab bar: opens the entry sheet (Gasto/Receita) over the current tab. */
export function AddTabButton({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.slot}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Lançar gasto ou receita"
        onPress={onPress}
        style={({ pressed }) => [styles.button, pressed ? styles.pressed : null]}
      >
        <Icon name="plus" size={28} tone="onAccent" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  button: {
    width: 52,
    height: 44,
    borderRadius: radius.block,
    backgroundColor: palette.accent,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.floating,
  },
  pressed: {
    opacity: 0.85,
  },
});
