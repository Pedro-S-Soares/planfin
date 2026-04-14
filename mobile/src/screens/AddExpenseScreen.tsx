import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation, useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { useNavigation } from "@react-navigation/native";
import { usePeriod, ACTIVE_PERIOD_QUERY } from "../context/PeriodContext";

const CATEGORIES_QUERY = gql`
  query Categories {
    categories {
      id
      name
      subcategories {
        id
        name
      }
    }
  }
`;

const CREATE_EXPENSE_MUTATION = gql`
  mutation CreateExpense($amount: String!, $date: String!, $note: String, $subcategoryId: ID) {
    createExpense(amount: $amount, date: $date, note: $note, subcategoryId: $subcategoryId) {
      id
      amount
      date
      note
      subcategory {
        id
        name
      }
    }
  }
`;

type Category = { id: string; name: string; subcategories: { id: string; name: string }[] };

const schema = yup.object({
  amount: yup
    .string()
    .matches(/^\d+([.,]\d{1,2})?$/, "Valor inválido")
    .required("Valor é obrigatório"),
  date: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Use o formato AAAA-MM-DD")
    .required("Data é obrigatória"),
  note: yup.string().optional(),
  categoryId: yup.string().optional(),
  subcategoryId: yup.string().optional(),
});

type FormValues = yup.InferType<typeof schema>;

export function AddExpenseScreen() {
  const navigation = useNavigation();
  const { refetch } = usePeriod();

  const { data: catData } = useQuery<{ categories: Category[] }>(CATEGORIES_QUERY);
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
      amount: "",
      date: new Date().toISOString().split("T")[0],
      note: "",
      categoryId: "",
      subcategoryId: "",
    },
  });

  const selectedCategoryId = watch("categoryId");
  const subcategories =
    categories.find((c) => c.id === selectedCategoryId)?.subcategories ?? [];

  const [createExpense, { loading }] = useMutation(CREATE_EXPENSE_MUTATION, {
    onCompleted: () => {
      refetch();
      navigation.goBack();
    },
    onError: (error: Error) => setError("root", { message: error.message }),
    refetchQueries: [{ query: ACTIVE_PERIOD_QUERY }],
  });

  const onSubmit = (values: yup.InferType<typeof schema>) => {
    createExpense({
      variables: {
        amount: values.amount.replace(",", "."),
        date: values.date,
        note: values.note || null,
        subcategoryId: values.subcategoryId || null,
      },
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Valor (R$)</Text>
      <Controller
        control={control}
        name="amount"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.fieldWrapper}>
            <TextInput
              style={[styles.input, errors.amount && styles.inputError]}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Ex: 35,90"
              keyboardType="decimal-pad"
              autoFocus
            />
            {errors.amount && <Text style={styles.errorText}>{errors.amount.message}</Text>}
          </View>
        )}
      />

      <Text style={styles.label}>Data</Text>
      <Controller
        control={control}
        name="date"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.fieldWrapper}>
            <TextInput
              style={[styles.input, errors.date && styles.inputError]}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="AAAA-MM-DD"
              keyboardType="numeric"
            />
            {errors.date && <Text style={styles.errorText}>{errors.date.message}</Text>}
          </View>
        )}
      />

      <Text style={styles.label}>Categoria</Text>
      <Controller
        control={control}
        name="categoryId"
        render={({ field: { onChange, value } }) => (
          <View style={styles.fieldWrapper}>
            <View style={styles.optionList}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.option, value === cat.id && styles.optionSelected]}
                  onPress={() => onChange(cat.id)}
                >
                  <Text style={[styles.optionText, value === cat.id && styles.optionTextSelected]}>
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
          <Text style={styles.label}>Subcategoria</Text>
          <Controller
            control={control}
            name="subcategoryId"
            render={({ field: { onChange, value } }) => (
              <View style={styles.fieldWrapper}>
                <View style={styles.optionList}>
                  {subcategories.map((sub) => (
                    <TouchableOpacity
                      key={sub.id}
                      style={[styles.option, value === sub.id && styles.optionSelected]}
                      onPress={() => onChange(sub.id)}
                    >
                      <Text style={[styles.optionText, value === sub.id && styles.optionTextSelected]}>
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

      <Text style={styles.label}>Nota (opcional)</Text>
      <Controller
        control={control}
        name="note"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.fieldWrapper}>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Ex: almoço com amigos"
            />
          </View>
        )}
      />

      {errors.root && <Text style={styles.rootError}>{errors.root.message}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Registrar gasto</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  fieldWrapper: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: "#ef4444",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
  },
  rootError: {
    color: "#ef4444",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
  },
  optionList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  option: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
  },
  optionSelected: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  optionText: {
    fontSize: 13,
    color: "#555",
  },
  optionTextSelected: {
    color: "#2563EB",
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#2563EB",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
