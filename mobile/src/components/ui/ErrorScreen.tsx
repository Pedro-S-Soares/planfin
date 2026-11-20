import { StyleSheet, View } from "react-native";
import { palette, space } from "../../theme";
import { AppText } from "./AppText";
import { Button } from "./Button";
import { Logo } from "./Logo";

interface ErrorScreenProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorScreen({ message = "Algo deu errado.", onRetry }: ErrorScreenProps) {
  return (
    <View style={styles.root}>
      <Logo size={56} />
      <AppText variant="title" style={styles.center}>{message}</AppText>
      <AppText variant="body" tone="muted" style={styles.center}>
        Verifique sua conexão e tente novamente.
      </AppText>
      {onRetry ? <Button label="Tentar novamente" onPress={onRetry} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.paper,
    alignItems: "stretch",
    justifyContent: "center",
    paddingHorizontal: space.xxl,
    gap: space.lg,
  },
  center: {
    textAlign: "center",
    alignSelf: "center",
  },
});
