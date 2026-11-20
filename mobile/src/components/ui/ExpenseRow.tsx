import { palette, tint } from "../../theme";
import { categoryColor } from "../../theme/tokens";
import { subcategoryLabel } from "../../lib/category-label";
import { useCurrency } from "../../context/CurrencyContext";
import { formatMoney, toNumber } from "../../lib/money";
import { isRecurringEntry } from "../../modules/history/history-filters";
import { CategoryIcon } from "./CategoryIcon";
import { IconTile } from "./IconTile";
import { ListRow } from "./ListRow";
import { MoneyText } from "./MoneyText";

interface ExpenseItem {
  id: string;
  amount: string;
  type?: string | null;
  subcategory?: {
    name?: string | null;
    category?: { name?: string | null; icon?: string | null } | null;
  } | null;
  note?: string | null;
  createdBy?: { id?: string | null; email?: string | null } | null;
  countsInBudget?: boolean | null;
  source?: string | null;
  installmentNumber?: number | null;
  installmentCount?: number | null;
  account?: { name?: string | null; kind?: string | null } | null;
}

interface ExpenseRowProps {
  item: ExpenseItem;
  onPress?: () => void;
  authorLabel?: string | null;
}

/** One entry of a statement list: category icon, title, "Receita · Banco Azul · 2/10 · Feira", amount. */
export function ExpenseRow({ item, onPress, authorLabel }: ExpenseRowProps) {
  const { currency } = useCurrency();
  const colorKey = item.subcategory?.category?.name ?? item.subcategory?.name ?? "";
  const iconColor = item.type === "income" ? palette.income : categoryColor(colorKey).dot;
  const isIncome = item.type === "income";
  // A paid planned item (fixed or one-off) shows its name (the bill's name is stored as the note).
  const isBillEntry = (item.source === "bill" || item.source === "one_off_bill") && Boolean(item.note);
  const title = item.source === "invoice_adjustment"
    ? "Ajuste da fatura"
    : isBillEntry ? item.note ?? "" : subcategoryLabel(item.subcategory, isIncome ? "Receita" : "Sem categoria");
  // Former pills (Receita, Recorrente) are plain words of the detail line, like on a bank statement.
  const detail = [
    isIncome && title !== "Receita" ? "Receita" : null,
    isRecurringEntry({ source: item.source ?? null }) ? "Recorrente" : null,
    item.account?.name,
    item.installmentCount ? `${item.installmentNumber}/${item.installmentCount}` : null,
    isBillEntry ? subcategoryLabel(item.subcategory, "") : item.note,
    authorLabel,
  ].filter(Boolean).join(" · ");
  const signedAmount = isIncome ? toNumber(item.amount) : -toNumber(item.amount);

  return (
    <ListRow
      onPress={onPress}
      accessibilityLabel={[title, detail, formatMoney(signedAmount, currency.symbol, { sign: "flow" })].filter(Boolean).join(", ")}
      leading={
        <IconTile background={tint(iconColor)}>
          <CategoryIcon icon={item.subcategory?.category?.icon} name={colorKey} size={18} color={iconColor} />
        </IconTile>
      }
      title={title}
      detail={detail}
      footnote={item.countsInBudget === false ? "Fora do orçamento do dia" : null}
      trailing={<MoneyText amount={signedAmount} sign="flow" variant="value" isColoredBySign />}
    />
  );
}
