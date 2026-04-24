import { useState } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { formatDateBR, parseISODate, toISODate } from "../lib/date";
import { Colors, Radius, Shadow } from "../theme/tokens";

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
        color: Colors.text,
        outline: "none",
        width: "100%",
        padding: 0,
        fontFamily: "inherit",
      }}
    />
  );
}

export function DatePickerField({ value, onChange, error, minDate, maxDate }: DatePickerFieldProps) {
  const [show, setShow] = useState(false);
  const isWeb = Platform.OS === "web";

  return (
    <View style={{ marginBottom: 16 }}>
      {isWeb ? (
        <View style={{
          height: 52,
          borderRadius: Radius.md,
          borderWidth: 1.5,
          borderColor: error ? Colors.danger : Colors.border,
          backgroundColor: Colors.surface,
          paddingHorizontal: 16,
          justifyContent: "center",
          ...Shadow.xs,
        }}>
          <WebDateInput value={value} onChange={onChange} minDate={minDate} maxDate={maxDate} />
        </View>
      ) : (
        <>
          <TouchableOpacity
            style={{
              height: 52,
              borderRadius: Radius.md,
              borderWidth: 1.5,
              borderColor: error ? Colors.danger : Colors.border,
              backgroundColor: Colors.surface,
              paddingHorizontal: 16,
              justifyContent: "center",
              ...Shadow.xs,
            }}
            onPress={() => setShow(true)}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 15, color: Colors.text }}>{formatDateBR(value)}</Text>
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

      {error && <Text style={{ marginTop: 5, fontSize: 12, color: Colors.danger }}>{error}</Text>}
    </View>
  );
}
