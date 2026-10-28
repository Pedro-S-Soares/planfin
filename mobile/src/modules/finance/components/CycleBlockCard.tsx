import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { Card } from "../../../components/ui/Card";
import { useCurrency } from "../../../context/CurrencyContext";
import type { CycleBlockFieldsFragment } from "../../../graphql/__generated__/hooks";
import { Colors, Radius } from "../../../theme/tokens";
import { formatMoney, formatShortDate, toNumber } from "../format";
import { DailyGoalForm } from "./DailyGoalForm";
import { PartnerIncomeRow } from "./PartnerIncomeRow";
import { PlanSection, type PlanLine } from "./PlanSection";

type CycleBlockCardProps = {
  block: CycleBlockFieldsFragment;
  cardName: string;
  today: string;
  /** Extra actions under the result (links to add one-off items). */
  footer?: ReactNode;
};

const lines = (items: (PlanLine | null)[] | null | undefined): PlanLine[] =>
  (items ?? []).filter((i): i is PlanLine => i !== null);

function headerTexts(block: CycleBlockFieldsFragment, cardName: string) {
  const due = formatShortDate(block.dueDate);
  const salary = formatShortDate(block.salaryDate);

  switch (block.status) {
    case "open":
      return {
        title: `FATURA ATUAL · ${cardName}`,
        subtitle: `Compras até ${formatShortDate(block.lastPurchaseDate)} · vence ${due} · paga com o salário de ${salary}`,
        resultLabel: `AINDA DÁ PARA GASTAR ATÉ ${formatShortDate(block.lastPurchaseDate)}`,
      };
    case "closed":
      return {
        title: `FATURA FECHADA · ${cardName}`,
        subtitle: `Vence ${due} · paga com o salário de ${salary}`,
        resultLabel: `SOBRA ATÉ ${formatShortDate(block.windowEnd)}`,
      };
    default:
      return {
        title: `PRÓXIMA FATURA · ${cardName}`,
        subtitle: `Compras de ${formatShortDate(block.purchaseStart)} a ${formatShortDate(block.lastPurchaseDate)} · vence ${due} · paga com o salário de ${salary}`,
        resultLabel: "LIVRE PARA GASTOS VARIÁVEIS NO CICLO",
      };
  }
}

/** One invoice of the cycle card and the money that pays it, as on paper. */
export function CycleBlockCard({ block, cardName, today, footer }: CycleBlockCardProps) {
  const { currency } = useCurrency();
  const money = (v: number | string | null | undefined) => formatMoney(v, currency.symbol);
  const { title, subtitle, resultLabel } = headerTexts(block, cardName);
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

  return (
    <Card padding={16} style={{ marginBottom: 12 }}>
      <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.textSec, letterSpacing: 0.7 }}>{title}</Text>
      <Text style={{ fontSize: 12, color: Colors.textTer, marginBottom: 2 }}>{subtitle}</Text>
      <Text style={{ fontSize: 11, color: Colors.textTer, marginBottom: 6 }}>
        Conta até {formatShortDate(block.windowEnd)}, véspera do salário seguinte
      </Text>

      {block.balance != null ? (
        <PlanSection sign="+" title="Saldo na conta" items={[{ label: "Conta principal", date: today, amount: block.balance }]} hideCount />
      ) : null}
      <PlanSection sign="+" title={block.status === "next" ? "Salário" : "Salário a receber"} items={lines(block.salaries)} emptyText="—" />
      <PartnerIncomeRow month={salaryMonth} partner={block.partner} />
      {incomes.length > 0 ? <PlanSection sign="+" title="Entradas previstas" items={incomes} /> : null}
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
      {installments.length > 0 ? <PlanSection sign="−" title={`Parcelas no ${cardName}`} items={installments} /> : null}
      {otherCards.length > 0 ? <PlanSection sign="−" title="Outros cartões" items={otherCards} /> : null}
      <PlanSection sign="−" title="Fixas no boleto" items={lines(block.fixedBills)} emptyText="—" />
      {oneOffBills.length > 0 ? <PlanSection sign="−" title="Gastos avulsos no boleto" items={oneOffBills} /> : null}

      <View style={{ marginTop: 10, borderRadius: Radius.md, padding: 12, backgroundColor: isPositive ? Colors.successLight : Colors.dangerLight }}>
        <Text style={{ fontSize: 11, fontWeight: "700", color: isPositive ? Colors.successText : Colors.danger, letterSpacing: 0.6 }}>
          {resultLabel}
        </Text>
        <Text style={{ fontSize: 24, fontWeight: "800", color: isPositive ? Colors.successText : Colors.danger }}>{money(result)}</Text>
        <Text style={{ fontSize: 12, color: Colors.textSec, marginTop: 2 }}>
          {!isPositive
            ? `Faltam ${money(-result)} para pagar tudo até ${formatShortDate(block.windowEnd)}.`
            : isClosed
              ? `Mesada: ${money(result / 2)} para cada um.`
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
    </Card>
  );
}
