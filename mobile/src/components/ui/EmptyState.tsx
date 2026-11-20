import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { space } from "../../theme";
import { AppText } from "./AppText";

/** A short sentence for an empty list, with the action that fills it. */
export function EmptyState({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <View style={styles.root}>
      <AppText variant="body" tone="muted" style={styles.message}>
        {message}
      </AppText>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    gap: space.md,
    paddingVertical: space.xl,
    paddingHorizontal: space.lg,
  },
  message: {
    textAlign: "center",
  },
});
