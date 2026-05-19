import { Text, TouchableOpacity, View } from "react-native";
import { Colors, Radius } from "../../theme/tokens";
import { categoryColor } from "../../theme/tokens";
import { useCurrency } from "../../context/CurrencyContext";

interface ExpenseItem {
  id: string;
  amount: string;
  type?: string | null;
  subcategory?: { name: string } | null;
  note?: string | null;
  createdBy?: { id: string; email: string } | null;
}

interface ExpenseRowProps {
  item: ExpenseItem;
  onPress?: () => void;
  onDelete?: (id: string) => void;
  authorLabel?: string | null;
}

export function ExpenseRow({ item, onPress, onDelete, authorLabel }: ExpenseRowProps) {
  const { currency } = useCurrency();
  const cc = categoryColor(item.subcategory?.name ?? "");
  const isIncome = item.type === "income";

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
        <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: isIncome ? Colors.success : cc.dot }} />
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: Colors.text }} numberOfLines={1}>
            {item.subcategory?.name ?? "Sem categoria"}
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
        {(authorLabel || item.note) ? (
          <Text style={{ fontSize: 12, color: Colors.textSec, marginTop: 1 }} numberOfLines={1}>
            {[authorLabel, item.note].filter(Boolean).join(" · ")}
          </Text>
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
