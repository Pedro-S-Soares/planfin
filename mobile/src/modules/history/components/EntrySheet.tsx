import { StyleSheet, View } from "react-native";
import { ChipGroup } from "../../../components/ui/Chip";
import { Sheet } from "../../../components/ui/Sheet";
import { AddExpenseForm } from "../../../screens/AddExpenseScreen";
import { AddIncomeForm } from "../../../screens/AddIncomeScreen";
import { EditExpenseForm } from "../../../screens/EditExpenseScreen";
import { EditIncomeForm } from "../../../screens/EditIncomeScreen";
import { layout, space } from "../../../theme";
import type { EntrySheetState, EntryType } from "../entry-sheet";

interface EntrySheetProps {
  state: EntrySheetState;
  onTypeChange: (type: EntryType) => void;
  onClose: () => void;
}

const TYPE_OPTIONS: { value: EntryType; label: string }[] = [
  { value: "expense", label: "Gasto" },
  { value: "income", label: "Receita" },
];

function sheetTitle(state: EntrySheetState) {
  if (state.mode === "edit") return state.type === "income" ? "Editar receita" : "Editar gasto";
  return "Novo lançamento";
}

/**
 * Bottom sheet over a list (history, invoice, Home): creates or edits an entry without
 * leaving it, so the scroll position and the filters stay where they were.
 */
export function EntrySheet({ state, onTypeChange, onClose }: EntrySheetProps) {
  return (
    <Sheet isOpen={state.mode !== "closed"} onClose={onClose} title={sheetTitle(state)}>
      {state.mode === "create" ? (
        <>
          <View style={styles.typeToggle}>
            <ChipGroup options={TYPE_OPTIONS} value={state.type} onChange={onTypeChange} />
          </View>
          {state.type === "income" ? (
            <AddIncomeForm key="income" params={state.params} onDone={onClose} />
          ) : (
            <AddExpenseForm key="expense" params={state.params} onDone={onClose} />
          )}
        </>
      ) : state.mode === "edit" ? (
        state.type === "income" ? (
          <EditIncomeForm entry={state.entry} onDone={onClose} />
        ) : (
          <EditExpenseForm entry={state.entry} onDone={onClose} />
        )
      ) : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  typeToggle: {
    paddingHorizontal: layout.gutter,
    paddingBottom: space.xs,
  },
});
