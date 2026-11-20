import { useState } from "react";
import { usePeriod } from "../../context/PeriodContext";
import { EntrySheet } from "./components/EntrySheet";
import { CLOSED_SHEET, createEntryState, defaultEntryDate, type EntrySheetState } from "./entry-sheet";

/**
 * The entry sheet behind the tab bar's [+]: the same sheet as the history (Gasto/Receita),
 * opened over whatever tab is on screen, starting today (kept inside the period).
 */
export function useQuickEntry() {
  const { period } = usePeriod();
  const [sheet, setSheet] = useState<EntrySheetState>(CLOSED_SHEET);

  const open = () =>
    setSheet(createEntryState(defaultEntryDate(period?.startDate, period?.endDate), { kind: "all" }));

  const sheetElement = (
    <EntrySheet
      state={sheet}
      onClose={() => setSheet(CLOSED_SHEET)}
      onTypeChange={(type) => setSheet((current) => (current.mode === "create" ? { ...current, type } : current))}
    />
  );

  return { open, sheetElement };
}
