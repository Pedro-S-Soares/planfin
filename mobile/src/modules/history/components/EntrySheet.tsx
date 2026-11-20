import { Modal, Platform, Pressable, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AddExpenseForm } from "../../../screens/AddExpenseScreen";
import { AddIncomeForm } from "../../../screens/AddIncomeScreen";
import { EditExpenseForm } from "../../../screens/EditExpenseScreen";
import { EditIncomeForm } from "../../../screens/EditIncomeScreen";
import { Colors, Radius, Shadow } from "../../../theme/tokens";
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

function sheetTitle(state: Exclude<EntrySheetState, { mode: "closed" }>) {
  if (state.mode === "edit") return state.type === "income" ? "Editar receita" : "Editar gasto";
  return "Novo lançamento";
}

function TypeToggle({ value, onChange }: { value: EntryType; onChange: (type: EntryType) => void }) {
  return (
    <View
      accessibilityRole="tablist"
      style={{ flexDirection: "row", backgroundColor: Colors.bg, borderRadius: Radius.md, padding: 3, marginHorizontal: 18, marginBottom: 4 }}
    >
      {TYPE_OPTIONS.map((option) => {
        const isSelected = option.value === value;
        return (
          <TouchableOpacity
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onChange(option.value)}
            style={{
              flex: 1,
              alignItems: "center",
              paddingVertical: 8,
              borderRadius: Radius.sm,
              backgroundColor: isSelected ? Colors.surface : "transparent",
              ...(isSelected ? Shadow.xs : {}),
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "700", color: isSelected ? Colors.text : Colors.textSec }}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/**
 * Bottom sheet over the history: creates or edits an entry without leaving the list,
 * so the scroll position and the filters stay where they were.
 */
// On the web the browser scrolls the autofocused amount field "into view" while the sheet
// is still sliding in, leaving the top of the form hidden. A fade keeps the field in place.
const ANIMATION = Platform.OS === "web" ? "fade" : "slide";

export function EntrySheet({ state, onTypeChange, onClose }: EntrySheetProps) {
  const insets = useSafeAreaInsets();
  const isOpen = state.mode !== "closed";

  return (
    <Modal visible={isOpen} transparent animationType={ANIMATION} onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Pressable
          accessibilityLabel="Fechar"
          onPress={onClose}
          style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(23,22,43,0.45)" }}
        />
        {state.mode === "closed" ? null : (
          <View
            style={{
              height: "90%",
              width: "100%",
              maxWidth: 560,
              alignSelf: "center",
              backgroundColor: Colors.surface,
              borderTopLeftRadius: Radius.xl,
              borderTopRightRadius: Radius.xl,
              paddingBottom: insets.bottom,
              overflow: "hidden",
              ...Shadow.lg,
            }}
          >
            <View style={{ alignItems: "center", paddingTop: 8 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border }} />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, paddingTop: 8, paddingBottom: 10 }}>
              <Text style={{ fontSize: 18, fontWeight: "800", color: Colors.text }}>{sheetTitle(state)}</Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Fechar"
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{ width: 32, height: 32, borderRadius: Radius.full, backgroundColor: Colors.bg, alignItems: "center", justifyContent: "center" }}
              >
                <Text style={{ fontSize: 15, fontWeight: "700", color: Colors.textSec }}>✕</Text>
              </TouchableOpacity>
            </View>

            {state.mode === "create" ? (
              <>
                <TypeToggle value={state.type} onChange={onTypeChange} />
                {state.type === "income" ? (
                  <AddIncomeForm key="income" params={state.params} onDone={onClose} />
                ) : (
                  <AddExpenseForm key="expense" params={state.params} onDone={onClose} />
                )}
              </>
            ) : state.type === "income" ? (
              <EditIncomeForm entry={state.entry} onDone={onClose} />
            ) : (
              <EditExpenseForm entry={state.entry} onDone={onClose} />
            )}
          </View>
        )}
      </View>
    </Modal>
  );
}
