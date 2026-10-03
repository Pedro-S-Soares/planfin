import { View } from "react-native";
import { Chip } from "../../../components/ui/Chip";
import { Colors } from "../../../theme/tokens";
import { ACCOUNT_KIND_ICON, type AccountKind } from "../format";
import type { FinancialAccount } from "../use-financial-accounts";
import { FormLabel } from "./FormLabel";

type AccountPickerProps = {
  label?: string;
  accounts: FinancialAccount[];
  value: string | null;
  onChange: (id: string | null) => void;
  /** Restrict the options to these kinds. */
  kinds?: AccountKind[];
  /** Allow clearing the selection ("Sem conta"). */
  allowNone?: boolean;
};

export function AccountPicker({ label = "Pago com", accounts, value, onChange, kinds, allowNone }: AccountPickerProps) {
  const options = kinds ? accounts.filter((a) => kinds.includes(a.kind)) : accounts;
  if (options.length === 0) return null;

  return (
    <View style={{ marginBottom: 16 }}>
      <FormLabel>{label}</FormLabel>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7 }}>
        {options.map((account) => (
          <Chip
            key={account.id}
            label={`${ACCOUNT_KIND_ICON[account.kind]} ${account.name}`}
            selected={value === account.id}
            onPress={() => onChange(account.id)}
          />
        ))}
        {allowNone ? (
          <Chip label="Sem conta" selected={value === null} dot={Colors.textTer} onPress={() => onChange(null)} />
        ) : null}
      </View>
    </View>
  );
}
