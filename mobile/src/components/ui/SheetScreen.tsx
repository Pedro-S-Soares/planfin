import type { ComponentType } from "react";
import { useNavigation } from "@react-navigation/native";
import { SheetFrame } from "./Sheet";

/**
 * Wraps a create/edit route so it opens as the app's bottom sheet over the screen it
 * came from (with `SHEET_ROUTE_OPTIONS`), instead of a full-screen modal. The route, its
 * params and its goBack() on save stay the same.
 */
export function sheetScreen<P extends object>(Screen: ComponentType<P>, title: string): ComponentType<P> {
  function SheetRoute(props: P) {
    const navigation = useNavigation();
    return (
      <SheetFrame title={title} onClose={() => navigation.goBack()}>
        <Screen {...props} />
      </SheetFrame>
    );
  }
  SheetRoute.displayName = `Sheet(${Screen.displayName ?? Screen.name})`;
  return SheetRoute;
}

/** Navigation options of a route shown with sheetScreen: no header, the previous screen stays visible. */
export const SHEET_ROUTE_OPTIONS = {
  headerShown: false,
  presentation: "transparentModal" as const,
  animation: "fade" as const,
  contentStyle: { backgroundColor: "transparent" },
};
