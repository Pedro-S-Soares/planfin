import { View, Text, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigation } from "@react-navigation/native";
import { useUpdatePeriodMutation, ActivePeriodDocument } from "../graphql/__generated__/hooks";
import { usePeriod } from "../context/PeriodContext";
import { CurrencyInput } from "../components/CurrencyInput";
import { Btn } from "../components/ui/Btn";
import { displayToAPI, formatCents } from "../lib/currency";
import { Colors } from "../theme/tokens";
import { usePageTitle } from "../hooks/usePageTitle";

function apiToDisplay(apiAmount: string): string {
  const cents = Math.round(parseFloat(apiAmount) * 100);
  return formatCents(cents);
}

function computeMinBudget(dailyLimitDisplay: string, period: { startDate?: string | null; endDate?: string | null }): string {
  const limit = parseFloat(displayToAPI(dailyLimitDisplay) || "0");
  if (!limit || !period.startDate || !period.endDate) return "0,00";
  const start = new Date(period.startDate + "T00:00:00");
  const end = new Date(period.endDate + "T00:00:00");
  const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  const cents = Math.round(limit * days * 100);
  return formatCents(cents);
}

const schema = yup.object({
  dailyLimit: yup
    .string()
    .required("Limite diário é obrigatório")
    .test("not-zero", "Informe um valor maior que zero", (v) => !!v && v !== "0,00"),
  totalBudget: yup
    .string()
    .required("Orçamento total é obrigatório")
    .test("not-zero", "Informe um valor maior que zero", (v) => !!v && v !== "0,00"),
});

type FormValues = yup.InferType<typeof schema>;

export function EditPeriodScreen() {
  usePageTitle("Planfin - Editar período");
  const navigation = useNavigation();
  const { period, refetch } = usePeriod();

  const { control, handleSubmit, watch, setError, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      dailyLimit: period?.dailyLimit ? apiToDisplay(period.dailyLimit) : "0,00",
      totalBudget: period?.totalBudget ? apiToDisplay(period.totalBudget) : "0,00",
    },
  });

  const dailyLimit = watch("dailyLimit");
  const totalBudget = watch("totalBudget");

  const minBudget = computeMinBudget(dailyLimit, { startDate: period?.startDate, endDate: period?.endDate });
  const isBelowMin =
    totalBudget !== "0,00" &&
    parseFloat(displayToAPI(totalBudget) || "0") <
      parseFloat(displayToAPI(minBudget) || "0");

  const [updatePeriod, { loading }] = useUpdatePeriodMutation({
    onCompleted: () => { refetch(); navigation.goBack(); },
    onError: (error) => setError("root", { message: error.message }),
    refetchQueries: [{ query: ActivePeriodDocument }],
  });

  const onSubmit = (values: FormValues) => {
    updatePeriod({
      variables: {
        dailyLimit: displayToAPI(values.dailyLimit),
        totalBudget: displayToAPI(values.totalBudget),
      },
    });
  };

  const periodDays = (() => {
    if (!period?.startDate || !period?.endDate) return null;
    const s = new Date(period.startDate + "T00:00:00");
    const e = new Date(period.endDate + "T00:00:00");
    return Math.max(1, Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  })();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.surface }}
      contentContainerStyle={{ padding: 18, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      {period && (
        <View style={{
          backgroundColor: Colors.primaryLight,
          borderRadius: 12,
          padding: 12,
          marginBottom: 20,
        }}>
          <Text style={{ fontSize: 12, color: Colors.primaryText, fontWeight: "600" }}>
            Período: {period.startDate} → {period.endDate} ({periodDays} dias)
          </Text>
          <Text style={{ fontSize: 11, color: Colors.primaryText, marginTop: 3 }}>
            Editar o limite diário recalcula o saldo disponível de hoje retroativamente.
          </Text>
        </View>
      )}

      <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.textSec, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 7 }}>
        Limite diário
      </Text>
      <Controller
        control={control}
        name="dailyLimit"
        render={({ field: { onChange, value } }) => (
          <CurrencyInput value={value} onChange={onChange} error={errors.dailyLimit?.message} autoFocus />
        )}
      />

      <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.textSec, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 4 }}>
        Orçamento total
      </Text>
      <Text style={{ fontSize: 12, color: Colors.textSec, marginBottom: 7 }}>
        Mínimo: R$ {minBudget} ({dailyLimit}/dia × {periodDays} dias)
      </Text>
      <Controller
        control={control}
        name="totalBudget"
        render={({ field: { onChange, value } }) => (
          <CurrencyInput value={value} onChange={onChange} error={errors.totalBudget?.message} />
        )}
      />
      {isBelowMin && (
        <Text style={{ color: Colors.danger, fontSize: 12, marginBottom: 12, marginTop: -8 }}>
          O orçamento total deve ser ao menos R$ {minBudget}
        </Text>
      )}

      {errors.root && (
        <Text style={{ color: Colors.danger, fontSize: 13, textAlign: "center", marginBottom: 12 }}>
          {errors.root.message}
        </Text>
      )}

      <Btn
        label="Salvar alterações"
        onPress={handleSubmit(onSubmit)}
        loading={loading}
        disabled={isBelowMin}
      />
    </ScrollView>
  );
}
