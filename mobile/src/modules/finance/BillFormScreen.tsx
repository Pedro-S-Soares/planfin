import { ScrollView, View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import type * as yup from "yup";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import { CurrencyInput } from "../../components/CurrencyInput";
import { Button } from "../../components/ui/Button";
import { Chip } from "../../components/ui/Chip";
import { FieldInput } from "../../components/ui/FieldInput";
import {
  useCategoriesQuery,
  useCreateRecurringBillMutation,
  useDeleteRecurringBillMutation,
  useRecurringBillsQuery,
  useUpdateRecurringBillMutation,
  type RecurringBillsQuery,
} from "../../graphql/__generated__/hooks";
import { EditGate } from "../../components/ui/EditGate";
import { confirm } from "../../lib/alert";
import { displayToAPI, formatCents } from "../../lib/currency";
import { usePageTitle } from "../../hooks/usePageTitle";
import { billFormSchema } from "./bill-form-schema";
import { AccountPicker } from "./components/AccountPicker";
import { FormLabel } from "./components/FormLabel";
import { addMonths, formatMonth, formatShortDate, invoiceDueDate, invoiceMonthFor, monthOf, toNumber } from "./format";
import { toISODate } from "../../lib/date";
import { defaultSpendingAccountId, useFinancialAccounts, type FinancialAccount } from "./use-financial-accounts";
import type { AppStackParamList } from "../../../App";
import { categoryColor, palette } from "../../theme";
import { Text } from "../../components/ui/Text";
import { MonthStepper } from "../../components/ui/MonthStepper";
import { MONEY_QUERIES } from "../../lib/money-queries";

type BillFormValues = yup.InferType<typeof billFormSchema>;

/** Date of a one-off item and, on a card, the invoice it lands in: the plan counts it there. */
function oneOffLandingText(month: string, day: number, account: FinancialAccount | undefined, isIncome: boolean) {
  const [year, mon] = month.split("-").map(Number);
  const date = `${month}-${String(Math.min(day, new Date(year, mon, 0).getDate())).padStart(2, "0")}`;
  const when = `${formatShortDate(date)}/${year}`;
  if (isIncome) return `Entra em ${when}.`;
  if (account?.kind === "credit_card" && account.closingDay && account.dueDay) {
    const invoiceMonth = invoiceMonthFor(date, account.closingDay);
    const due = invoiceDueDate(invoiceMonth, account.closingDay, account.dueDay);
    const closing = `${invoiceMonth}-${String(account.closingDay).padStart(2, "0")}`;
    return `Compra em ${when}: entra na fatura que fecha em ${formatShortDate(closing)} e vence em ${formatShortDate(due)}.`;
  }
  return `Sai da conta em ${when}.`;
}

/** When the last month happens and when it stops, so the end can be checked against the invoice. */
function lastOccurrenceText(month: string, day: number, account: FinancialAccount | undefined, isIncome: boolean, isQuota: boolean) {
  const [year, mon] = month.split("-").map(Number);
  const date = `${month}-${String(Math.min(day, new Date(year, mon, 0).getDate())).padStart(2, "0")}`;
  const stops = `A partir de ${formatMonth(addMonths(month, 1))} não entra mais.`;
  if (isQuota) return `Última cota em ${formatMonth(month)}. ${stops}`;
  if (isIncome) return `Última entrada em ${formatShortDate(date)}/${year}. ${stops}`;
  if (account?.kind === "credit_card" && account.closingDay && account.dueDay) {
    const due = invoiceDueDate(invoiceMonthFor(date, account.closingDay), account.closingDay, account.dueDay);
    return `Última cobrança em ${formatShortDate(date)}/${year}, na fatura que vence em ${formatShortDate(due)}. ${stops}`;
  }
  return `Último pagamento em ${formatShortDate(date)}/${year}. ${stops}`;
}

type EditingBill = NonNullable<NonNullable<RecurringBillsQuery["recurringBills"]>[number]>;

export function BillFormScreen() {
  const { params } = useRoute<RouteProp<AppStackParamList, "BillForm">>();
  usePageTitle(params.billId ? "Planfin - Editar item planejado" : "Planfin - Novo item planejado");
  // Always ask the server: creating an item doesn't refresh this list (the query is skipped
  // then), so the cached one may not have the item being edited yet.
  const { data, loading, refetch } = useRecurringBillsQuery({ skip: !params.billId, fetchPolicy: "cache-and-network" });
  const editing = data?.recurringBills?.find((b) => b?.id === params.billId) ?? null;

  return (
    <EditGate
      id={params.billId}
      record={editing}
      loading={loading}
      onRetry={() => refetch()}
      missingMessage="Não achamos este item. Ele pode ter sido excluído."
    >
      {(bill) => <BillForm key={bill?.id ?? "new"} params={params} editing={bill} />}
    </EditGate>
  );
}

interface BillFormProps {
  params: AppStackParamList["BillForm"];
  /** The saved item, or null for a new one. */
  editing: EditingBill | null;
}

function BillForm({ params, editing }: BillFormProps) {
  const navigation = useNavigation();
  const { accounts } = useFinancialAccounts();
  const initialDirection = editing?.direction === "income" ? "income" : params.direction ?? "expense";
  const { data: catData } = useCategoriesQuery();
  const allCategories = catData?.categories?.filter((c) => c !== null) ?? [];

  // The form starts from the saved item: mounted only once it is loaded (see EditGate).
  const { control, handleSubmit, watch, setError, formState: { errors } } = useForm({
    resolver: yupResolver(billFormSchema),
    defaultValues: editing
      ? {
          name: editing.name ?? "",
          amount: formatCents(Math.round(toNumber(editing.amount) * 100)),
          dueDay: String(editing.dueDay ?? ""),
          accountId: editing.account?.id ?? null,
          categoryId: editing.subcategory?.categoryId ?? "",
          subcategoryId: editing.subcategory?.id ?? "",
          direction: initialDirection,
          onceMonth: editing.onceMonth ?? "",
          lastMonth: editing.lastMonth ?? "",
          kind: editing.kind === "quota" ? "quota" : "fixed",
        }
      : {
          name: "",
          amount: "0,00",
          dueDay: String(params.dueDay ?? 10),
          accountId: undefined,
          categoryId: "",
          subcategoryId: "",
          direction: initialDirection,
          onceMonth: params.once ? params.month ?? monthOf(new Date()) : "",
          lastMonth: "",
          kind: "fixed",
        },
  });
  const direction = watch("direction");
  const isIncome = direction === "income";
  const onceMonth = watch("onceMonth");
  const lastMonth = watch("lastMonth");
  const isQuota = !isIncome && watch("kind") === "quota";
  const categories = allCategories.filter((c) => c.type === (isIncome ? "income" : "expense"));
  const chosenAccount = watch("accountId");
  const defaultAccount = isIncome ? accounts.find((a) => a.isPrimary)?.id ?? null : defaultSpendingAccountId(accounts);
  const accountId = chosenAccount === undefined ? defaultAccount : chosenAccount;
  const subcategories = categories.find((c) => c.id === watch("categoryId"))?.subcategories?.filter((s) => s !== null) ?? [];
  // A quota on a card belongs to an invoice, not to a calendar month.
  const quotaCard = isQuota ? accounts.find((a) => a.id === accountId && a.kind === "credit_card") : undefined;
  const periodWord = quotaCard ? "fatura" : "mês";
  const currentPeriod = quotaCard?.closingDay
    ? invoiceMonthFor(toISODate(new Date()), quotaCard.closingDay)
    : monthOf(new Date());

  // Editing a paid one-off item also changes its entry (history, invoice, balances).
  const refetchQueries = MONEY_QUERIES;
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
      // A quota has no due date of its own: it is reserved for its whole invoice or month.
      dueDay: isQuota ? 1 : Number(values.dueDay),
      kind: isQuota ? "quota" : "fixed",
      accountId,
      subcategoryId: values.subcategoryId || null,
      direction: values.direction,
      onceMonth: values.onceMonth ?? "",
      lastMonth: values.onceMonth ? "" : values.lastMonth ?? "",
    };
    if (editing?.id) updateBill({ variables: { id: editing.id, ...variables } });
    else createBill({ variables });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: palette.sheet }} contentContainerStyle={{ padding: 18, paddingBottom: 32 }}>
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
              <Chip label={quotaCard ? "Toda fatura" : "Todo mês"} selected={!value} onPress={() => onChange("")} />
              <Chip
                label={quotaCard ? "Só uma fatura" : "Só um mês"}
                selected={!!value}
                onPress={() => onChange(value || currentPeriod)}
              />
            </View>
            {value ? (
              <View style={{ marginTop: 10 }}>
                <MonthStepper
                  label={quotaCard ? `Fatura de ${formatMonth(value)}` : formatMonth(value)}
                  onPrevious={() => onChange(addMonths(value, -1))}
                  onNext={() => onChange(addMonths(value, 1))}
                />
              </View>
            ) : null}
          </View>
        )}
      />
      {isIncome ? null : (
        <Controller
          control={control}
          name="kind"
          render={({ field: { onChange, value } }) => (
            <View style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: "row", gap: 7 }}>
                <Chip label="Valor fixo" selected={value !== "quota"} onPress={() => onChange("fixed")} />
                <Chip label="Cota de gasto" selected={value === "quota"} onPress={() => onChange("quota")} />
              </View>
              {value === "quota" && editing?.kind === "quota" && !editing.perInvoice ? (
                <Text style={{ fontSize: 12, color: palette.warning, marginTop: 8, lineHeight: 17 }}>
                  Esta cota está no formato antigo: soma sozinha as compras da categoria no mês. Ao salvar, ela passa a
                  valer por fatura e as compras novas entram nela só quando você escolher "Entra na cota". As compras
                  antigas continuam como estão.
                </Text>
              ) : null}
              {value === "quota" ? (
                <Text style={{ fontSize: 12, color: palette.muted, marginTop: 8, lineHeight: 17 }}>
                  Um valor reservado na {periodWord} e gasto aos poucos, como R$ 150 de lavagem do carro. Ao lançar uma
                  compra, escolha em "Entra na cota": ela abate da cota e não mexe no limite diário. O que passar da cota
                  sai do limite do dia; o que sobrar volta como dinheiro livre no ciclo seguinte. Nada é lançado sozinho.
                </Text>
              ) : null}
            </View>
          )}
        />
      )}
      {onceMonth ? null : (
        <Controller
          control={control}
          name="lastMonth"
          render={({ field: { onChange, value } }) => (
            <View style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: "row", gap: 7 }}>
                <Chip label="Sem fim" selected={!value} onPress={() => onChange("")} />
                <Chip label="Termina em" selected={!!value} onPress={() => onChange(value || monthOf(new Date()))} />
              </View>
              {value ? (
                <>
                  <View style={{ marginTop: 10 }}>
                    <MonthStepper label={formatMonth(value)} onPrevious={() => onChange(addMonths(value, -1))} onNext={() => onChange(addMonths(value, 1))} />
                  </View>
                  <Text style={{ fontSize: 12, color: palette.muted, marginTop: 6, lineHeight: 17 }}>
                    {lastOccurrenceText(value, Number(watch("dueDay")) || 1, accounts.find((a) => a.id === accountId), isIncome, isQuota)}
                  </Text>
                </>
              ) : null}
            </View>
          )}
        />
      )}
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
      <FormLabel>{isQuota ? `Cota da ${periodWord}` : onceMonth ? "Valor" : "Valor por mês (estimado)"}</FormLabel>
      <Controller
        control={control}
        name="amount"
        render={({ field: { onChange, value } }) => <CurrencyInput value={value} onChange={onChange} error={errors.amount?.message} />}
      />
      {isQuota ? null : (
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
      )}
      {onceMonth && !isQuota ? (
        <Text style={{ fontSize: 12, color: palette.accent, marginTop: -8, marginBottom: 16, lineHeight: 17 }}>
          {oneOffLandingText(onceMonth, Number(watch("dueDay")) || 1, accounts.find((a) => a.id === accountId), isIncome)}
        </Text>
      ) : null}
      <Controller
        control={control}
        name="accountId"
        render={({ field: { onChange } }) => (
          <AccountPicker
            label={isIncome ? "Entra na conta" : isQuota ? "Cartão ou conta da cota" : "Como é paga"}
            accounts={accounts}
            value={accountId}
            onChange={onChange}
            kinds={isIncome ? ["checking", "reserve", "benefit"] : ["checking", "credit_card"]}
          />
        )}
      />
      {isIncome || isQuota ? null : (
        <Text style={{ fontSize: 12, color: palette.muted, marginTop: -8, marginBottom: 16 }}>
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
              <FormLabel>{`Subcategoria de ${categories.find((c) => c.id === watch("categoryId"))?.name ?? "categoria"}`}</FormLabel>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7 }}>
                {subcategories.map((sub) => (
                  <Chip key={sub.id ?? ""} label={sub.name ?? ""} selected={value === sub.id} onPress={() => onChange(value === sub.id ? "" : sub.id)} />
                ))}
              </View>
            </View>
          )}
        />
      ) : null}

      {errors.root ? <Text style={{ color: palette.danger, textAlign: "center", marginBottom: 12 }}>{errors.root.message}</Text> : null}
      <Button label={editing ? "Salvar" : "Adicionar"} onPress={handleSubmit(onSubmit)} isLoading={creating || updating} />
      {editing?.id ? (
        <View style={{ marginTop: 10 }}>
          <Button
            label="Excluir"
            variant="destructive"
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
