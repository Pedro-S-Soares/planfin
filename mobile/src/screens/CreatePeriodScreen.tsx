import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useCreatePeriodMutation } from "../graphql/__generated__/hooks";
import { usePeriod } from "../context/PeriodContext";
import { DatePickerField } from "../components/DatePickerField";
import { CurrencyInput } from "../components/CurrencyInput";
import { toISODate } from "../lib/date";
import { displayToAPI } from "../lib/currency";

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

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
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
    <ScrollView contentContainerClassName="flex-grow p-6 justify-center bg-white">
      <Text className="text-2xl font-bold mb-2 text-center">Novo planejamento</Text>
      <Text className="text-sm text-neutral-500 text-center mb-8 leading-5">
        Defina o período e quanto quer gastar por dia.
      </Text>

      <Text className="text-sm font-semibold text-neutral-700 mb-1.5">Data de início</Text>
      <Controller
        control={control}
        name="startDate"
        render={({ field: { onChange, value } }) => (
          <DatePickerField value={value} onChange={onChange} error={errors.startDate?.message} />
        )}
      />

      <Text className="text-sm font-semibold text-neutral-700 mb-1.5">Data de fim</Text>
      <Controller
        control={control}
        name="endDate"
        render={({ field: { onChange, value } }) => (
          <DatePickerField value={value} onChange={onChange} error={errors.endDate?.message} />
        )}
      />

      <Text className="text-sm font-semibold text-neutral-700 mb-1.5">Limite diário</Text>
      <Controller
        control={control}
        name="dailyLimit"
        render={({ field: { onChange, value } }) => (
          <CurrencyInput value={value} onChange={onChange} error={errors.dailyLimit?.message} />
        )}
      />

      {errors.root && <Text className="text-red-500 text-sm text-center mb-3">{errors.root.message}</Text>}

      <TouchableOpacity className="bg-blue-600 rounded-lg p-4 items-center mt-2" onPress={handleSubmit(onSubmit)} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-base font-semibold">Começar planejamento</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
