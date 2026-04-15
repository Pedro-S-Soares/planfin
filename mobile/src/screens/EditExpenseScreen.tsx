import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  useCategoriesQuery,
  useUpdateExpenseMutation,
  ActivePeriodDocument,
  CategoriesQuery,
} from "../graphql/__generated__/hooks";
import { usePeriod } from "../context/PeriodContext";
import { DatePickerField } from "../components/DatePickerField";
import { CurrencyInput } from "../components/CurrencyInput";
import { displayToAPI, formatCents, parseCents } from "../lib/currency";
import type { AppStackParamList } from "../../App";

type Category = NonNullable<CategoriesQuery["categories"]>[number];
type Subcategory = NonNullable<NonNullable<Category>["subcategories"]>[number];
type RouteParams = AppStackParamList["EditExpense"];

const schema = yup.object({
  amount: yup
    .string()
    .required("Valor é obrigatório")
    .test("not-zero", "Informe um valor maior que zero", (v) => !!v && v !== "0,00"),
  date: yup.string().required("Data é obrigatória"),
  note: yup.string().optional(),
  categoryId: yup.string().optional(),
  subcategoryId: yup.string().optional(),
});

function apiToDisplay(apiAmount: string): string {
  const cents = Math.round(parseFloat(apiAmount) * 100);
  return formatCents(cents);
}

export function EditExpenseScreen() {
  const navigation = useNavigation();
  const route = useRoute<NativeStackScreenProps<AppStackParamList, "EditExpense">["route"]>();
  const { id, amount, date, note, subcategoryId, categoryId } = route.params;

  const { period, refetch } = usePeriod();
  const { data: catData } = useCategoriesQuery();
  const categories = catData?.categories ?? [];

  const {
    control,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      amount: apiToDisplay(amount),
      date,
      note: note ?? "",
      categoryId: categoryId ?? "",
      subcategoryId: subcategoryId ?? "",
    },
  });

  const selectedCategoryId = watch("categoryId");
  const subcategories: NonNullable<Subcategory>[] =
    categories.find((c) => c?.id === selectedCategoryId)?.subcategories?.filter(Boolean) as NonNullable<Subcategory>[] ?? [];

  const [updateExpense, { loading }] = useUpdateExpenseMutation({
    onCompleted: () => {
      refetch();
      navigation.goBack();
    },
    onError: (error) => setError("root", { message: error.message }),
    refetchQueries: [{ query: ActivePeriodDocument }, "ExpenseHistory"],
  });

  const onSubmit = (values: yup.InferType<typeof schema>) => {
    updateExpense({
      variables: {
        id,
        amount: displayToAPI(values.amount),
        date: values.date,
        note: values.note || null,
        subcategoryId: values.subcategoryId || null,
      },
    });
  };

  return (
    <ScrollView contentContainerClassName="flex-grow p-6 bg-white">
      <Text className="text-sm font-semibold text-neutral-700 mb-1.5">Valor</Text>
      <Controller
        control={control}
        name="amount"
        render={({ field: { onChange, value } }) => (
          <CurrencyInput value={value} onChange={onChange} error={errors.amount?.message} autoFocus />
        )}
      />

      <Text className="text-sm font-semibold text-neutral-700 mb-1.5">Data</Text>
      <Controller
        control={control}
        name="date"
        render={({ field: { onChange, value } }) => (
          <DatePickerField
            value={value}
            onChange={onChange}
            error={errors.date?.message}
            minDate={period?.startDate ?? undefined}
            maxDate={period?.endDate ?? undefined}
          />
        )}
      />

      <Text className="text-sm font-semibold text-neutral-700 mb-1.5">Categoria</Text>
      <Controller
        control={control}
        name="categoryId"
        render={({ field: { onChange, value } }) => (
          <View className="mb-5">
            <View className="flex-row flex-wrap gap-2">
              {(categories as NonNullable<Category>[]).map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  className={`px-3.5 py-2 rounded-full border ${
                    value === cat.id ? "border-blue-600 bg-blue-50" : "border-neutral-300 bg-neutral-50"
                  }`}
                  onPress={() => onChange(cat.id)}
                >
                  <Text className={`text-[13px] ${value === cat.id ? "text-blue-600 font-semibold" : "text-neutral-600"}`}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      />

      {subcategories.length > 0 && (
        <>
          <Text className="text-sm font-semibold text-neutral-700 mb-1.5">Subcategoria</Text>
          <Controller
            control={control}
            name="subcategoryId"
            render={({ field: { onChange, value } }) => (
              <View className="mb-5">
                <View className="flex-row flex-wrap gap-2">
                  {subcategories.map((sub) => (
                    <TouchableOpacity
                      key={sub.id}
                      className={`px-3.5 py-2 rounded-full border ${
                        value === sub.id ? "border-blue-600 bg-blue-50" : "border-neutral-300 bg-neutral-50"
                      }`}
                      onPress={() => onChange(sub.id)}
                    >
                      <Text className={`text-[13px] ${value === sub.id ? "text-blue-600 font-semibold" : "text-neutral-600"}`}>
                        {sub.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          />
        </>
      )}

      <Text className="text-sm font-semibold text-neutral-700 mb-1.5">Nota (opcional)</Text>
      <Controller
        control={control}
        name="note"
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="mb-5">
            <TextInput
              className="border border-neutral-300 rounded-lg p-3 text-base"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Ex: almoço com amigos"
            />
          </View>
        )}
      />

      {errors.root && <Text className="text-red-500 text-sm text-center mb-3">{errors.root.message}</Text>}

      <TouchableOpacity className="bg-blue-600 rounded-lg p-4 items-center mt-2" onPress={handleSubmit(onSubmit)} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-base font-semibold">Salvar alterações</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}
