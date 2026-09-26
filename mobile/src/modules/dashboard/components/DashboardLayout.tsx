import { ReactNode } from "react";
import { ActivityIndicator, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { InlineError } from "../../../components/ui/InlineError";
import { Colors } from "../../../theme/tokens";

export const WIDE_BREAKPOINT = 1100;

export function useIsWide(): boolean {
  return useWindowDimensions().width >= WIDE_BREAKPOINT;
}

/** Scrollable page with a centred, max-width column. */
export function DashboardPage({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const wide = useIsWide();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <View
        style={{
          width: "100%",
          maxWidth: 1360,
          alignSelf: "center",
          paddingHorizontal: wide ? 40 : 16,
          paddingTop: insets.top + (wide ? 32 : 20),
          paddingBottom: 48,
          gap: wide ? 24 : 16,
        }}
      >
        {children}
      </View>
    </ScrollView>
  );
}

/** Two columns (2:1) on wide screens, stacked otherwise. */
export function SplitRow({ main, side }: { main: ReactNode; side: ReactNode }) {
  const wide = useIsWide();
  return (
    <View style={{ flexDirection: wide ? "row" : "column", gap: wide ? 24 : 16, alignItems: wide ? "stretch" : undefined }}>
      <View style={{ flex: wide ? 2 : undefined, minWidth: 0 }}>{main}</View>
      <View style={{ flex: wide ? 1 : undefined, minWidth: 0 }}>{side}</View>
    </View>
  );
}

export function PageHeader({ eyebrow, title, subtitle, aside }: {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: string;
  aside?: ReactNode;
}) {
  const wide = useIsWide();
  return (
    <View
      style={{
        flexDirection: wide ? "row" : "column",
        justifyContent: "space-between",
        alignItems: wide ? "flex-end" : "flex-start",
        gap: 16,
      }}
    >
      <View style={{ gap: 6, flexShrink: 1 }}>
        {eyebrow}
        {typeof title === "string" ? (
          <Text accessibilityRole="header" style={{ fontSize: wide ? 34 : 26, fontWeight: "800", color: Colors.text }}>
            {title}
          </Text>
        ) : (
          title
        )}
        {subtitle ? <Text style={{ fontSize: 14, color: Colors.textSec }}>{subtitle}</Text> : null}
      </View>
      {aside}
    </View>
  );
}

export function DashboardLoading() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.bg }}>
      <ActivityIndicator color={Colors.primary} size="large" />
    </View>
  );
}

export function DashboardError({ onRetry }: { onRetry: () => void }) {
  return (
    <DashboardPage>
      <InlineError message="Não foi possível carregar o histórico de gastos." onRetry={onRetry} />
    </DashboardPage>
  );
}

export function EmptyNote({ children }: { children: string }) {
  return <Text style={{ fontSize: 14, color: Colors.textSec, paddingVertical: 24 }}>{children}</Text>;
}
