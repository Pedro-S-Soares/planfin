import { Alert, Platform } from "react-native";

type ConfirmOptions = {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

export function confirm(options: ConfirmOptions, onConfirm: () => void) {
  const { title, message, confirmLabel = "Confirmar", cancelLabel = "Cancelar" } = options;

  if (Platform.OS === "web") {
    const text = message ? `${title}\n\n${message}` : title;
    if (window.confirm(text)) onConfirm();
    return;
  }

  Alert.alert(title, message, [
    { text: cancelLabel, style: "cancel" },
    {
      text: confirmLabel,
      style: options.destructive ? "destructive" : "default",
      onPress: onConfirm,
    },
  ]);
}

export function alertWeb(title: string, message?: string) {
  if (Platform.OS === "web") {
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}
