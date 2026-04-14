import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useCreatePeriodMutation } from "../graphql/__generated__/hooks";
import { usePeriod } from "../context/PeriodContext";

const today = new Date();
const in30Days = new Date(today);
in30Days.setDate(today.getDate() + 29);
const toISO = (d: Date) => d.toISOString().split("T")[0];

const schema = yup.object({
  startDate: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Use o formato AAAA-MM-DD")
    .required("Data de início é obrigatória"),
  endDate: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Use o formato AAAA-MM-DD")
    .required("Data de fim é obrigatória"),
  dailyLimit: yup
    .string()
    .matches(/^\d+([.,]\d{1,2})?$/, "Valor inválido")
    .required("Limite diário é obrigatório"),
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
      startDate: toISO(today),
      endDate: toISO(in30Days),
      dailyLimit: "",
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
        dailyLimit: values.dailyLimit.replace(",", "."),
      },
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Novo planejamento</Text>
      <Text style={styles.subtitle}>Defina o período e quanto quer gastar por dia.</Text>

      <Text style={styles.label}>Data de início</Text>
      <Controller
        control={control}
        name="startDate"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.fieldWrapper}>
            <TextInput
              style={[styles.input, errors.startDate && styles.inputError]}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="AAAA-MM-DD"
              keyboardType="numeric"
            />
            {errors.startDate && <Text style={styles.errorText}>{errors.startDate.message}</Text>}
          </View>
        )}
      />

      <Text style={styles.label}>Data de fim</Text>
      <Controller
        control={control}
        name="endDate"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.fieldWrapper}>
            <TextInput
              style={[styles.input, errors.endDate && styles.inputError]}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="AAAA-MM-DD"
              keyboardType="numeric"
            />
            {errors.endDate && <Text style={styles.errorText}>{errors.endDate.message}</Text>}
          </View>
        )}
      />

      <Text style={styles.label}>Limite diário (R$)</Text>
      <Controller
        control={control}
        name="dailyLimit"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.fieldWrapper}>
            <TextInput
              style={[styles.input, errors.dailyLimit && styles.inputError]}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Ex: 80,00"
              keyboardType="decimal-pad"
            />
            {errors.dailyLimit && <Text style={styles.errorText}>{errors.dailyLimit.message}</Text>}
          </View>
        )}
      />

      {errors.root && <Text style={styles.rootError}>{errors.root.message}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Começar planejamento</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: "center", backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 8, textAlign: "center" },
  subtitle: { fontSize: 14, color: "#666", textAlign: "center", marginBottom: 32, lineHeight: 20 },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 6 },
  fieldWrapper: { marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, fontSize: 16 },
  inputError: { borderColor: "#ef4444" },
  errorText: { color: "#ef4444", fontSize: 12, marginTop: 4 },
  rootError: { color: "#ef4444", fontSize: 14, textAlign: "center", marginBottom: 12 },
  button: { backgroundColor: "#2563EB", borderRadius: 8, padding: 16, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
