import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { formatWeekdayDate } from "../../lib/date";
import type { MoneySign } from "../../lib/money";
import { space } from "../../theme";
import { AppText } from "./AppText";
import { IconButton } from "./IconButton";
import { MoneyText } from "./MoneyText";

interface SectionHeaderProps {
  title: string;
  /** Right side: a total, an action. */
  trailing?: ReactNode;
}

/** The line above a block (outside it): title at the left in 14/600, extras at the right. */
export function SectionHeader({ title, trailing }: SectionHeaderProps) {
  return (
    <View style={styles.header}>
      <AppText variant="label" style={styles.title} numberOfLines={1}>
        {title}
      </AppText>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </View>
  );
}

interface DayHeaderProps {
  /** ISO date of the day ("2026-11-05" → "qua, 05/11", as on the bank statement). */
  date: string;
  /** The day's total; omitted when it would only repeat a single row. */
  total?: number | null;
  totalSign?: MoneySign;
  /** Green when money came in, as in the history; off where the sign means something else (an invoice credit). */
  isTotalColored?: boolean;
  /** "+" to add an entry on this day. */
  onAdd?: () => void;
}

/** Header of a day block in a statement list: date, total of the day, "+" to add on it. */
export function DayHeader({ date, total, totalSign = "flow", isTotalColored = true, onAdd }: DayHeaderProps) {
  return (
    <SectionHeader
      title={formatWeekdayDate(date)}
      trailing={
        <>
          {total != null ? (
            <MoneyText amount={total} sign={totalSign} variant="body" tone="muted" isColoredBySign={isTotalColored} />
          ) : null}
          {onAdd ? <IconButton icon="plus" accessibilityLabel="Lançar neste dia" onPress={onAdd} /> : null}
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.md,
    paddingHorizontal: space.xs,
    marginBottom: space.sm,
  },
  title: {
    flexShrink: 1,
  },
  trailing: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
  },
});
