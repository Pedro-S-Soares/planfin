import { useState } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { formatDateBR, parseISODate, toISODate } from "../lib/date";

interface DatePickerFieldProps {
  value: string;
  onChange: (iso: string) => void;
  error?: string;
  minDate?: string;
  maxDate?: string;
}

export function DatePickerField({ value, onChange, error, minDate, maxDate }: DatePickerFieldProps) {
  const [show, setShow] = useState(false);

  const handleChange = (_event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") setShow(false);
    if (selected) onChange(toISODate(selected));
  };

  return (
    <View className="mb-5">
      <TouchableOpacity
        className={`border rounded-lg p-3 bg-white ${error ? "border-red-500" : "border-neutral-300"}`}
        onPress={() => setShow(true)}
        activeOpacity={0.7}
      >
        <Text className="text-base text-neutral-700">{formatDateBR(value)}</Text>
      </TouchableOpacity>

      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}

      {show && (
        <DateTimePicker
          value={parseISODate(value)}
          mode="date"
          display="default"
          onChange={handleChange}
          locale="pt-BR"
          minimumDate={minDate ? parseISODate(minDate) : undefined}
          maximumDate={maxDate ? parseISODate(maxDate) : undefined}
        />
      )}
    </View>
  );
}
