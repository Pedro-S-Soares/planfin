import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { AppText } from "../../../components/ui/AppText";
import { IconTile } from "../../../components/ui/IconTile";
import { ListBlock } from "../../../components/ui/Block";
import { ListRow } from "../../../components/ui/ListRow";
import { MoneyText } from "../../../components/ui/MoneyText";
import { palette } from "../../../theme";
import { formatShortDate } from "../format";
import type { FinancePanelQuery } from "../../../graphql/__generated__/hooks";

type Commitment = NonNullable<NonNullable<NonNullable<FinancePanelQuery["financePanel"]>["commitments"]>[number]>;

type CommitmentListProps = {
  items: Commitment[];
  onOpenInvoice: (cardId: string, month: string) => void;
  onOpenBills: (month: string) => void;
};

const STATUS_NOTE: Record<string, string> = {
  overdue: "vencida",
  open: "ainda aberta",
  partial: "paga em parte",
};

/** What has to be paid before the next money comes in: invoices and bills. */
export function CommitmentList({ items, onOpenInvoice, onOpenBills }: CommitmentListProps) {
  if (items.length === 0) {
    return <AppText variant="body" tone="muted">Nada a pagar até o próximo dinheiro entrar.</AppText>;
  }

  return (
    <ListBlock>
      {items.map((c) => {
        const note = c.status ? STATUS_NOTE[c.status] : undefined;
        const handlePress = () =>
          c.kind === "invoice" && c.cardId ? onOpenInvoice(c.cardId, c.month ?? "") : onOpenBills(c.month ?? "");
        return (
          <ListRow
            key={`${c.kind}-${c.cardId ?? c.billId}-${c.month}`}
            onPress={handlePress}
            leading={
              <IconTile background={palette.paper}>
                <MaterialCommunityIcons
                  name={c.kind === "invoice" ? "credit-card-outline" : "receipt-text-outline"}
                  size={18}
                  color={palette.muted}
                />
              </IconTile>
            }
            title={c.label ?? ""}
            detail={`Vence ${formatShortDate(c.dueDate)}${note ? ` · ${note}` : ""}`}
            trailing={<MoneyText amount={c.amount} variant="value" tone={c.status === "overdue" ? "danger" : undefined} />}
          />
        );
      })}
    </ListBlock>
  );
}
