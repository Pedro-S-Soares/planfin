import { useEffect, useState } from "react";
import { Platform, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { buildIdFromHtml, buildIdFromScripts, isNewBuild } from "../../lib/app-version";
import { palette, radius } from "../../theme";
import { Icon } from "./Icon";
import { Text } from "./Text";

const CHECK_EVERY_MS = 5 * 60 * 1000;
/** Back from this long in the background, a new version reloads by itself: nothing on screen is in use. */
const AWAY_RELOAD_MS = 10 * 60 * 1000;

async function deployedBuildId(): Promise<string | null> {
  try {
    const response = await fetch(`/?v=${Date.now()}`, { cache: "no-store" });
    return response.ok ? buildIdFromHtml(await response.text()) : null;
  } catch {
    return null;
  }
}

/**
 * Web only: notices a new deploy (the bundle hash in index.html changed) when the app comes
 * back to the screen, on focus and every few minutes. After a long time away it reloads at
 * once; otherwise it offers "Nova versão — atualizar", so a half-filled form is never lost.
 */
export function UpdateBanner() {
  const insets = useSafeAreaInsets();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    const running = buildIdFromScripts(Array.from(document.scripts, (s) => s.src));
    if (running === null) return; // dev server: nothing to compare

    let hiddenSince: number | null = null;
    let isChecking = false;

    const check = async (reloadIfNew: boolean) => {
      if (isChecking) return;
      isChecking = true;
      const deployed = await deployedBuildId();
      isChecking = false;
      if (!isNewBuild(running, deployed)) return;
      if (reloadIfNew) window.location.reload();
      else setIsReady(true);
    };

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        hiddenSince = Date.now();
        return;
      }
      const wasAwayLong = hiddenSince !== null && Date.now() - hiddenSince >= AWAY_RELOAD_MS;
      hiddenSince = null;
      check(wasAwayLong);
    };
    const handleFocus = () => check(false);

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleFocus);
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") check(false);
    }, CHECK_EVERY_MS);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleFocus);
      clearInterval(timer);
    };
  }, []);

  if (!isReady) return null;

  return (
    <View
      pointerEvents="box-none"
      style={{ position: "absolute", top: insets.top + 12, left: 16, right: 16, zIndex: 1001, alignItems: "center" }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Nova versão disponível. Atualizar"
        onPress={() => window.location.reload()}
        style={{
          width: "100%",
          maxWidth: 480,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          backgroundColor: palette.ink,
          borderRadius: radius.control,
          paddingHorizontal: 14,
          paddingVertical: 12,
        }}
      >
        <Icon name="refresh" size={20} tone="onAccent" />
        <Text style={{ flex: 1, color: palette.onAccent, fontSize: 14, fontWeight: "600", lineHeight: 19 }}>Nova versão</Text>
        <Text style={{ color: palette.onAccent, fontSize: 14, fontWeight: "700", lineHeight: 19, textDecorationLine: "underline" }}>
          Atualizar
        </Text>
      </Pressable>
    </View>
  );
}
