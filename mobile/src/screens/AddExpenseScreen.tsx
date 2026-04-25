import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigation } from "@react-navigation/native";
import {
  useCategoriesQuery,
  useCreateExpenseMutation,
  ActivePeriodDocument,
  CategoriesQuery,
} from "../graphql/__generated__/hooks";
import { usePeriod } from "../context/PeriodContext";
import { DatePickerField } from "../components/DatePickerField";
import { CurrencyInput } from "../components/CurrencyInput";
import { Btn } from "../components/ui/Btn";
import { Chip } from "../components/ui/Chip";
import { toISODate } from "../lib/date";
import { displayToAPI } from "../lib/currency";
import { categoryColor, Colors, Radius } from "../theme/tokens";
import { usePageTitle } from "../hooks/usePageTitle";

type Category = NonNullable<CategoriesQuery["categories"]>[number];
type Subcategory = NonNullable<NonNullable<Category>["subcategories"]>[number];

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

export function AddExpenseScreen() {
  usePageTitle("Planfin - Novo gasto");
  const navigation = useNavigation();
  const { period, refetch } = usePeriod();

  const { data: catData } = useCategoriesQuery();
  const categories = catData?.categories ?? [];

  const { control, handleSubmit, watch, setError, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      amount: "0,00",
      date: toISODate(new Date()),
      note: "",
      categoryId: "",
      subcategoryId: "",
    },
  });

  const selectedCategoryId = watch("categoryId");
  const subcategories: NonNullable<Subcategory>[] =
    categories.find((c) => c?.id === selectedCategoryId)?.subcategories?.filter(Boolean) as NonNullable<Subcategory>[] ?? [];

  const [createExpense, { loading }] = useCreateExpenseMutation({
    onCompleted: () => { refetch(); navigation.goBack(); },
    onError: (error) => setError("root", { message: error.message }),
    refetchQueries: [{ query: ActivePeriodDocument }, "ExpenseHistory"],
  });

  const onSubmit = (values: yup.InferType<typeof schema>) => {
    createExpense({
      variables: {
        amount: displayToAPI(values.amount),
        date: values.date,
        note: values.note || null,
        subcategoryId: values.subcategoryId || null,
      },
    });
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.surface }}
      contentContainerStyle={{ padding: 18, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.textSec, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 7 }}>
        Valor
      </Text>
      <Controller
        control={control}
        name="amount"
        render={({ field: { onChange, value } }) => (
          <CurrencyInput value={value} onChange={onChange} error={errors.amount?.message} autoFocus />
        )}
      />

      <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.textSec, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 7 }}>
        Data
      </Text>
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

      <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.textSec, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 10 }}>
        Categoria
      </Text>
      <Controller
        control={control}
        name="categoryId"
        render={({ field: { onChange, value } }) => (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 16 }}>
            {(categories as NonNullable<Category>[]).map((cat) => (
              <Chip
                key={cat.id}
                label={cat.name ?? ""}
                selected={value === cat.id}
                dot={categoryColor(cat.name ?? "").dot}
                onPress={() => onChange(value === cat.id ? "" : cat.id)}
              />
            ))}
          </View>
        )}
      />

      {subcategories.length > 0 && (
        <>
          <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.textSec, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 10 }}>
            Subcategoria
          </Text>
          <Controller
            control={control}
            name="subcategoryId"
            render={({ field: { onChange, value } }) => (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 16 }}>
                {subcategories.map((sub) => (
                  <Chip
                    key={sub.id}
                    label={sub.name ?? ""}
                    selected={value === sub.id}
                    onPress={() => onChange(value === sub.id ? "" : sub.id)}
                  />
                ))}
              </View>
            )}
          />
        </>
      )}

      <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.textSec, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 7 }}>
        Nota (opcional)
      </Text>
      <Controller
        control={control}
        name="note"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={{ marginBottom: 16 }}>
            <TextInput
              style={{
                height: 52,
                borderWidth: 1.5,
                borderColor: Colors.border,
                borderRadius: Radius.md,
                paddingHorizontal: 16,
                fontSize: 16,
                color: Colors.text,
                backgroundColor: Colors.surface,
              }}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Ex: almoço com amigos"
              placeholderTextColor={Colors.textTer}
            />
          </View>
        )}
      />

      {errors.root && (
        <Text style={{ color: Colors.danger, fontSize: 13, textAlign: "center", marginBottom: 12 }}>
          {errors.root.message}
        </Text>
      )}

      <Btn label="Registrar gasto" onPress={handleSubmit(onSubmit)} loading={loading} />
    </ScrollView>
  );
}
