import { StyleSheet, View } from "react-native";
import { AppText } from "../../../components/ui/AppText";
import { Chip } from "../../../components/ui/Chip";
import { useCurrency } from "../../../context/CurrencyContext";
import { useQuotasForQuery } from "../../../graphql/__generated__/hooks";
import { formatMoney } from "../../../lib/money";
import { formatMonth } from "../../finance/format";
import { space } from "../../../theme";
import { FieldLabel } from "./entry-form-parts";

interface QuotaFieldProps {
  /** Purchase date: the quotas shown are those of its invoice (card) or month. */
  date: string;
  /** Chosen quota, null for none. */
  value: string | null;
  onChange: (quotaId: string | null) => void;
  /** The amount of this purchase, already counted in the quota (editing), to show what was left before it. */
  ownAmount?: number;
}

/**
 * "Entra na cota": an optional choice, never guessed from the category. Lists the
 * quotas open for the purchase's invoice with what is left in each; hidden when
 * there is none (and nothing chosen).
 */
export function QuotaField({ date, value, onChange, ownAmount = 0 }: QuotaFieldProps) {
  const { currency } = useCurrency();
  const { data } = useQuotasForQuery({ variables: { date }, fetchPolicy: "cache-and-network", skip: !date });
  const quotas = (data?.quotasFor ?? []).filter((q) => q?.quotaId) as NonNullable<
    NonNullable<typeof data>["quotasFor"]
  >[number][];

  if (quotas.length === 0 && !value) return null;

  const chosen = quotas.find((q) => q?.quotaId === value);
  const leftOf = (q: (typeof quotas)[number]) =>
    parseFloat(q?.remaining ?? "0") + (q?.quotaId === value ? ownAmount : 0);

  return (
    <View>
      <FieldLabel>Entra na cota</FieldLabel>
      <View style={styles.chips}>
        <Chip label="Nenhuma" selected={!value} onPress={() => onChange(null)} />
        {quotas.map((q) => (
          <Chip
            key={q?.quotaId}
            label={`${q?.name} · resta ${formatMoney(leftOf(q), currency.symbol)}`}
            selected={value === q?.quotaId}
            onPress={() => onChange(value === q?.quotaId ? null : q?.quotaId ?? null)}
          />
        ))}
      </View>
      {chosen ? (
        <AppText variant="caption" style={styles.note}>
          Abate da cota {chosen.name} ({formatMonth(chosen.month ?? "")}) e não mexe no limite diário. O que passar
          da cota sai do limite do dia.
        </AppText>
      ) : value ? (
        <AppText variant="caption" style={styles.note}>
          A cota escolhida não vale para esta data. Escolha outra ou Nenhuma.
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
    marginBottom: space.sm,
  },
  note: {
    marginBottom: space.lg,
  },
});
