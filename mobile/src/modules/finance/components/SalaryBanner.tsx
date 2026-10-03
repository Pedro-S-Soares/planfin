import { Text, TouchableOpacity, View } from "react-native";
import { useCurrency } from "../../../context/CurrencyContext";
import { useRegisterSalaryMutation } from "../../../graphql/__generated__/hooks";
import { confirm } from "../../../lib/alert";
import { Colors, Radius } from "../../../theme/tokens";
import { formatMoney, formatShortDate } from "../format";

type SalaryBannerProps = {
  amount: string | null | undefined;
  date: string;
};

/** Shown in the first days of a cycle while its salary was not registered. */
export function SalaryBanner({ amount, date }: SalaryBannerProps) {
  const { currency } = useCurrency();
  const [registerSalary, { loading }] = useRegisterSalaryMutation({
    refetchQueries: ["FinancePanel", "FinancialAccounts", "AccountMovements"],
    onError: () => undefined, // o toast global avisa o erro
  });

  const handleRegister = () =>
    confirm(
      {
        title: "Registrar salário",
        message: `Lançar ${formatMoney(amount, currency.symbol)} em ${formatShortDate(date)} na conta do salário? Se o valor veio diferente, edite depois no histórico.`,
        confirmLabel: "Registrar",
      },
      () => registerSalary({ variables: { date } }),
    );

  return (
    <View style={{ backgroundColor: Colors.primaryLight, borderRadius: Radius.md, padding: 12, marginTop: 12 }}>
      <Text style={{ fontSize: 13, color: Colors.primaryText, fontWeight: "700" }}>
        Salário de {formatShortDate(date)} ainda não registrado
      </Text>
      <Text style={{ fontSize: 12, color: Colors.textSec, marginTop: 2 }}>Quando cair na conta, registre para o saldo ficar certo.</Text>
      <TouchableOpacity
        onPress={handleRegister}
        disabled={loading}
        activeOpacity={0.8}
        style={{ alignSelf: "flex-start", marginTop: 8, backgroundColor: Colors.primary, borderRadius: Radius.full, paddingHorizontal: 14, paddingVertical: 7 }}
      >
        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>
          {loading ? "Registrando…" : `Registrar ${formatMoney(amount, currency.symbol)}`}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
