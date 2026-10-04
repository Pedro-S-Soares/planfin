import { View, Text, TextInput, TouchableOpacity, Switch, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
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
import { AccountPicker } from "../modules/finance/components/AccountPicker";
import { InstallmentPlan } from "../modules/finance/components/InstallmentPlan";
import { invoiceMonthFor } from "../modules/finance/format";
import { ToggleRow } from "../modules/finance/components/ToggleRow";
import { defaultSpendingAccountId, useFinancialAccounts } from "../modules/finance/use-financial-accounts";
import { parseCents } from "../lib/currency";
import type { AppStackParamList } from "../../App";

type Category = NonNullable<CategoriesQuery["categories"]>[number];
type Subcategory = NonNullable<NonNullable<Category>["subcategories"]>[number];

const schema = yup.object({
  amount: yup
    .string()
    .required("Valor é obrigatório")
    .test("not-zero", "Informe um valor maior que zero", (v) => !!v && v !== "0,00"),
  date: yup.string().required("Data é obrigatória"),
  isExtra: yup.boolean().default(false),
  note: yup.string().optional(),
  categoryId: yup.string().optional(),
  subcategoryId: yup.string().optional(),
  // undefined = use the default account; null = no account
  accountId: yup.string().nullable().optional(),
  installments: yup.number().default(1),
  amountPerInstallment: yup.boolean().default(false),
  // undefined = invoice of the purchase date
  firstInvoice: yup.string().optional(),
  countsInBudget: yup.boolean().default(true),
});

export function AddExpenseScreen() {
  usePageTitle("Planfin - Novo gasto");
  const navigation = useNavigation();
  const { params } = useRoute<RouteProp<AppStackParamList, "AddExpense">>();
  const { period, refetch } = usePeriod();
  const { accounts } = useFinancialAccounts();

  const { data: catData } = useCategoriesQuery({ variables: { type: "expense" } });
  const categories = catData?.categories ?? [];

  const { control, handleSubmit, watch, setValue, setError, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      amount: "0,00",
      date: params?.date ?? toISODate(new Date()),
      isExtra: false,
      accountId: params?.accountId,
      installments: 1,
      amountPerInstallment: false,
      firstInvoice: undefined,
      countsInBudget: !params?.outsideBudget,
      note: "",
      categoryId: "",
      subcategoryId: "",
    },
  });

  const selectedCategoryId = watch("categoryId");
  const chosenAccountId = watch("accountId");
  const accountId = chosenAccountId === undefined ? defaultSpendingAccountId(accounts) : chosenAccountId;
  const account = accounts.find((a) => a.id === accountId) ?? null;
  const isCard = account?.kind === "credit_card";
  // Allowance and reserve accounts never touch the household budget.
  // Allowance, reserve and meal voucher money is separate from the household budget.
  const isPrivateAccount = account?.kind === "allowance" || account?.kind === "reserve" || account?.kind === "benefit";
  const installments = isCard ? watch("installments") ?? 1 : 1;
  const defaultInvoice = isCard && account?.closingDay ? invoiceMonthFor(watch("date"), account.closingDay) : "";
  const firstInvoice = watch("firstInvoice") || defaultInvoice;
  // A purchase placed on another invoice never touches today's limit.
  const isRetroactive = installments > 1 && firstInvoice !== defaultInvoice;
  const countsInBudget = watch("countsInBudget") && !isPrivateAccount && !isRetroactive;
  const amountValue = parseCents(watch("amount")) / 100;
  const subcategories: NonNullable<Subcategory>[] =
    categories.find((c) => c?.id === selectedCategoryId)?.subcategories?.filter(Boolean) as NonNullable<Subcategory>[] ?? [];

  const [createExpense, { loading }] = useCreateExpenseMutation({
    onCompleted: () => { refetch(); navigation.goBack(); },
    onError: (error) => setError("root", { message: error.message }),
    refetchQueries: [
      { query: ActivePeriodDocument },
      "ExpenseHistory",
      "ExpenseHistoryWithAuthors",
      "FinancialAccounts",
      "Invoices",
      "Invoice",
      "AccountMovements",
    ],
  });

  const onSubmit = (values: yup.InferType<typeof schema>) => {
    createExpense({
      variables: {
        amount: displayToAPI(values.amount),
        date: values.date,
        isExtra: values.isExtra ?? false,
        note: values.note || null,
        subcategoryId: values.subcategoryId || null,
        accountId,
        installments,
        amountPerInstallment: installments > 1 ? values.amountPerInstallment : false,
        firstInvoice: installments > 1 ? firstInvoice : null,
        today: toISODate(new Date()),
        countsInBudget,
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
            minDate={countsInBudget ? period?.startDate ?? undefined : undefined}
            maxDate={countsInBudget ? period?.endDate ?? undefined : undefined}
          />
        )}
      />

      <Controller
        control={control}
        name="accountId"
        render={({ field: { onChange } }) => (
          <AccountPicker label="Pago com" accounts={accounts} value={accountId} onChange={onChange} allowNone />
        )}
      />

      {isCard && account?.closingDay && account.dueDay ? (
        <InstallmentPlan
          count={installments}
          onCountChange={(n) => setValue("installments", n)}
          amount={amountValue}
          perInstallment={watch("amountPerInstallment") ?? false}
          onPerInstallmentChange={(v) => setValue("amountPerInstallment", v)}
          firstInvoice={firstInvoice}
          defaultInvoice={defaultInvoice}
          onFirstInvoiceChange={(m) => setValue("firstInvoice", m === defaultInvoice ? undefined : m)}
          closingDay={account.closingDay}
          dueDay={account.dueDay}
        />
      ) : null}

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
                icon={cat.icon}
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

      {isPrivateAccount || isRetroactive ? null : (
        <Controller
          control={control}
          name="countsInBudget"
          render={({ field: { onChange, value } }) => (
            <ToggleRow
              title="Conta no orçamento"
              description={value ? "Entra no limite diário do período" : "Só movimenta a conta ou o cartão (ex.: compra antiga, salário)"}
              value={value ?? true}
              onChange={onChange}
            />
          )}
        />
      )}

      {countsInBudget ? (
      <Controller
        control={control}
        name="isExtra"
        render={({ field: { onChange, value } }) => (
          <TouchableOpacity
            onPress={() => onChange(!value)}
            activeOpacity={0.8}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: value ? Colors.primaryLight : Colors.bg,
              borderRadius: Radius.md,
              borderWidth: 1.5,
              borderColor: value ? Colors.primary : Colors.border,
              paddingHorizontal: 14,
              paddingVertical: 12,
              marginBottom: 16,
            }}
          >
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: value ? Colors.primaryText : Colors.text }}>
                Gasto extra
              </Text>
              <Text style={{ fontSize: 12, color: Colors.textSec, marginTop: 2 }}>
                Não conta no limite diário, só no orçamento total
              </Text>
            </View>
            <Switch
              value={value ?? false}
              onValueChange={onChange}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor="#fff"
            />
          </TouchableOpacity>
        )}
      />
      ) : null}

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
