import { useState } from "react";
import { Text, TextInput, View, TextInputProps } from "react-native";
import { Colors, Radius, Shadow } from "../../theme/tokens";

interface FieldInputProps extends Omit<TextInputProps, "onChange"> {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function FieldInput({ label, error, hint, prefix, value, onChange, ...rest }: FieldInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ marginBottom: 16 }}>
      {label && (
        <Text style={{
          fontSize: 11,
          fontWeight: "700",
          color: Colors.textSec,
          letterSpacing: 0.8,
          textTransform: "uppercase",
          marginBottom: 7,
        }}>
          {label}
        </Text>
      )}
      <View style={{ position: "relative", flexDirection: "row", alignItems: "center" }}>
        {prefix && (
          <Text style={{
            position: "absolute",
            left: 14,
            fontSize: 16,
            color: Colors.textSec,
            fontWeight: "600",
            zIndex: 1,
          }}>
            {prefix}
          </Text>
        )}
        <TextInput
          value={value ?? ""}
          onChangeText={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1,
            height: 52,
            paddingHorizontal: prefix ? 40 : 16,
            borderRadius: Radius.md,
            fontSize: 16,
            color: Colors.text,
            backgroundColor: Colors.surface,
            borderWidth: 1.5,
            borderColor: error ? Colors.danger : focused ? Colors.primary : Colors.border,
            ...Shadow.xs,
          }}
          placeholderTextColor={Colors.textTer}
          {...rest}
        />
      </View>
      {(error || hint) && (
        <Text style={{ marginTop: 5, fontSize: 12, color: error ? Colors.danger : Colors.textTer }}>
          {error || hint}
        </Text>
      )}
    </View>
  );
}
