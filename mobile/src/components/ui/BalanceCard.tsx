import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Radius } from "../../theme/tokens";
import { useCurrency } from "../../context/CurrencyContext";

interface BalanceCardProps {
  available: string;
  spent: string;
  dailyLimit: string;
  isPositive: boolean;
}

export function BalanceCard({ available, spent, dailyLimit, isPositive }: BalanceCardProps) {
  const { currency } = useCurrency();
  const sym = currency.symbol;

  const gradColors = isPositive
    ? ([Colors.gradStart, Colors.gradEnd] as const)
    : ([Colors.dangerGradStart, Colors.dangerGradEnd] as const);

  const shadowColor = isPositive ? Colors.fabShadow : "rgba(229,57,43,0.35)";

  const fmt = (v: string) => parseFloat(v || "0").toFixed(2).replace(".", ",");
  const availNum = parseFloat(available || "0");
  const displayAvail = Math.abs(availNum).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <LinearGradient
      colors={gradColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderRadius: Radius.xl,
        padding: 22,
        shadowColor,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 1,
        shadowRadius: 28,
        elevation: 8,
        overflow: "hidden",
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.75)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 }}>
        Disponível hoje
      </Text>

      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 2, marginBottom: 14 }}>
        <Text style={{ fontSize: 16, fontWeight: "700", color: "rgba(255,255,255,0.8)", paddingTop: 6, marginRight: 2 }}>
          {!isPositive ? "- " : ""}{sym}
        </Text>
        <Text style={{ fontSize: 48, fontWeight: "800", color: "#fff", letterSpacing: -1.5, lineHeight: 56 }}>
          {displayAvail}
        </Text>
      </View>

      <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
        <View>
          <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>
            Gasto hoje
          </Text>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#fff" }}>
            {sym} {fmt(spent)}
          </Text>
        </View>
        <View style={{ width: 1, height: 32, backgroundColor: "rgba(255,255,255,0.2)" }} />
        <View>
          <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>
            Limite diário
          </Text>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#fff" }}>
            {sym} {fmt(dailyLimit)}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}
