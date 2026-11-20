import { useState } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { formatDateBR, parseISODate, toISODate } from "../lib/date";
import { palette, radius, space, textVariants } from "../theme";
import { AppText } from "./ui/AppText";

interface DatePickerFieldProps {
  value: string;
  onChange: (iso: string) => void;
  error?: string;
  minDate?: string;
  maxDate?: string;
}

function NativeDatePicker({ value, onChange, minDate, maxDate, onDone }: {
  value: string;
  onChange: (iso: string) => void;
  minDate?: string;
  maxDate?: string;
  onDone: () => void;
}) {
  const DateTimePicker = require("@react-native-community/datetimepicker").default;

  return (
    <DateTimePicker
      value={parseISODate(value)}
      mode="date"
      display="default"
      onChange={(_event: any, selected?: Date) => {
        if (Platform.OS === "android") onDone();
        if (selected) onChange(toISODate(selected));
      }}
      locale="pt-BR"
      minimumDate={minDate ? parseISODate(minDate) : undefined}
      maximumDate={maxDate ? parseISODate(maxDate) : undefined}
    />
  );
}

function WebDateInput({ value, onChange, minDate, maxDate }: {
  value: string;
  onChange: (iso: string) => void;
  minDate?: string;
  maxDate?: string;
}) {
  return (
    <input
      type="date"
      value={value}
      min={minDate}
      max={maxDate}
      onChange={(e) => { if (e.target.value) onChange(e.target.value); }}
      style={{
        border: "none",
        background: "transparent",
        fontSize: 16,
        color: palette.ink,
        outline: "none",
        width: "100%",
        padding: 0,
        fontFamily: textVariants.base.fontFamily,
      }}
    />
  );
}

export function DatePickerField({ value, onChange, error, minDate, maxDate }: DatePickerFieldProps) {
  const [show, setShow] = useState(false);
  const isWeb = Platform.OS === "web";

  return (
    <View style={styles.root}>
      {isWeb ? (
        <View style={[styles.field, error ? styles.fieldError : null]}>
          <WebDateInput value={value} onChange={onChange} minDate={minDate} maxDate={maxDate} />
        </View>
      ) : (
        <>
          <TouchableOpacity
            style={[styles.field, error ? styles.fieldError : null]}
            onPress={() => setShow(true)}
            activeOpacity={0.7}
          >
            <AppText variant="base">{formatDateBR(value)}</AppText>
          </TouchableOpacity>

          {show && (
            <NativeDatePicker
              value={value}
              onChange={onChange}
              minDate={minDate}
              maxDate={maxDate}
              onDone={() => setShow(false)}
            />
          )}
        </>
      )}

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
    height: 48,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: palette.rule,
    backgroundColor: palette.sheet,
    paddingHorizontal: space.lg,
    justifyContent: "center",
  },
  fieldError: {
    borderColor: palette.danger,
  },
  error: {
    marginTop: space.xs,
  },
});
