import { Children, Fragment, isValidElement, type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { hairline, layout, palette, radius } from "../../theme";

interface BlockProps {
  children: ReactNode;
  /** Inner padding; rows of a list bring their own, so a list block uses 0. */
  padding?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * A white block on the paper background: radius 12, a hairline border, no shadow.
 * One block per subject (a day, a summary), never one card per number.
 */
export function Block({ children, padding = layout.blockPadding, style }: BlockProps) {
  return <View style={[styles.block, { padding }, style]}>{children}</View>;
}

interface ListBlockProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** A block of rows separated by a 1px rule, with no rule after the last one. */
export function ListBlock({ children, style }: ListBlockProps) {
  const rows = Children.toArray(children).filter(isValidElement);
  return (
    <View style={[styles.block, style]}>
      {rows.map((row, index) => (
        <Fragment key={row.key ?? index}>
          {index > 0 ? <View style={styles.rule} /> : null}
          {row}
        </Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: palette.sheet,
    borderRadius: radius.block,
    borderWidth: hairline,
    borderColor: palette.rule,
    overflow: "hidden",
  },
  rule: {
    height: hairline,
    backgroundColor: palette.rule,
    marginLeft: layout.blockPadding,
  },
});
