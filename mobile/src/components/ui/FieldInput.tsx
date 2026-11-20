import { useState } from "react";
import { StyleSheet, View, type TextInputProps } from "react-native";
import { palette, radius, space, textVariants } from "../../theme";
import { AppText } from "./AppText";
import { TextInput } from "./TextInput";

interface FieldInputProps extends Omit<TextInputProps, "onChange"> {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: string;
  value?: string;
  onChange?: (value: string) => void;
}

/** A text field: sentence-case label, 48 high, rule border that turns accent on focus. */
export function FieldInput({ label, error, hint, prefix, value, onChange, editable = true, ...rest }: FieldInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.root}>
      {label ? (
        <AppText variant="label" tone="muted" style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <View style={styles.row}>
        {prefix ? (
          <AppText variant="baseStrong" tone="muted" style={styles.prefix}>
            {prefix}
          </AppText>
        ) : null}
        <TextInput
          value={value ?? ""}
          onChangeText={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={editable}
          style={[
            styles.input,
            prefix ? styles.inputWithPrefix : null,
            isFocused ? styles.inputFocused : null,
            error ? styles.inputError : null,
            editable ? null : styles.inputReadOnly,
          ]}
          {...rest}
        />
      </View>
      {error || hint ? (
        <AppText variant="caption" tone={error ? "danger" : "muted"} style={styles.help}>
          {error || hint}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginBottom: space.lg,
  },
  label: {
    marginBottom: space.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  prefix: {
    position: "absolute",
    left: 14,
    zIndex: 1,
  },
  input: {
    ...textVariants.base,
    flex: 1,
    height: 48,
    paddingHorizontal: space.lg,
    borderRadius: radius.control,
    backgroundColor: palette.sheet,
    borderWidth: 1,
    borderColor: palette.rule,
    outlineStyle: "solid",
    outlineWidth: 0,
  },
  inputWithPrefix: {
    paddingLeft: 40,
  },
  inputFocused: {
    borderColor: palette.accent,
  },
  inputError: {
    borderColor: palette.danger,
  },
  inputReadOnly: {
    backgroundColor: palette.paper,
    color: palette.muted,
  },
  help: {
    marginTop: space.xs,
  },
});
