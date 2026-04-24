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
import { displayToAPI } from "../lib/currency";
import { Colors, Radius } from "../theme/tokens";

const today = new Date();
const in30Days = new Date(today);
in30Days.setDate(today.getDate() + 29);

const schema = yup.object({
  startDate: yup.string().required("Data de início é obrigatória"),
  endDate: yup.string().required("Data de fim é obrigatória"),
  dailyLimit: yup
    .string()
    .required("Limite diário é obrigatório")
    .test("not-zero", "Informe um valor maior que zero", (v) => !!v && v !== "0,00"),
});

type FormValues = yup.InferType<typeof schema>;

export function CreatePeriodScreen() {
  const { refetch } = usePeriod();

  const { control, handleSubmit, setError, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      startDate: toISODate(today),
      endDate: toISODate(in30Days),
      dailyLimit: "0,00",
    },
  });

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
          Defina o período e quanto você quer gastar por dia.
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

        {/* Tip */}
        <View style={{
          backgroundColor: Colors.primaryLight,
          borderRadius: Radius.lg,
          padding: 12,
          marginBottom: 16,
        }}>
          <Text style={{ fontSize: 12, color: Colors.primaryText, fontWeight: "600" }}>
            💡 Dica: defina um limite realista para o seu dia a dia.
          </Text>
        </View>

        {errors.root && (
          <Text style={{ color: Colors.danger, fontSize: 13, textAlign: "center", marginBottom: 12 }}>
            {errors.root.message}
          </Text>
        )}

        <Btn label="Começar planejamento" onPress={handleSubmit(onSubmit)} loading={loading} />
      </ScrollView>
    </View>
  );
}
