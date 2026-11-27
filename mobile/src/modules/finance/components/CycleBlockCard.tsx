import type { ReactNode } from "react";
import { View } from "react-native";
import { Block } from "../../../components/ui/Block";
import { useCurrency } from "../../../context/CurrencyContext";
import type { CycleBlockFieldsFragment } from "../../../graphql/__generated__/hooks";
import { formatMoney, formatShortDate, toNumber } from "../format";
import { DailyGoalForm } from "./DailyGoalForm";
import { PartnerIncomeRow } from "./PartnerIncomeRow";
import { PlanSection, type PlanLine } from "./PlanSection";
import { palette, radius } from "../../../theme";
import { Text } from "../../../components/ui/Text";

type CycleBlockCardProps = {
  block: CycleBlockFieldsFragment;
  cardName: string;
  today: string;
  /** Extra actions under the result (links to add one-off items). */
  footer?: ReactNode;
  /** The next invoice already takes today's purchases (the current one closed). */
  isTakingPurchases?: boolean;
};

const lines = (items: (PlanLine | null)[] | null | undefined): PlanLine[] =>
  (items ?? []).filter((i): i is PlanLine => i !== null);

function headerTexts(block: CycleBlockFieldsFragment, cardName: string, isTakingPurchases: boolean) {
  const due = formatShortDate(block.dueDate);
  const salary = formatShortDate(block.salaryDate);

  switch (block.status) {
    case "open":
      return {
        title: `Fatura atual · ${cardName}`,
        subtitle: `Compras até ${formatShortDate(block.lastPurchaseDate)} · vence ${due} · paga com o salário de ${salary}`,
        resultLabel: `Ainda dá para gastar até ${formatShortDate(block.lastPurchaseDate)}`,
      };
    case "closed":
      return {
        title: `Fatura fechada · ${cardName}`,
        subtitle: `Vence ${due} · paga com o salário de ${salary}`,
        resultLabel: `Sobra até ${formatShortDate(block.windowEnd)}`,
      };
    default:
      return {
        title: `${isTakingPurchases ? "Fatura aberta" : "Próxima fatura"} · ${cardName}`,
        subtitle: `Compras de ${formatShortDate(block.purchaseStart)} a ${formatShortDate(block.lastPurchaseDate)} · vence ${due} · paga com o salário de ${salary}`,
        resultLabel: "Livre para gastos variáveis no ciclo",
      };
  }
}

/** One invoice of the cycle card and the money that pays it, as on paper. */
export function CycleBlockCard({ block, cardName, today, footer, isTakingPurchases = false }: CycleBlockCardProps) {
  const { currency } = useCurrency();
  const money = (v: number | string | null | undefined) => formatMoney(v, currency.symbol);
  const { title, subtitle, resultLabel } = headerTexts(block, cardName, isTakingPurchases);
  const result = toNumber(block.result);
  const isPositive = result >= 0;
  const isClosed = block.status === "closed";
  const salaryMonth = (block.salaryDate ?? today).slice(0, 7);
  const incomes = lines(block.incomes);
  const benefits = lines(block.benefits);
  const installments = lines(block.installments);
  const otherCards = lines(block.otherCards);
  const oneOffBills = lines(block.oneOffBills);
  const days = block.days ?? 0;
  const carry = block.carry;
  const quotaLeftovers = lines(block.quotaLeftovers);
  // Open invoice: what is left of each quota (the purchases are already in the invoice);
  // next invoice: the full value.
  const quotas: PlanLine[] = (block.quotas ?? []).flatMap((q) =>
    q
      ? [
          {
            label:
              block.status === "open"
                ? `${q.label} · gasto ${money(q.spent)} de ${money(q.planned)}`
                : q.label ?? "",
            date: q.date,
            amount: q.amount,
          },
        ]
      : [],
  );
  const carryAmount = toNumber(carry?.amount);

  return (
    <Block padding={16} style={{ marginBottom: 12 }}>
      <Text style={{ fontSize: 12, fontWeight: "700", color: palette.muted }}>{title}</Text>
      <Text style={{ fontSize: 12, color: palette.muted, marginBottom: 2 }}>{subtitle}</Text>
      <Text style={{ fontSize: 12, color: palette.muted, marginBottom: 6 }}>
        Conta até {formatShortDate(block.windowEnd)}, véspera do salário seguinte
      </Text>

      {block.balance != null ? (
        <PlanSection sign="+" title="Saldo na conta" items={[{ label: "Conta principal", date: today, amount: block.balance }]} hideCount />
      ) : null}
      {carry ? (
        <PlanSection
          sign={carryAmount >= 0 ? "+" : "−"}
          title={carryAmount >= 0 ? "Sobra da fatura fechada" : "Falta da fatura fechada"}
          items={[{ ...carry, amount: String(Math.abs(carryAmount)) }]}
          hideCount
        />
      ) : null}
      {quotaLeftovers.length > 0 ? (
        <View style={{ marginTop: -4, marginBottom: 8, gap: 2 }}>
          {quotaLeftovers.map((l) => (
            <Text key={l.label} style={{ fontSize: 12, color: palette.income }}>
              inclui {l.label}: {money(l.amount)}
            </Text>
          ))}
        </View>
      ) : null}
      <PlanSection sign="+" title={block.status === "next" ? "Salário" : "Salário a receber"} items={lines(block.salaries)} emptyText="—" />
      <PartnerIncomeRow month={salaryMonth} partner={block.partner} />
      <PlanSection sign="+" title="Entradas previstas" items={incomes} emptyText="—" />
      {benefits.length > 0 ? <PlanSection sign="+" title="Vale alimentação" items={benefits} /> : null}

      {block.invoice ? (
        <PlanSection sign="−" title={`Fatura ${cardName}${isClosed ? "" : " até agora"}`} items={[block.invoice]} hideCount />
      ) : null}
      {!isClosed ? (
        <PlanSection
          sign="−"
          title={block.status === "open" ? "Fixas que ainda entram na fatura" : `Fixas no ${cardName}`}
          items={lines(block.cardBills)}
          emptyText="—"
        />
      ) : null}
      {quotas.length > 0 ? (
        <PlanSection
          sign="−"
          title={block.status === "open" ? "Cotas da fatura (o que resta)" : "Cotas da fatura"}
          items={quotas}
        />
      ) : null}
      {installments.length > 0 ? <PlanSection sign="−" title={`Parcelas no ${cardName}`} items={installments} /> : null}
      {otherCards.length > 0 ? <PlanSection sign="−" title="Outros cartões" items={otherCards} /> : null}
      <PlanSection sign="−" title="Fixas no boleto" items={lines(block.fixedBills)} emptyText="—" />
      <PlanSection sign="−" title="Gastos avulsos" items={oneOffBills} emptyText="—" />

      <View style={{ marginTop: 10, borderRadius: radius.control, padding: 12, backgroundColor: isPositive ? palette.incomeSoft : palette.dangerSoft }}>
        <Text style={{ fontSize: 12, fontWeight: "700", color: isPositive ? palette.income : palette.danger }}>
          {resultLabel}
        </Text>
        <Text style={{ fontSize: 24, fontWeight: "800", color: isPositive ? palette.income : palette.danger }}>{money(result)}</Text>
        <Text style={{ fontSize: 12, color: palette.muted, marginTop: 2 }}>
          {!isPositive
            ? `Faltam ${money(-result)} para pagar tudo até ${formatShortDate(block.windowEnd)}.`
            : isClosed
              ? "Entra como sobra na fatura aberta, onde a mesada vira gasto avulso."
              : `${money(result / Math.max(days, 1))} por dia nos ${days} ${days === 1 ? "dia" : "dias"} de compra até o fechamento.`}
        </Text>
      </View>
      {footer}

      {!isClosed && block.goalStart && block.lastPurchaseDate && days > 0 ? (
        <DailyGoalForm
          available={result}
          days={days}
          startDate={block.goalStart}
          endDate={block.lastPurchaseDate}
          today={today}
        />
      ) : null}
    </Block>
  );
}
