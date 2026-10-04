import { Text, TouchableOpacity, View } from "react-native";
import { Colors, Radius } from "../../theme/tokens";
import { categoryColor } from "../../theme/tokens";
import { CategoryIcon } from "./CategoryIcon";
import { useCurrency } from "../../context/CurrencyContext";

interface ExpenseItem {
  id: string;
  amount: string;
  type?: string | null;
  subcategory?: {
    name?: string | null;
    category?: { name?: string | null; icon?: string | null } | null;
  } | null;
  note?: string | null;
  createdBy?: { id?: string | null; email?: string | null } | null;
  countsInBudget?: boolean | null;
  source?: string | null;
  installmentNumber?: number | null;
  installmentCount?: number | null;
  account?: { name?: string | null; kind?: string | null } | null;
}

interface ExpenseRowProps {
  item: ExpenseItem;
  onPress?: () => void;
  onDelete?: (id: string) => void;
  authorLabel?: string | null;
}

export function ExpenseRow({ item, onPress, onDelete, authorLabel }: ExpenseRowProps) {
  const { currency } = useCurrency();
  const colorKey = item.subcategory?.category?.name ?? item.subcategory?.name ?? "";
  const cc = categoryColor(colorKey);
  const isIncome = item.type === "income";
  const details = [
    authorLabel,
    item.installmentCount ? `${item.installmentNumber}/${item.installmentCount}` : null,
    item.account?.name ? `${item.account.kind === "credit_card" ? "💳" : "🏦"} ${item.account.name}` : null,
    item.note,
  ].filter(Boolean);
  const isOutsideBudget = item.countsInBudget === false;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 11,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
      }}
    >
      <View style={{
        width: 36,
        height: 36,
        borderRadius: Radius.sm,
        backgroundColor: isIncome ? Colors.successLight : cc.bg,
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
        <CategoryIcon
          icon={item.subcategory?.category?.icon}
          name={colorKey}
          size={18}
          color={isIncome ? Colors.success : cc.dot}
        />
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: Colors.text }} numberOfLines={1}>
            {item.source === "invoice_adjustment" ? "Ajuste da fatura" : item.subcategory?.name ?? "Sem categoria"}
          </Text>
          {isIncome && (
            <View style={{
              backgroundColor: Colors.successLight,
              borderRadius: 4,
              paddingHorizontal: 5,
              paddingVertical: 1,
            }}>
              <Text style={{ fontSize: 10, fontWeight: "700", color: Colors.successText }}>Receita</Text>
            </View>
          )}
        </View>
        {details.length > 0 ? (
          <Text style={{ fontSize: 12, color: Colors.textSec, marginTop: 1 }} numberOfLines={1}>
            {details.join(" · ")}
          </Text>
        ) : null}
        {isOutsideBudget ? (
          <Text style={{ fontSize: 11, color: Colors.textTer, marginTop: 1 }}>Fora do orçamento do dia</Text>
        ) : null}
      </View>

      <Text style={{ fontSize: 15, fontWeight: "700", color: isIncome ? Colors.success : Colors.text, flexShrink: 0, marginRight: onDelete ? 8 : 0 }}>
        {isIncome ? "+" : ""}{currency.symbol} {parseFloat(item.amount).toFixed(2).replace(".", ",")}
      </Text>

      {onDelete && (
        <TouchableOpacity
          onPress={() => onDelete(item.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{
            width: 26,
            height: 26,
            borderRadius: 999,
            backgroundColor: Colors.dangerLight,
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Text style={{ color: Colors.danger, fontSize: 12, fontWeight: "700", lineHeight: 14 }}>✕</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}
