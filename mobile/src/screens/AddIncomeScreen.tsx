import { Text, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import {
  useCategoriesQuery,
  useCreateExpenseMutation,
  ActivePeriodDocument,
} from "../graphql/__generated__/hooks";
import { usePeriod } from "../context/PeriodContext";
import { DatePickerField } from "../components/DatePickerField";
import { CurrencyInput } from "../components/CurrencyInput";
import { Btn } from "../components/ui/Btn";
import { toISODate } from "../lib/date";
import { displayToAPI } from "../lib/currency";
import { Ledger } from "../theme/tokens";
import { usePageTitle } from "../hooks/usePageTitle";
import { AccountPicker } from "../modules/finance/components/AccountPicker";
import { ToggleRow } from "../modules/finance/components/ToggleRow";
import { defaultSpendingAccountId, useFinancialAccounts } from "../modules/finance/use-financial-accounts";
import { parseCents } from "../lib/currency";
import { toast } from "../lib/toast";
import { CategoryField, ExtraToggle, FieldLabel, MoreOptions, NoteField } from "../modules/history/components/entry-form-parts";
import type { AppStackParamList, EntryFormParams } from "../../App";

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
  countsInBudget: yup.boolean().default(true),
});

export function AddIncomeScreen() {
  usePageTitle("Planfin - Nova receita");
  const navigation = useNavigation();
  const { params } = useRoute<RouteProp<AppStackParamList, "AddIncome">>();
  return <AddIncomeForm params={params} onDone={() => navigation.goBack()} />;
}

interface AddIncomeFormProps {
  params?: EntryFormParams;
  /** Called once the entry is saved. */
  onDone: () => void;
}

/** The new-income form: its own screen, and the sheet opened over the history. */
export function AddIncomeForm({ params, onDone }: AddIncomeFormProps) {
  const { period, refetch } = usePeriod();
  const { accounts } = useFinancialAccounts();

  const { data: catData } = useCategoriesQuery({ variables: { type: "income" } });
  const categories = catData?.categories ?? [];

  const { control, handleSubmit, watch, setValue, setError, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      amount: "0,00",
      date: params?.date ?? toISODate(new Date()),
      isExtra: false,
      accountId: params?.accountId,
      installments: 1,
      countsInBudget: !params?.outsideBudget,
      note: "",
      categoryId: "",
      subcategoryId: "",
    },
  });

  const selectedCategoryId = watch("categoryId");
  const chosenAccountId = watch("accountId");
  const accountId = chosenAccountId === undefined ? accounts.find((a) => a.isPrimary)?.id ?? null : chosenAccountId;
  const account = accounts.find((a) => a.id === accountId) ?? null;
  const isCard = account?.kind === "credit_card";
  // Allowance and reserve accounts never touch the household budget.
  // Allowance and reserve money is separate from the household budget.
  const isPrivateAccount = account?.kind === "allowance" || account?.kind === "reserve";
  const countsInBudget = watch("countsInBudget") && !isPrivateAccount;
  const amountValue = parseCents(watch("amount")) / 100;

  const [createExpense, { loading }] = useCreateExpenseMutation({
    onCompleted: () => { refetch(); toast.success("Receita registrada"); onDone(); },
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
        type: "income",
        accountId,
      },
    });
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Ledger.sheet }}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <FieldLabel>Valor</FieldLabel>
      <Controller
        control={control}
        name="amount"
        render={({ field: { onChange, value } }) => (
          <CurrencyInput value={value} onChange={onChange} error={errors.amount?.message} autoFocus />
        )}
      />

      <CategoryField
        categories={categories}
        categoryId={selectedCategoryId ?? ""}
        subcategoryId={watch("subcategoryId") ?? ""}
        onCategoryChange={(id) => {
          setValue("categoryId", id);
          setValue("subcategoryId", "");
        }}
        onSubcategoryChange={(id) => setValue("subcategoryId", id)}
      />

      <Controller
        control={control}
        name="accountId"
        render={({ field: { onChange } }) => (
          <AccountPicker label="Recebido em" accounts={accounts} value={accountId} onChange={onChange} allowNone />
        )}
      />

      <FieldLabel>Data</FieldLabel>
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

      <MoreOptions summary="Orçamento, receita extra, nota">
        {isPrivateAccount ? null : (
          <Controller
            control={control}
            name="countsInBudget"
            render={({ field: { onChange, value } }) => (
              <ToggleRow
                title="Conta no orçamento"
                description={value ? "Volta para o limite diário do período" : "Só movimenta a conta ou o cartão (ex.: compra antiga, salário)"}
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
              <ExtraToggle title="Receita extra" value={value ?? false} onChange={onChange} />
            )}
          />
        ) : null}

        <Controller
          control={control}
          name="note"
          render={({ field: { onChange, onBlur, value } }) => (
            <NoteField value={value ?? ""} onChange={onChange} onBlur={onBlur} placeholder="Ex: salário, freelance" />
          )}
        />
      </MoreOptions>

      {errors.root && (
        <Text style={{ color: Ledger.danger, fontSize: 13, textAlign: "center", marginBottom: 12 }}>
          {errors.root.message}
        </Text>
      )}

      <Btn label="Registrar receita" onPress={handleSubmit(onSubmit)} loading={loading} />
    </ScrollView>
  );
}
