import { StyleSheet, View } from "react-native";
import { Chip } from "../../../components/ui/Chip";
import { palette, space } from "../../../theme";
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
    <View style={styles.root}>
      <FormLabel>{label}</FormLabel>
      <View style={styles.chips}>
        {options.map((account) => (
          <Chip
            key={account.id}
            label={account.name}
            icon={ACCOUNT_KIND_ICON[account.kind]}
            selected={value === account.id}
            onPress={() => onChange(account.id)}
          />
        ))}
        {allowNone ? (
          <Chip label="Sem conta" selected={value === null} dot={palette.muted} onPress={() => onChange(null)} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginBottom: space.lg,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
  },
});
