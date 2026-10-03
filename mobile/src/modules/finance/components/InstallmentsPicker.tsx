import { Text, View } from "react-native";
import { Chip } from "../../../components/ui/Chip";
import { useCurrency } from "../../../context/CurrencyContext";
import { Colors } from "../../../theme/tokens";
import { formatMoney } from "../format";
import { FormLabel } from "./FormLabel";

const OPTIONS = [1, 2, 3, 4, 5, 6, 8, 10, 12];

type InstallmentsPickerProps = {
  value: number;
  onChange: (value: number) => void;
  /** Purchase total, to preview the parcel value. */
  total: number;
};

export function InstallmentsPicker({ value, onChange, total }: InstallmentsPickerProps) {
  const { currency } = useCurrency();
  const parcel = value > 1 ? total / value : total;

  return (
    <View style={{ marginBottom: 16 }}>
      <FormLabel>Parcelas</FormLabel>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7 }}>
        {OPTIONS.map((n) => (
          <Chip key={n} label={n === 1 ? "À vista" : `${n}x`} selected={value === n} onPress={() => onChange(n)} />
        ))}
      </View>
      {value > 1 ? (
        <Text style={{ fontSize: 12, color: Colors.textSec, marginTop: 8 }}>
          {value}x de {formatMoney(parcel, currency.symbol)}. Só a 1ª parcela entra no limite de hoje; as outras
          caem nas próximas faturas e são descontadas dos próximos ciclos.
        </Text>
      ) : null}
    </View>
  );
}
