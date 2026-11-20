import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { formatCents } from "../lib/currency";
import { palette, radius, space, tabularNums, textVariants } from "../theme";
import { AppText } from "./ui/AppText";

interface CurrencyInputProps {
  value: string;
  onChange: (formatted: string) => void;
  error?: string;
  autoFocus?: boolean;
}

/** Amount field: typed digits fill from the cents up ("1" → "0,01"), in tabular digits. */
export function CurrencyInput({ value, onChange, error, autoFocus }: CurrencyInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleChangeText = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    const cents = parseInt(digits, 10) || 0;
    onChange(formatCents(cents));
  };

  return (
    <View style={styles.root}>
      <View style={[styles.field, isFocused ? styles.fieldFocused : null, error ? styles.fieldError : null]}>
        <AppText variant="baseStrong" tone="muted" style={styles.prefix}>
          R$
        </AppText>
        <TextInput
          // The wrapper border already shows focus; drop the browser outline drawn inside it.
          style={styles.input}
          value={value}
          onChangeText={handleChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          keyboardType="number-pad"
          autoFocus={autoFocus}
          selection={{ start: value.length, end: value.length }}
          placeholderTextColor={palette.muted}
        />
      </View>
      {error ? (
        <AppText variant="caption" tone="danger" style={styles.error}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginBottom: space.lg,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: palette.rule,
    backgroundColor: palette.sheet,
    paddingHorizontal: space.lg,
  },
  fieldFocused: {
    borderColor: palette.accent,
  },
  fieldError: {
    borderColor: palette.danger,
  },
  prefix: {
    marginRight: space.xs,
  },
  input: {
    ...textVariants.title,
    ...tabularNums,
    flex: 1,
    outlineStyle: "solid",
    outlineWidth: 0,
  },
  error: {
    marginTop: space.xs,
  },
});
