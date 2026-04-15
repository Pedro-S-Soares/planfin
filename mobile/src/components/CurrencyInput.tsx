import { TextInput, Text, View } from "react-native";
import { formatCents } from "../lib/currency";

interface CurrencyInputProps {
  value: string;
  onChange: (formatted: string) => void;
  error?: string;
  autoFocus?: boolean;
}

export function CurrencyInput({ value, onChange, error, autoFocus }: CurrencyInputProps) {
  const handleChangeText = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    const cents = parseInt(digits, 10) || 0;
    onChange(formatCents(cents));
  };

  return (
    <View className="mb-5">
      <View className={`flex-row items-center border rounded-lg px-3 ${error ? "border-red-500" : "border-neutral-300"}`}>
        <Text className="text-base text-neutral-500 mr-1">R$</Text>
        <TextInput
          className="flex-1 text-base py-3"
          value={value}
          onChangeText={handleChangeText}
          keyboardType="number-pad"
          autoFocus={autoFocus}
          selection={{ start: value.length, end: value.length }}
        />
      </View>
      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
    </View>
  );
}
