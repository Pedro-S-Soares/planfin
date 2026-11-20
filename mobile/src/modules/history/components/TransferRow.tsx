import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { IconTile } from "../../../components/ui/IconTile";
import { ListRow } from "../../../components/ui/ListRow";
import { MoneyText } from "../../../components/ui/MoneyText";
import { palette } from "../../../theme";
import type { HistoryTransfer } from "../../../graphql/expenses";

interface TransferRowProps {
  transfer: HistoryTransfer;
  /** Seen from one account: positive arrived, negative left. Null: between two of the group's accounts. */
  signedAmount: number | null;
}

const KIND_LABEL: Record<string, string> = {
  card_payment: "Pagamento de fatura",
  allowance: "Mesada",
  reserve: "Reserva",
  other: "Transferência",
};

export function TransferRow({ transfer, signedAmount }: TransferRowProps) {
  const title = transfer.note || KIND_LABEL[transfer.kind ?? "other"] || "Transferência";
  const route = `${transfer.fromAccount?.name ?? "?"} → ${transfer.toAccount?.name ?? "?"}`;

  return (
    <ListRow
      leading={
        <IconTile background={palette.paper}>
          <MaterialCommunityIcons name="swap-horizontal" size={18} color={palette.muted} />
        </IconTile>
      }
      title={title}
      detail={`Transferência · ${route}`}
      trailing={
        signedAmount === null ? (
          <MoneyText amount={transfer.amount} variant="value" tone="muted" />
        ) : (
          <MoneyText amount={signedAmount} sign="flow" variant="value" isColoredBySign />
        )
      }
    />
  );
}
