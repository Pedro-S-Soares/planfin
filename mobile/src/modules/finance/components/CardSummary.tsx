import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { Block } from "../../../components/ui/Block";
import { InlineError } from "../../../components/ui/InlineError";
import { useCurrency } from "../../../context/CurrencyContext";
import { useInvoicesQuery } from "../../../graphql/__generated__/hooks";
import { toISODate } from "../../../lib/date";
import { formatMoney, formatMonth, formatShortDate, isInvoiceStatus, toNumber } from "../format";
import type { FinancialAccount } from "../use-financial-accounts";
import { StatusPill } from "./StatusPill";
import { palette, radius } from "../../../theme";
import { Text } from "../../../components/ui/Text";
import { Icon } from "../../../components/ui/Icon";
import { IconTile } from "../../../components/ui/IconTile";
import { Button } from "../../../components/ui/Button";

/** Statuses of an invoice that is closed and still owed. */
const PAYABLE = ["closed", "partial", "overdue"];

type CardSummaryProps = {
  card: FinancialAccount;
  onOpen: () => void;
  onOpenInvoice: (month: string) => void;
  onPay: (month: string, remaining: string) => void;
};

export function CardSummary({ card, onOpen, onOpenInvoice, onPay }: CardSummaryProps) {
  const { currency } = useCurrency();
  const { data, loading, error, refetch } = useInvoicesQuery({
    variables: { cardId: card.id, today: toISODate(new Date()), past: 1 },
    fetchPolicy: "cache-and-network",
  });

  const invoices = data?.invoices?.filter((i) => i !== null) ?? [];
  const current = invoices.find((i) => i.status === "open") ?? null;
  const toPay =
    invoices.find((i) => PAYABLE.includes(i.status ?? "") && toNumber(i.remaining) > 0) ?? null;

  return (
    <Block padding={16} style={{ marginBottom: 12 }}>
      <TouchableOpacity onPress={onOpen} activeOpacity={0.8} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <IconTile background={palette.accentSoft}>
          <Icon name="credit-card-outline" size={18} tone="accent" />
        </IconTile>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: "700", color: palette.ink }}>{card.name}</Text>
          <Text style={{ fontSize: 12, color: palette.muted }}>
            Fecha dia {card.closingDay} · vence dia {card.dueDay}
          </Text>
        </View>
        <Text style={{ fontSize: 14, fontWeight: "600", color: palette.accent }}>Faturas</Text>
        <Icon name="chevron-right" tone="accent" />
      </TouchableOpacity>

      {loading && !data ? (
        <ActivityIndicator color={palette.accent} style={{ marginTop: 14 }} />
      ) : error ? (
        <View style={{ marginTop: 12 }}>
          <InlineError onRetry={() => refetch()} />
        </View>
      ) : (
        <View style={{ marginTop: 12, gap: 10 }}>
          {toPay ? (
            <View style={{ backgroundColor: palette.paper, borderRadius: radius.control, padding: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: palette.muted }}>
                  A PAGAR · {formatMonth(toPay.month)}
                </Text>
                {isInvoiceStatus(toPay.status) ? <StatusPill status={toPay.status} /> : null}
              </View>
              <Text style={{ fontSize: 22, fontWeight: "800", color: palette.ink, marginTop: 4 }}>
                {formatMoney(toPay.remaining, currency.symbol)}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                <Text style={{ fontSize: 12, color: palette.muted }}>Vence {formatShortDate(toPay.dueDate)}</Text>
                <Button label="Pagar" size="sm" isFullWidth={false} onPress={() => onPay(toPay.month ?? "", toPay.remaining ?? "0")} />
              </View>
            </View>
          ) : null}
          {current ? (
            <TouchableOpacity onPress={() => onOpenInvoice(current.month ?? "")} activeOpacity={0.8}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: palette.muted }}>
                Fatura aberta · {formatMonth(current.month)}
              </Text>
              <Text style={{ fontSize: 20, fontWeight: "800", color: palette.ink, marginTop: 2 }}>
                {formatMoney(current.total, currency.symbol)}
              </Text>
              <Text style={{ fontSize: 12, color: palette.muted, marginTop: 2 }}>
                Fecha {formatShortDate(current.closingDate)} · vence {formatShortDate(current.dueDate)}
              </Text>
              {toNumber(current.paid) > 0 ? (
                <Text style={{ fontSize: 12, color: palette.income, marginTop: 2 }}>
                  Pago antecipado {formatMoney(current.paid, currency.symbol)} ·{" "}
                  {toNumber(current.remaining) > 0
                    ? `falta ${formatMoney(current.remaining, currency.symbol)}`
                    : "nada a pagar por enquanto"}
                </Text>
              ) : null}
            </TouchableOpacity>
          ) : null}
          {current && toNumber(current.remaining) > 0 ? (
            <TouchableOpacity
              onPress={() => onPay(current.month ?? "", current.remaining ?? "0")}
              activeOpacity={0.8}
              hitSlop={8}
              style={{ alignSelf: "flex-start" }}
            >
              <Text style={{ fontSize: 13, fontWeight: "700", color: palette.accent }}>Pagar antecipado</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}
    </Block>
  );
}
