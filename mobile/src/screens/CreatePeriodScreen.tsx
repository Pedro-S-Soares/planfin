import { View, Text, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useCreatePeriodMutation } from "../graphql/__generated__/hooks";
import { usePeriod } from "../context/PeriodContext";
import { DatePickerField } from "../components/DatePickerField";
import { CurrencyInput } from "../components/CurrencyInput";
import { Btn } from "../components/ui/Btn";
import { toISODate } from "../lib/date";
import { displayToAPI, formatCents } from "../lib/currency";
import { Colors, Radius } from "../theme/tokens";

const today = new Date();
const in30Days = new Date(today);
in30Days.setDate(today.getDate() + 29);

function computeMinBudget(dailyLimit: string, startDate: string, endDate: string): string {
  const limit = parseFloat(displayToAPI(dailyLimit) || "0");
  if (!limit || !startDate || !endDate) return "0,00";
  const start = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T00:00:00");
  const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  const cents = Math.round(limit * days * 100);
  return formatCents(cents);
}

const schema = yup.object({
  startDate: yup.string().required("Data de início é obrigatória"),
  endDate: yup.string().required("Data de fim é obrigatória"),
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

export function CreatePeriodScreen() {
  const { refetch } = usePeriod();

  const { control, handleSubmit, watch, setError, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      startDate: toISODate(today),
      endDate: toISODate(in30Days),
      dailyLimit: "0,00",
      totalBudget: "0,00",
    },
  });

  const dailyLimit = watch("dailyLimit");
  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const totalBudget = watch("totalBudget");

  const minBudget = computeMinBudget(dailyLimit, startDate, endDate);
  const isBelowMin =
    totalBudget !== "0,00" &&
    parseFloat(displayToAPI(totalBudget) || "0") <
      parseFloat(displayToAPI(minBudget) || "0");

  const [createPeriod, { loading }] = useCreatePeriodMutation({
    onCompleted: () => refetch(),
    onError: (error) => setError("root", { message: error.message }),
  });

  const onSubmit = (values: FormValues) => {
    createPeriod({
      variables: {
        startDate: values.startDate,
        endDate: values.endDate,
        dailyLimit: displayToAPI(values.dailyLimit),
        totalBudget: displayToAPI(values.totalBudget),
      },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      {/* Header */}
      <View style={{
        backgroundColor: Colors.bg,
        paddingTop: 62,
        paddingBottom: 22,
        paddingHorizontal: 22,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
      }}>
        <Text style={{ fontSize: 26, fontWeight: "800", color: Colors.text, letterSpacing: -0.5 }}>
          Novo planejamento
        </Text>
        <Text style={{ fontSize: 13, color: Colors.textSec, marginTop: 4, lineHeight: 20 }}>
          Defina o período, o limite diário e o orçamento total.
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 22, paddingTop: 22 }}>
        <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.textSec, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 7 }}>
          Data de início
        </Text>
        <Controller
          control={control}
          name="startDate"
          render={({ field: { onChange, value } }) => (
            <DatePickerField value={value} onChange={onChange} error={errors.startDate?.message} />
          )}
        />

        <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.textSec, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 7 }}>
          Data de fim
        </Text>
        <Controller
          control={control}
          name="endDate"
          render={({ field: { onChange, value } }) => (
            <DatePickerField value={value} onChange={onChange} error={errors.endDate?.message} />
          )}
        />

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
          Mínimo: R$ {minBudget} ({dailyLimit}/dia × {(() => {
            const s = new Date(startDate + "T00:00:00");
            const e = new Date(endDate + "T00:00:00");
            return Math.max(1, Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1);
          })()} dias)
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
          label="Começar planejamento"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          disabled={isBelowMin}
        />
      </ScrollView>
    </View>
  );
}
