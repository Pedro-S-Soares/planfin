import { useEffect } from "react";
import { Text, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  useCategoriesQuery,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  ActivePeriodDocument,
} from "../graphql/__generated__/hooks";
import { usePeriod } from "../context/PeriodContext";
import { DatePickerField } from "../components/DatePickerField";
import { CurrencyInput } from "../components/CurrencyInput";
import { Btn } from "../components/ui/Btn";
import { displayToAPI, formatCents } from "../lib/currency";
import { Ledger } from "../theme/tokens";
import { usePageTitle } from "../hooks/usePageTitle";
import { AccountPicker } from "../modules/finance/components/AccountPicker";
import { useFinancialAccounts } from "../modules/finance/use-financial-accounts";
import { toast } from "../lib/toast";
import {
  CategoryField,
  DeleteEntryButton,
  ExtraToggle,
  FieldLabel,
  MoreOptions,
  NoteField,
} from "../modules/history/components/entry-form-parts";
import type { AppStackParamList } from "../../App";

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
  accountId: yup.string().nullable().optional(),
});

function apiToDisplay(apiAmount: string): string {
  const cents = Math.round(parseFloat(apiAmount) * 100);
  return formatCents(cents);
}

export function EditIncomeScreen() {
  usePageTitle("Planfin - Editar receita");
  const navigation = useNavigation();
  const route = useRoute<NativeStackScreenProps<AppStackParamList, "EditIncome">["route"]>();
  return <EditIncomeForm entry={route.params} onDone={() => navigation.goBack()} />;
}

interface EditIncomeFormProps {
  entry: AppStackParamList["EditIncome"];
  /** Called once the entry is saved or deleted. */
  onDone: () => void;
}

/** The edit-income form: its own screen, and the sheet opened over the history. */
export function EditIncomeForm({ entry, onDone }: EditIncomeFormProps) {
  const { id, amount, date, note, isExtra, subcategoryId, categoryId, accountId: initialAccountId, countsInBudget } = entry;
  const { accounts } = useFinancialAccounts();
  const isBudgetEntry = countsInBudget !== false;

  const { period, refetch } = usePeriod();
  const { data: catData } = useCategoriesQuery({ variables: { type: "income" } });
  const categories = catData?.categories ?? [];

  const { control, handleSubmit, watch, setValue, getValues, setError, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      amount: apiToDisplay(amount),
      date,
      isExtra: isExtra ?? false,
      note: note ?? "",
      categoryId: categoryId ?? "",
      subcategoryId: subcategoryId ?? "",
      accountId: initialAccountId ?? null,
    },
  });

  // Callers like the history only know the subcategory: select its category once categories load,
  // so the subcategory chips show up already marked.
  const subcategoryCategoryId = categories.find((c) => c?.subcategories?.some((s) => s?.id === subcategoryId))?.id;
  useEffect(() => {
    if (subcategoryCategoryId && !getValues("categoryId")) setValue("categoryId", subcategoryCategoryId);
  }, [subcategoryCategoryId, getValues, setValue]);

  const selectedCategoryId = watch("categoryId");

  const [updateExpense, { loading: updating }] = useUpdateExpenseMutation({
    onCompleted: () => { refetch(); toast.success("Alteração salva"); onDone(); },
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

  const [deleteExpense, { loading: deleting }] = useDeleteExpenseMutation({
    onCompleted: () => { refetch(); toast.success("Receita excluída"); onDone(); },
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
    updateExpense({
      variables: {
        id,
        amount: displayToAPI(values.amount),
        date: values.date,
        isExtra: values.isExtra ?? false,
        note: values.note || null,
        subcategoryId: values.subcategoryId || null,
        type: "income",
        ...(values.accountId !== (initialAccountId ?? null) ? { accountId: values.accountId ?? null } : {}),
      },
    });
  };

  const isLoading = updating || deleting;

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
        onCategoryChange={(categoryIdValue) => {
          setValue("categoryId", categoryIdValue);
          setValue("subcategoryId", "");
        }}
        onSubcategoryChange={(subcategoryIdValue) => setValue("subcategoryId", subcategoryIdValue)}
      />

      <Controller
        control={control}
        name="accountId"
        render={({ field: { onChange, value } }) => (
          <AccountPicker label="Recebido em" accounts={accounts} value={value ?? null} onChange={onChange} allowNone />
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
            minDate={isBudgetEntry ? period?.startDate ?? undefined : undefined}
            maxDate={isBudgetEntry ? period?.endDate ?? undefined : undefined}
          />
        )}
      />

      <MoreOptions summary="Receita extra, nota" isInitiallyOpen={Boolean(note || isExtra)}>
        <Controller
          control={control}
          name="isExtra"
          render={({ field: { onChange, value } }) => (
            <ExtraToggle title="Receita extra" value={value ?? false} onChange={onChange} />
          )}
        />

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

      <Btn label="Salvar alterações" onPress={handleSubmit(onSubmit)} loading={isLoading} />
      <DeleteEntryButton
        label="Excluir receita"
        confirmTitle="Excluir esta receita?"
        isDisabled={isLoading}
        onConfirm={() => deleteExpense({ variables: { id } })}
      />
    </ScrollView>
  );
}
