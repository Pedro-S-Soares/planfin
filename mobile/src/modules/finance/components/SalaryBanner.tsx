import { StyleSheet, View } from "react-native";
import { AppText } from "../../../components/ui/AppText";
import { Button } from "../../../components/ui/Button";
import { useCurrency } from "../../../context/CurrencyContext";
import { useRegisterSalaryMutation } from "../../../graphql/__generated__/hooks";
import { confirm } from "../../../lib/alert";
import { palette, radius, space } from "../../../theme";
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
    <View style={styles.banner}>
      <AppText variant="label" tone="accent">
        Salário de {formatShortDate(date)} ainda não registrado
      </AppText>
      <AppText variant="caption">Quando cair na conta, registre para o saldo ficar certo.</AppText>
      <Button
        label={`Registrar ${formatMoney(amount, currency.symbol)}`}
        size="sm"
        isFullWidth={false}
        isLoading={loading}
        style={styles.action}
        onPress={handleRegister}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: palette.accentSoft,
    borderRadius: radius.control,
    padding: space.md,
    marginTop: space.md,
  },
  action: {
    alignSelf: "flex-start",
    marginTop: space.sm,
  },
});
