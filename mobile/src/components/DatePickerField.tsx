import { useState } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { formatDateBR, parseISODate, toISODate } from "../lib/date";

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
      onChange={(e) => {
        if (e.target.value) onChange(e.target.value);
      }}
      style={{
        border: "none",
        background: "transparent",
        fontSize: 16,
        color: "#404040",
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
    <View className="mb-5">
      {isWeb ? (
        <View className={`border rounded-lg p-3 bg-white ${error ? "border-red-500" : "border-neutral-300"}`}>
          <WebDateInput value={value} onChange={onChange} minDate={minDate} maxDate={maxDate} />
        </View>
      ) : (
        <>
          <TouchableOpacity
            className={`border rounded-lg p-3 bg-white ${error ? "border-red-500" : "border-neutral-300"}`}
            onPress={() => setShow(true)}
            activeOpacity={0.7}
          >
            <Text className="text-base text-neutral-700">{formatDateBR(value)}</Text>
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

      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
    </View>
  );
}
