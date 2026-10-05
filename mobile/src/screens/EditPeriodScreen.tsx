import { View, Text, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigation } from "@react-navigation/native";
import { useUpdatePeriodMutation, ActivePeriodDocument } from "../graphql/__generated__/hooks";
import { usePeriod } from "../context/PeriodContext";
import { CurrencyInput } from "../components/CurrencyInput";
import { DatePickerField } from "../components/DatePickerField";
import { formatDateBR } from "../lib/date";
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
  startDate: yup.string().required("Data de início é obrigatória"),
  endDate: yup
    .string()
    .required("Data de fim é obrigatória")
    .test("after-start", "O fim precisa ser depois do início", function (value) {
      return !!value && value > this.parent.startDate;
    }),
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

  const { control, handleSubmit, watch, setError, formState: { errors, dirtyFields } } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      startDate: period?.startDate ?? "",
      endDate: period?.endDate ?? "",
      dailyLimit: period?.dailyLimit ? apiToDisplay(period.dailyLimit) : "0,00",
      totalBudget: period?.totalBudget ? apiToDisplay(period.totalBudget) : "0,00",
    },
  });

  const dailyLimit = watch("dailyLimit");
  const totalBudget = watch("totalBudget");
  const startDate = watch("startDate");
  const endDate = watch("endDate");
  // When the total is left untouched, the app recomputes it for the new dates
  // keeping the extra, so the minimum only matters for a total typed by hand.
  const isTotalEdited = !!dirtyFields.totalBudget;
  const isReshaped = !!dirtyFields.startDate || !!dirtyFields.endDate || !!dirtyFields.dailyLimit;

  const minBudget = computeMinBudget(dailyLimit, { startDate, endDate });
  const isBelowMin =
    (isTotalEdited || !isReshaped) &&
    totalBudget !== "0,00" &&
    parseFloat(displayToAPI(totalBudget) || "0") <
      parseFloat(displayToAPI(minBudget) || "0");

  const [updatePeriod, { loading }] = useUpdatePeriodMutation({
    onCompleted: () => { refetch(); navigation.goBack(); },
    onError: (error) => setError("root", { message: error.message }),
    refetchQueries: [{ query: ActivePeriodDocument }, "GroupPeriods", "ExpenseHistoryWithAuthors", "MonthPlan"],
  });

  const onSubmit = (values: FormValues) => {
    updatePeriod({
      variables: {
        id: period?.id,
        startDate: values.startDate,
        endDate: values.endDate,
        dailyLimit: displayToAPI(values.dailyLimit),
        ...(isTotalEdited || !isReshaped ? { totalBudget: displayToAPI(values.totalBudget) } : {}),
      },
    });
  };

  // Total the backend will store when the field is left untouched: same extra, new days.
  const recomputedTotal = (() => {
    if (!period?.startDate || !period.endDate || !period.dailyLimit || !period.totalBudget) return null;
    const oldDays = Math.round((new Date(period.endDate + "T00:00:00").getTime() - new Date(period.startDate + "T00:00:00").getTime()) / 86_400_000) + 1;
    const extraCents = Math.max(0, Math.round(parseFloat(period.totalBudget) * 100) - Math.round(parseFloat(period.dailyLimit) * 100) * oldDays);
    const minCents = Math.round(parseFloat(displayToAPI(minBudget) || "0") * 100);
    return formatCents(minCents + extraCents);
  })();

  const periodDays = (() => {
    if (!startDate || !endDate) return null;
    const s = new Date(startDate + "T00:00:00");
    const e = new Date(endDate + "T00:00:00");
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
            Período: {startDate ? formatDateBR(startDate) : "—"} → {endDate ? formatDateBR(endDate) : "—"} ({periodDays} dias)
          </Text>
          <Text style={{ fontSize: 11, color: Colors.primaryText, marginTop: 3 }}>
            Mudar as datas ou o limite recalcula o saldo de hoje. Se você não mexer no orçamento total, ele é
            recalculado para os novos dias mantendo o extra.
          </Text>
        </View>
      )}

      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.textSec, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 7 }}>
            Início
          </Text>
          <Controller
            control={control}
            name="startDate"
            render={({ field: { onChange, value } }) => (
              <DatePickerField value={value} onChange={onChange} error={errors.startDate?.message} />
            )}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.textSec, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 7 }}>
            Fim
          </Text>
          <Controller
            control={control}
            name="endDate"
            render={({ field: { onChange, value } }) => (
              <DatePickerField value={value} onChange={onChange} error={errors.endDate?.message} />
            )}
          />
        </View>
      </View>

      <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.textSec, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 7 }}>
        Limite diário
      </Text>
      <Controller
        control={control}
        name="dailyLimit"
        render={({ field: { onChange, value } }) => (
          <CurrencyInput value={value} onChange={onChange} error={errors.dailyLimit?.message} />
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
      {isReshaped && !isTotalEdited && recomputedTotal ? (
        <Text style={{ color: Colors.primaryText, fontSize: 12, marginBottom: 12, marginTop: -8 }}>
          Ao salvar, o orçamento total passa a ser R$ {recomputedTotal} para os novos dias. Digite outro valor se quiser
          mudar.
        </Text>
      ) : null}
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
