import type { ReactNode } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { palette, space } from "../../theme";
import { InlineError } from "./InlineError";

interface EditGateProps<T> {
  /** Id of the record to edit, from the route. Absent: the form creates a new one. */
  id?: string | null;
  /** The record with that id, once the query has it. */
  record: T | null | undefined;
  /** The query is still fetching (a cached list may not have the record yet). */
  loading: boolean;
  onRetry?: () => void;
  missingMessage: string;
  /** Renders the form: `null` only when creating, never for a record still loading. */
  children: (record: T | null) => ReactNode;
}

/**
 * Mounts an edit form only once its record is there, so the form starts filled with the
 * saved values. Without it a stale cached list made the form open empty in "new" mode,
 * where saving would create a duplicate.
 */
export function EditGate<T>({ id, record, loading, onRetry, missingMessage, children }: EditGateProps<T>) {
  if (!id) return <>{children(null)}</>;
  if (record) return <>{children(record)}</>;

  return (
    <View style={styles.root}>
      {loading ? <ActivityIndicator color={palette.accent} /> : <InlineError message={missingMessage} onRetry={onRetry} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: space.xl,
    backgroundColor: palette.sheet,
  },
});
