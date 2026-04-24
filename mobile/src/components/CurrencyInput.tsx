import { useState } from "react";
import { TextInput, Text, View } from "react-native";
import { formatCents } from "../lib/currency";
import { Colors, Radius, Shadow } from "../theme/tokens";

interface CurrencyInputProps {
  value: string;
  onChange: (formatted: string) => void;
  error?: string;
  autoFocus?: boolean;
}

export function CurrencyInput({ value, onChange, error, autoFocus }: CurrencyInputProps) {
  const [focused, setFocused] = useState(false);

  const handleChangeText = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    const cents = parseInt(digits, 10) || 0;
    onChange(formatCents(cents));
  };

  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        height: 52,
        borderRadius: Radius.md,
        borderWidth: 1.5,
        borderColor: error ? Colors.danger : focused ? Colors.primary : Colors.border,
        backgroundColor: Colors.surface,
        paddingHorizontal: 16,
        ...Shadow.xs,
      }}>
        <Text style={{ fontSize: 16, color: Colors.textSec, fontWeight: "600", marginRight: 4 }}>R$</Text>
        <TextInput
          style={{ flex: 1, fontSize: 16, color: Colors.text }}
          value={value}
          onChangeText={handleChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          keyboardType="number-pad"
          autoFocus={autoFocus}
          selection={{ start: value.length, end: value.length }}
          placeholderTextColor={Colors.textTer}
        />
      </View>
      {error && <Text style={{ marginTop: 5, fontSize: 12, color: Colors.danger }}>{error}</Text>}
    </View>
  );
}
