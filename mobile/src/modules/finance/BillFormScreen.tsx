import { ScrollView, Text, View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import type * as yup from "yup";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import { CurrencyInput } from "../../components/CurrencyInput";
import { Btn } from "../../components/ui/Btn";
import { Chip } from "../../components/ui/Chip";
import { FieldInput } from "../../components/ui/FieldInput";
import {
  useCategoriesQuery,
  useCreateRecurringBillMutation,
  useDeleteRecurringBillMutation,
  useRecurringBillsQuery,
  useUpdateRecurringBillMutation,
} from "../../graphql/__generated__/hooks";
import { confirm } from "../../lib/alert";
import { displayToAPI, formatCents } from "../../lib/currency";
import { usePageTitle } from "../../hooks/usePageTitle";
import { categoryColor, Colors } from "../../theme/tokens";
import { billFormSchema } from "./bill-form-schema";
import { AccountPicker } from "./components/AccountPicker";
import { FormLabel } from "./components/FormLabel";
import { addMonths, formatMonth, monthOf, toNumber } from "./format";
import { defaultSpendingAccountId, useFinancialAccounts } from "./use-financial-accounts";
import type { AppStackParamList } from "../../../App";

type BillFormValues = yup.InferType<typeof billFormSchema>;

export function BillFormScreen() {
  const navigation = useNavigation();
  const { params } = useRoute<RouteProp<AppStackParamList, "BillForm">>();
  usePageTitle(params.billId ? "Planfin - Editar item planejado" : "Planfin - Novo item planejado");
  const { accounts } = useFinancialAccounts();
  const { data: billsData } = useRecurringBillsQuery({ skip: !params.billId });
  const editing = billsData?.recurringBills?.find((b) => b?.id === params.billId) ?? null;
  const initialDirection = editing?.direction === "income" ? "income" : params.direction ?? "expense";
  const { data: catData } = useCategoriesQuery();
  const allCategories = catData?.categories?.filter((c) => c !== null) ?? [];

  const editingCategoryId =
    allCategories.find((c) => c.subcategories?.some((s) => s?.id === editing?.subcategory?.id))?.id ?? "";

  const { control, handleSubmit, watch, setError, formState: { errors } } = useForm({
    resolver: yupResolver(billFormSchema),
    values: editing
      ? {
          name: editing.name ?? "",
          amount: formatCents(Math.round(toNumber(editing.amount) * 100)),
          dueDay: String(editing.dueDay ?? ""),
          accountId: editing.account?.id ?? null,
          categoryId: editingCategoryId,
          subcategoryId: editing.subcategory?.id ?? "",
          direction: initialDirection,
          onceMonth: editing.onceMonth ?? "",
        }
      : undefined,
    defaultValues: {
      name: "",
      amount: "0,00",
      dueDay: "10",
      accountId: undefined,
      categoryId: "",
      subcategoryId: "",
      direction: params.direction ?? "expense",
      onceMonth: params.once ? monthOf(new Date()) : "",
    },
  });
  const direction = watch("direction");
  const isIncome = direction === "income";
  const onceMonth = watch("onceMonth");
  const categories = allCategories.filter((c) => c.type === (isIncome ? "income" : "expense"));
  const chosenAccount = watch("accountId");
  const defaultAccount = isIncome ? accounts.find((a) => a.isPrimary)?.id ?? null : defaultSpendingAccountId(accounts);
  const accountId = chosenAccount === undefined ? defaultAccount : chosenAccount;
  const subcategories = categories.find((c) => c.id === watch("categoryId"))?.subcategories?.filter((s) => s !== null) ?? [];

  const refetchQueries = ["RecurringBills", "BillOccurrences", "FinancePanel", "MonthPlan", "AllowancePlan"];
  const onCompleted = () => navigation.goBack();
  const onError = (e: Error) => setError("root", { message: e.message });
  const [createBill, { loading: creating }] = useCreateRecurringBillMutation({ refetchQueries, onCompleted, onError });
  const [updateBill, { loading: updating }] = useUpdateRecurringBillMutation({ refetchQueries, onCompleted, onError });
  const [deleteBill] = useDeleteRecurringBillMutation({ refetchQueries, onCompleted, onError });

  const onSubmit = (values: BillFormValues) => {
    if (!accountId) return setError("root", { message: isIncome ? "Escolha a conta onde o dinheiro entra" : "Escolha como a despesa é paga" });
    const variables = {
      name: values.name,
      amount: displayToAPI(values.amount),
      dueDay: Number(values.dueDay),
      accountId,
      subcategoryId: values.subcategoryId || null,
      direction: values.direction,
      onceMonth: values.onceMonth ?? "",
    };
    if (editing?.id) updateBill({ variables: { id: editing.id, ...variables } });
    else createBill({ variables });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.surface }} contentContainerStyle={{ padding: 18, paddingBottom: 32 }}>
      <Controller
        control={control}
        name="direction"
        render={({ field: { onChange, value } }) => (
          <View style={{ flexDirection: "row", gap: 7, marginBottom: 12 }}>
            <Chip label="Despesa" selected={value === "expense"} onPress={() => onChange("expense")} />
            <Chip label="Entrada prevista" selected={value === "income"} onPress={() => onChange("income")} />
          </View>
        )}
      />
      <Controller
        control={control}
        name="onceMonth"
        render={({ field: { onChange, value } }) => (
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: "row", gap: 7 }}>
              <Chip label="Todo mês" selected={!value} onPress={() => onChange("")} />
              <Chip label="Só um mês" selected={!!value} onPress={() => onChange(value || monthOf(new Date()))} />
            </View>
            {value ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 10 }}>
                <Text onPress={() => onChange(addMonths(value, -1))} style={{ fontSize: 22, color: Colors.primary }}>‹</Text>
                <Text style={{ fontSize: 14, fontWeight: "700", color: Colors.primaryText }}>{formatMonth(value)}</Text>
                <Text onPress={() => onChange(addMonths(value, 1))} style={{ fontSize: 22, color: Colors.primary }}>›</Text>
              </View>
            ) : null}
          </View>
        )}
      />
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <FieldInput
            label="Nome"
            value={value}
            onChange={onChange}
            error={errors.name?.message}
            placeholder={isIncome ? "Ex: Salário Dri" : onceMonth ? "Ex: Inscrição" : "Ex: Aluguel"}
          />
        )}
      />
      <FormLabel>{onceMonth ? "Valor" : "Valor por mês (estimado)"}</FormLabel>
      <Controller
        control={control}
        name="amount"
        render={({ field: { onChange, value } }) => <CurrencyInput value={value} onChange={onChange} error={errors.amount?.message} />}
      />
      <Controller
        control={control}
        name="dueDay"
        render={({ field: { onChange, value } }) => (
          <FieldInput
            label={isIncome ? "Entra no dia" : onceMonth ? "Pagar no dia" : "Pagar todo dia"}
            value={value}
            onChange={(v) => onChange(v.replace(/\D/g, "").slice(0, 2))}
            keyboardType="number-pad"
            error={errors.dueDay?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="accountId"
        render={({ field: { onChange } }) => (
          <AccountPicker
            label={isIncome ? "Entra na conta" : "Como é paga"}
            accounts={accounts}
            value={accountId}
            onChange={onChange}
            kinds={isIncome ? ["checking", "reserve", "benefit"] : ["checking", "credit_card"]}
          />
        )}
      />
      {isIncome ? null : (
        <Text style={{ fontSize: 12, color: Colors.textSec, marginTop: -8, marginBottom: 16 }}>
          Na conta: boleto ou Pix, sai do saldo. No cartão: entra na fatura.
        </Text>
      )}

      <Controller
        control={control}
        name="categoryId"
        render={({ field: { onChange, value } }) => (
          <View style={{ marginBottom: 16 }}>
            <FormLabel>Categoria (opcional)</FormLabel>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7 }}>
              {categories.map((cat) => (
                <Chip
                  key={cat.id ?? ""}
                  label={cat.name ?? ""}
                  icon={cat.icon}
                  dot={categoryColor(cat.name ?? "").dot}
                  selected={value === cat.id}
                  onPress={() => onChange(value === cat.id ? "" : cat.id)}
                />
              ))}
            </View>
          </View>
        )}
      />
      {subcategories.length > 0 ? (
        <Controller
          control={control}
          name="subcategoryId"
          render={({ field: { onChange, value } }) => (
            <View style={{ marginBottom: 16 }}>
              <FormLabel>Subcategoria</FormLabel>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7 }}>
                {subcategories.map((sub) => (
                  <Chip key={sub.id ?? ""} label={sub.name ?? ""} selected={value === sub.id} onPress={() => onChange(value === sub.id ? "" : sub.id)} />
                ))}
              </View>
            </View>
          )}
        />
      ) : null}

      {errors.root ? <Text style={{ color: Colors.danger, textAlign: "center", marginBottom: 12 }}>{errors.root.message}</Text> : null}
      <Btn label={editing ? "Salvar" : "Adicionar"} onPress={handleSubmit(onSubmit)} loading={creating || updating} />
      {editing?.id ? (
        <View style={{ marginTop: 10 }}>
          <Btn
            label="Excluir"
            variant="danger"
            size="sm"
            onPress={() => {
              const id = editing.id ?? "";
              confirm(
                { title: "Excluir item", message: "Os pagamentos já registrados continuam no histórico.", confirmLabel: "Excluir", destructive: true },
                () => deleteBill({ variables: { id } }),
              );
            }}
          />
        </View>
      ) : null}
    </ScrollView>
  );
}
