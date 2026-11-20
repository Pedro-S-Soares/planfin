import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { radius } from "../../theme";

/** The 32px square behind a row icon, in the category color at 12%. */
export function IconTile({ background, children }: { background: string; children: ReactNode }) {
  return <View style={[styles.tile, { backgroundColor: background }]}>{children}</View>;
}

const styles = StyleSheet.create({
  tile: {
    width: 32,
    height: 32,
    borderRadius: radius.control,
    alignItems: "center",
    justifyContent: "center",
  },
});
