import { useEffect, useState } from "react";
import { Animated, Platform, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { subscribeToasts, type ToastMessage } from "../../lib/toast";
import { Colors, Radius, Shadow } from "../../theme/tokens";

const DURATION_MS = { success: 2800, error: 5500 } as const;
const MAX_VISIBLE = 3;

function ToastItem({ message, onDismiss }: { message: ToastMessage; onDismiss: (id: number) => void }) {
  const [opacity] = useState(() => new Animated.Value(0));
  const isError = message.kind === "error";

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: Platform.OS !== "web" }).start();
    const timer = setTimeout(() => onDismiss(message.id), DURATION_MS[message.kind]);
    return () => clearTimeout(timer);
  }, [message, onDismiss, opacity]);

  return (
    <Animated.View style={{ opacity, marginBottom: 8 }}>
      <Pressable
        onPress={() => onDismiss(message.id)}
        accessibilityRole="alert"
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          backgroundColor: isError ? Colors.danger : Colors.successText,
          borderRadius: Radius.md,
          paddingHorizontal: 14,
          paddingVertical: 12,
          ...Shadow.md,
        }}
      >
        <Text style={{ fontSize: 16, color: "#fff" }}>{isError ? "⚠" : "✓"}</Text>
        <Text style={{ flex: 1, color: "#fff", fontSize: 14, fontWeight: "600", lineHeight: 19 }}>{message.text}</Text>
      </Pressable>
    </Animated.View>
  );
}

/** Renders the toasts emitted through `lib/toast` on top of every screen. */
export function ToastHost() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  useEffect(
    () =>
      subscribeToasts((message) =>
        setMessages((current) => [...current.filter((m) => m.text !== message.text), message].slice(-MAX_VISIBLE)),
      ),
    [],
  );

  const handleDismiss = (id: number) => setMessages((current) => current.filter((m) => m.id !== id));

  if (messages.length === 0) return null;

  return (
    <View
      pointerEvents="box-none"
      style={{ position: "absolute", top: insets.top + 12, left: 16, right: 16, zIndex: 1000, alignItems: "center" }}
    >
      <View pointerEvents="box-none" style={{ width: "100%", maxWidth: 480 }}>
        {messages.map((m) => (
          <ToastItem key={m.id} message={m} onDismiss={handleDismiss} />
        ))}
      </View>
    </View>
  );
}
