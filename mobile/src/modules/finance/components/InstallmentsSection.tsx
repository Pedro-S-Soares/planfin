import { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { CurrencyInput } from "../../../components/CurrencyInput";
import { Btn } from "../../../components/ui/Btn";
import { useCurrency } from "../../../context/CurrencyContext";
import { useAnticipateInstallmentsMutation, useInstallmentsQuery } from "../../../graphql/__generated__/hooks";
import { displayToAPI, formatCents, parseCents } from "../../../lib/currency";
import { formatDateBR } from "../../../lib/date";
import { Colors, Radius } from "../../../theme/tokens";
import { formatMoney, toNumber } from "../format";

type InstallmentsSectionProps = {
  expenseId: string;
  /** Called after the anticipation is recorded. */
  onAnticipated: () => void;
};

/** Parcels of the purchase and the option to anticipate the ones after this parcel. */
export function InstallmentsSection({ expenseId, onAnticipated }: InstallmentsSectionProps) {
  const { currency } = useCurrency();
  const money = (v: number | string | null | undefined) => formatMoney(v, currency.symbol);
  const { data, loading } = useInstallmentsQuery({ variables: { expenseId }, fetchPolicy: "network-only" });
  const [anticipating, setAnticipating] = useState(false);
  const [amount, setAmount] = useState<string | null>(null);
  const [anticipate, { loading: saving }] = useAnticipateInstallmentsMutation({
    refetchQueries: ["Installments", "Invoices", "Invoice", "ExpenseHistoryWithAuthors", "FinancePanel", "SalaryProjection"],
    onCompleted: onAnticipated,
    onError: () => undefined, // o toast global avisa o erro
  });

  if (loading && !data) return <ActivityIndicator color={Colors.primary} style={{ marginVertical: 12 }} />;

  const parcels = data?.installments?.filter((p) => p !== null) ?? [];
  const current = parcels.find((p) => p.id === expenseId);
  const number = current?.installmentNumber ?? null;
  const later = number === null ? [] : parcels.filter((p) => (p.installmentNumber ?? 0) > number);
  const laterSum = later.reduce((acc, p) => acc + toNumber(p.amount), 0);
  const draft = amount ?? formatCents(Math.round(laterSum * 100));
  const count = current?.installmentCount ?? parcels[0]?.installmentCount ?? 0;

  return (
    <View style={{ backgroundColor: Colors.bg, borderRadius: Radius.md, padding: 14, marginBottom: 16 }}>
      <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.textSec, letterSpacing: 0.7 }}>
        COMPRA PARCELADA{number !== null ? ` · PARCELA ${number}/${count}` : ""}
      </Text>
      <View style={{ marginTop: 8 }}>
        {parcels.map((p) => (
          <View key={p.id ?? ""} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 }}>
            <Text style={{ fontSize: 13, color: p.id === expenseId ? Colors.primaryText : Colors.textSec, fontWeight: p.id === expenseId ? "700" : "400" }}>
              {p.installmentNumber ? `${p.installmentNumber}/${p.installmentCount}` : "Antecipação"} · {p.date ? formatDateBR(p.date) : ""}
            </Text>
            <Text style={{ fontSize: 13, color: Colors.text, fontWeight: "600" }}>{money(p.amount)}</Text>
          </View>
        ))}
      </View>

      {later.length > 0 ? (
        anticipating ? (
          <View style={{ marginTop: 12 }}>
            <Text style={{ fontSize: 13, color: Colors.text, marginBottom: 8, lineHeight: 18 }}>
              As parcelas {number! + 1} a {count} viram um único lançamento na mesma fatura desta parcela. Se o banco deu
              desconto, ajuste o valor cobrado.
            </Text>
            <CurrencyInput value={draft} onChange={setAmount} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Btn
                  label="Antecipar"
                  size="sm"
                  loading={saving}
                  disabled={parseCents(draft) === 0}
                  onPress={() => anticipate({ variables: { expenseId, amount: displayToAPI(draft) } })}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Btn label="Cancelar" size="sm" variant="ghost" onPress={() => setAnticipating(false)} />
              </View>
            </View>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setAnticipating(true)} activeOpacity={0.75} style={{ marginTop: 10 }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: Colors.primaryText }}>
              Antecipar parcelas {number! + 1} a {count} ({money(laterSum)}) ›
            </Text>
          </TouchableOpacity>
        )
      ) : null}
    </View>
  );
}
