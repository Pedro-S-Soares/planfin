import { StyleSheet } from "react-native";
import { AppText } from "../../../components/ui/AppText";
import { space } from "../../../theme";

/** Field label in sentence case (no spaced capitals), as in the "extrato da casa" direction. */
export function FormLabel({ children }: { children: string }) {
  return (
    <AppText variant="label" tone="muted" style={styles.label}>
      {children}
    </AppText>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: space.sm,
  },
});
