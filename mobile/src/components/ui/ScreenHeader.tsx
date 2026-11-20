import type { ReactNode } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { layout, palette, space } from "../../theme";
import { AppText } from "./AppText";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string | null;
  /** The screen's main action at the right (e.g. "Lançar"). */
  action?: ReactNode;
}

/** Top of a tab screen: title 20/700, an optional muted line, one action. */
export function ScreenHeader({ title, subtitle, action }: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.texts}>
        <AppText variant="title" accessibilityRole="header" numberOfLines={1}>
          {title}
        </AppText>
        {subtitle ? <AppText variant="caption">{subtitle}</AppText> : null}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.md,
    backgroundColor: palette.sheet,
    paddingTop: Platform.OS === "ios" ? 58 : space.xl,
    paddingBottom: space.md,
    paddingHorizontal: layout.gutter,
    borderBottomWidth: 1,
    borderBottomColor: palette.rule,
  },
  texts: {
    flexShrink: 1,
  },
});
