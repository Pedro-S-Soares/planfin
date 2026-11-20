import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { layout, palette, space } from "../../theme";
import { AppText } from "./AppText";

interface ListRowProps {
  /** 32px leading visual (an icon on a tinted square). */
  leading?: ReactNode;
  title: string;
  /** One muted line under the title: "Banco Azul · 2/10 · Feira". */
  detail?: string | null;
  /** A second muted line, for a note the user needs to notice ("Fora do orçamento do dia"). */
  footnote?: string | null;
  /** Right side, usually a MoneyText. */
  trailing?: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
}

/**
 * A statement line: title on one line (with ellipsis), detail below in muted 12,
 * amount aligned right. Separators come from the ListBlock around it.
 */
export function ListRow({ leading, title, detail, footnote, trailing, onPress, accessibilityLabel }: ListRowProps) {
  const content = (
    <>
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <View style={styles.texts}>
        <AppText variant="label" numberOfLines={1}>
          {title}
        </AppText>
        {detail ? (
          <AppText variant="caption" numberOfLines={1}>
            {detail}
          </AppText>
        ) : null}
        {footnote ? (
          <AppText variant="caption" numberOfLines={1}>
            {footnote}
          </AppText>
        ) : null}
      </View>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </>
  );

  if (!onPress) return <View style={styles.row}>{content}</View>;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed ? styles.pressed : null]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: layout.rowHeight,
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingHorizontal: layout.blockPadding,
    paddingVertical: space.sm,
    backgroundColor: palette.sheet,
  },
  pressed: {
    backgroundColor: palette.paper,
  },
  leading: {
    flexShrink: 0,
  },
  texts: {
    flex: 1,
    minWidth: 0,
  },
  trailing: {
    flexShrink: 0,
    alignItems: "flex-end",
  },
});
