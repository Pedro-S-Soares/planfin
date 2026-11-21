import { StyleSheet } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  useCategoriesQuery,
  useCreateExpenseMutation,
  useRecurringBillsQuery,
} from "../../../graphql/__generated__/hooks";
import { usePeriod } from "../../../context/PeriodContext";
import { DatePickerField } from "../../../components/DatePickerField";
import { CurrencyInput } from "../../../components/CurrencyInput";
import { Button } from "../../../components/ui/Button";
import { toISODate } from "../../../lib/date";
import { displayToAPI } from "../../../lib/currency";
import { AppText } from "../../../components/ui/AppText";
import { AccountPicker } from "../../finance/components/AccountPicker";
import { InstallmentPlan } from "../../finance/components/InstallmentPlan";
import { invoiceMonthFor } from "../../finance/format";
import { ToggleRow } from "../../finance/components/ToggleRow";
import { defaultSpendingAccountId, useFinancialAccounts } from "../../finance/use-financial-accounts";
import { parseCents } from "../../../lib/currency";
import { toast } from "../../../lib/toast";
import { ENTRY_REFETCH_QUERIES } from "../../../lib/money-queries";
import { CategoryField, ExtraToggle, FieldLabel, MoreOptions, NoteField, EntryFormLayout } from "../components/entry-form-parts";
import type { EntryFormParams } from "../entry-types";

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

interface AddExpenseFormProps {
  params?: EntryFormParams;
  /** Called once the entry is saved. */
  onDone: () => void;
}

/** The new-expense form: the sheet opened over the history, the invoice and the tabs. */
export function AddExpenseForm({ params, onDone }: AddExpenseFormProps) {
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
      categoryId: params?.categoryId ?? "",
      subcategoryId: params?.subcategoryId ?? "",
    },
  });

  const selectedCategoryId = watch("categoryId");
  const chosenAccountId = watch("accountId");
  const accountId = chosenAccountId === undefined ? defaultSpendingAccountId(accounts) : chosenAccountId;
  const account = accounts.find((a) => a.id === accountId) ?? null;
  const isCard = account?.kind === "credit_card";
  // Allowance and reserve accounts never touch the household budget.
  // Allowance and reserve money is separate from the household budget.
  const isPrivateAccount = account?.kind === "allowance" || account?.kind === "reserve";
  const installments = isCard ? watch("installments") ?? 1 : 1;
  const defaultInvoice = isCard && account?.closingDay ? invoiceMonthFor(watch("date"), account.closingDay) : "";
  const firstInvoice = watch("firstInvoice") || defaultInvoice;
  // A purchase placed on another invoice never touches today's limit.
  const isRetroactive = installments > 1 && firstInvoice !== defaultInvoice;
  const { data: billsData } = useRecurringBillsQuery();
  const quota = billsData?.recurringBills?.find(
    (b) => b?.kind === "quota" && !!b.subcategory?.id && b.subcategory.id === watch("subcategoryId"),
  );
  // Quota purchases were reserved among the fixed bills: the server keeps them out of the daily limit.
  const countsInBudget = watch("countsInBudget") && !isPrivateAccount && !isRetroactive && !quota;
  const amountValue = parseCents(watch("amount")) / 100;

  const [createExpense, { loading }] = useCreateExpenseMutation({
    onCompleted: () => { refetch(); toast.success("Gasto registrado"); onDone(); },
    onError: (error) => setError("root", { message: error.message }),
    refetchQueries: ENTRY_REFETCH_QUERIES,
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
    <EntryFormLayout
      error={errors.root?.message}
      submit={<Button label="Registrar gasto" onPress={handleSubmit(onSubmit)} isLoading={loading} />}
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
      {quota ? (
        <AppText variant="caption" style={styles.quotaNote}>
          Entra na cota "{quota.name}": abate do valor reservado no mês e não mexe no limite diário.
        </AppText>
      ) : null}

      <Controller
        control={control}
        name="accountId"
        render={({ field: { onChange } }) => (
          <AccountPicker label="Pago com" accounts={accounts} value={accountId} onChange={onChange} allowNone />
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

      <MoreOptions summary={isCard ? "Parcelas, orçamento, gasto extra, nota" : "Orçamento, gasto extra, nota"}>
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

        {isPrivateAccount || isRetroactive || quota ? null : (
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
              <ExtraToggle title="Gasto extra" value={value ?? false} onChange={onChange} />
            )}
          />
        ) : null}

        <Controller
          control={control}
          name="note"
          render={({ field: { onChange, onBlur, value } }) => (
            <NoteField value={value ?? ""} onChange={onChange} onBlur={onBlur} placeholder="Ex: almoço com amigos" />
          )}
        />
      </MoreOptions>

    </EntryFormLayout>
  );
}

const styles = StyleSheet.create({
  quotaNote: {
    marginTop: -8,
    marginBottom: 16,
  },
});
