import { ScrollView, Text, View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import { CurrencyInput } from "../../components/CurrencyInput";
import { Btn } from "../../components/ui/Btn";
import { Chip } from "../../components/ui/Chip";
import { FieldInput } from "../../components/ui/FieldInput";
import { useGroup } from "../../context/GroupContext";
import {
  useCreateFinancialAccountMutation,
  useGroupMembersQuery,
  useUpdateFinancialAccountMutation,
} from "../../graphql/__generated__/hooks";
import { displayToAPI, formatCents, parseCents } from "../../lib/currency";
import { toISODate } from "../../lib/date";
import { usePageTitle } from "../../hooks/usePageTitle";
import { Colors } from "../../theme/tokens";
import { accountFormSchema, type AccountFormValues } from "./account-form-schema";
import { FormLabel } from "./components/FormLabel";
import { ToggleRow } from "./components/ToggleRow";
import { ACCOUNT_KIND_ICON, ACCOUNT_KIND_LABEL, signedApiAmount, toNumber, type AccountKind } from "./format";
import { useFinancialAccounts } from "./use-financial-accounts";
import type { AppStackParamList } from "../../../App";

const KINDS: AccountKind[] = ["checking", "credit_card", "benefit", "allowance", "reserve"];

const KIND_HINT: Record<AccountKind, string> = {
  checking: "Onde cai o salário e saem os boletos.",
  credit_card: "As compras viram fatura; ela é paga com a conta.",
  allowance: "Conta pessoal de um de vocês. Gastos aqui não entram no orçamento da casa.",
  reserve: "Reserva de emergência ou investimento. Fica fora do orçamento.",
  benefit: "Vale alimentação ou refeição: saldo próprio que recebe um crédito todo mês. Fica fora do limite diário.",
};

export function AccountFormScreen() {
  const navigation = useNavigation();
  const { params } = useRoute<RouteProp<AppStackParamList, "AccountForm">>();
  const { accounts } = useFinancialAccounts();
  const editing = params.accountId ? accounts.find((a) => a.id === params.accountId) ?? null : null;
  usePageTitle(editing ? "Planfin - Editar conta" : "Planfin - Nova conta");

  const { activeGroup } = useGroup();
  const { data: membersData } = useGroupMembersQuery({
    variables: { groupId: activeGroup?.id ?? "" },
    skip: !activeGroup?.id,
  });
  const members = membersData?.groupMembers?.filter((m) => m !== null) ?? [];

  const { control, handleSubmit, watch, setError, formState: { errors } } = useForm({
    resolver: yupResolver(accountFormSchema),
    values: editing
      ? {
          name: editing.name,
          kind: editing.kind,
          balance: "0,00",
          isNegative: false,
          closingDay: editing.closingDay ? String(editing.closingDay) : "",
          dueDay: editing.dueDay ? String(editing.dueDay) : "",
          ownerUserId: editing.owner?.id ?? null,
          monthlyCredit: formatCents(Math.round(toNumber(editing.monthlyCredit) * 100)),
          creditDay: editing.creditDay ? String(editing.creditDay) : "",
        }
      : undefined,
    defaultValues: {
      name: "",
      kind: params.kind ?? "checking",
      balance: "0,00",
      isNegative: false,
      closingDay: "5",
      dueDay: "15",
      ownerUserId: null,
      monthlyCredit: "0,00",
      creditDay: "1",
    },
  });
  const kind = watch("kind");

  const refetchQueries = ["FinancialAccounts", "Invoices"];
  const onError = (error: Error) => setError("root", { message: error.message });
  const onCompleted = () => navigation.goBack();
  const [createAccount, { loading: creating }] = useCreateFinancialAccountMutation({ refetchQueries, onError, onCompleted });
  const [updateAccount, { loading: updating }] = useUpdateFinancialAccountMutation({ refetchQueries, onError, onCompleted });

  const onSubmit = (values: AccountFormValues) => {
    const isCard = values.kind === "credit_card";
    const days = isCard
      ? { closingDay: Number(values.closingDay), dueDay: Number(values.dueDay) }
      : { closingDay: null, dueDay: null };
    const ownerUserId = values.kind === "allowance" ? values.ownerUserId ?? null : null;
    const hasCredit = values.kind === "benefit" && parseCents(values.monthlyCredit) > 0;
    const credit = {
      monthlyCredit: hasCredit ? displayToAPI(values.monthlyCredit) : null,
      creditDay: hasCredit ? Number(values.creditDay) : null,
    };

    if (editing) {
      updateAccount({ variables: { id: editing.id, name: values.name, ownerUserId, ...days, ...credit } });
      return;
    }
    createAccount({
      variables: {
        name: values.name,
        kind: values.kind,
        balance: isCard ? null : signedApiAmount(displayToAPI(values.balance), values.isNegative),
        ownerUserId,
        today: toISODate(new Date()),
        ...days,
        ...credit,
      },
    });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.surface }} contentContainerStyle={{ padding: 18, paddingBottom: 32 }}>
      {editing ? null : (
        <Controller
          control={control}
          name="kind"
          render={({ field: { onChange, value } }) => (
            <View style={{ marginBottom: 16 }}>
              <FormLabel>Tipo</FormLabel>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7 }}>
                {KINDS.map((k) => (
                  <Chip key={k} label={`${ACCOUNT_KIND_ICON[k]} ${ACCOUNT_KIND_LABEL[k]}`} selected={value === k} onPress={() => onChange(k)} />
                ))}
              </View>
              <Text style={{ fontSize: 12, color: Colors.textSec, marginTop: 8 }}>{KIND_HINT[value]}</Text>
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
            placeholder={kind === "credit_card" ? "Ex: Nubank" : "Ex: Conta Itaú"}
          />
        )}
      />

      {kind === "credit_card" ? (
        <View style={{ flexDirection: "row", gap: 12 }}>
          {(["closingDay", "dueDay"] as const).map((field) => (
            <View key={field} style={{ flex: 1 }}>
              <Controller
                control={control}
                name={field}
                render={({ field: { onChange, value } }) => (
                  <FieldInput
                    label={field === "closingDay" ? "Fecha no dia" : "Vence no dia"}
                    value={value ?? ""}
                    onChange={(v) => onChange(v.replace(/\D/g, "").slice(0, 2))}
                    keyboardType="number-pad"
                    error={errors[field]?.message}
                  />
                )}
              />
            </View>
          ))}
        </View>
      ) : null}

      {kind === "benefit" ? (
        <>
          <FormLabel>Crédito por mês</FormLabel>
          <Controller
            control={control}
            name="monthlyCredit"
            render={({ field: { onChange, value } }) => <CurrencyInput value={value} onChange={onChange} />}
          />
          <Controller
            control={control}
            name="creditDay"
            render={({ field: { onChange, value } }) => (
              <FieldInput
                label="Cai todo dia"
                value={value ?? ""}
                onChange={(v) => onChange(v.replace(/\D/g, "").slice(0, 2))}
                keyboardType="number-pad"
                error={errors.creditDay?.message}
                hint="O crédito entra sozinho no saldo nesse dia."
              />
            )}
          />
        </>
      ) : null}

      {!editing && kind !== "credit_card" ? (
        <>
          <FormLabel>Saldo hoje</FormLabel>
          <Controller
            control={control}
            name="balance"
            render={({ field: { onChange, value } }) => <CurrencyInput value={value} onChange={onChange} />}
          />
          <Controller
            control={control}
            name="isNegative"
            render={({ field: { onChange, value } }) => (
              <ToggleRow
                title="Saldo negativo"
                description="Ative se a conta está no cheque especial"
                value={value}
                onChange={onChange}
              />
            )}
          />
        </>
      ) : null}

      {kind === "allowance" && members.length > 0 ? (
        <Controller
          control={control}
          name="ownerUserId"
          render={({ field: { onChange, value } }) => (
            <View style={{ marginBottom: 16 }}>
              <FormLabel>De quem é</FormLabel>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7 }}>
                {members.map((m) => (
                  <Chip
                    key={String(m.id)}
                    label={m.email?.split("@")[0] ?? "—"}
                    selected={value === String(m.id)}
                    onPress={() => onChange(String(m.id))}
                  />
                ))}
              </View>
            </View>
          )}
        />
      ) : null}

      {errors.root ? (
        <Text style={{ color: Colors.danger, fontSize: 13, textAlign: "center", marginBottom: 12 }}>{errors.root.message}</Text>
      ) : null}

      <Btn label={editing ? "Salvar" : "Adicionar"} onPress={handleSubmit(onSubmit)} loading={creating || updating} />
    </ScrollView>
  );
}
