import { useCallback } from "react";
import { Platform } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

export function usePageTitle(title: string) {
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === "web" && typeof document !== "undefined") {
        document.title = title;
      }
    }, [title]),
  );
}
