import type { ReactNode } from "react";
import { Modal, Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { layout, palette, radius, shadow, space } from "../../theme";
import { AppText } from "./AppText";
import { IconButton } from "./IconButton";

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /**
   * tall: 90% of the screen, for forms (the content scrolls inside and can pin a footer).
   * fit: as tall as the content, up to 80% (short pickers).
   */
  size?: "tall" | "fit";
  children: ReactNode;
}

// On the web the browser scrolls an autofocused field "into view" while the sheet is still
// sliding in, leaving the top of the form hidden. A fade keeps the field in place.
const ANIMATION = Platform.OS === "web" ? "fade" : "slide";

/**
 * Bottom sheet: the pattern to create and edit over a list without leaving it.
 * 90% of the height on a phone, a centered 560px column on a wide screen.
 */
export function Sheet({ isOpen, onClose, title, size = "tall", children }: SheetProps) {
  return (
    <Modal visible={isOpen} transparent animationType={ANIMATION} onRequestClose={onClose}>
      {isOpen ? (
        <SheetFrame onClose={onClose} title={title} size={size}>
          {children}
        </SheetFrame>
      ) : null}
    </Modal>
  );
}

interface SheetFrameProps {
  onClose: () => void;
  title: string;
  size?: "tall" | "fit";
  children: ReactNode;
}

/**
 * The sheet itself (dimmed backdrop, handle, title, close) without the Modal: used by
 * `Sheet`, and by navigation routes presented as a transparent modal (see sheetScreen).
 */
export function SheetFrame({ onClose, title, size = "tall", children }: SheetFrameProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <Pressable accessibilityLabel="Fechar" onPress={onClose} style={styles.backdrop} />
      <View
        accessibilityViewIsModal
        style={[styles.sheet, size === "tall" ? styles.tall : styles.fit, { paddingBottom: insets.bottom }]}
      >
        <View style={styles.handleArea}>
          <View style={styles.handle} />
        </View>
        <View style={styles.header}>
          <AppText variant="title" accessibilityRole="header" style={styles.title} numberOfLines={1}>
            {title}
          </AppText>
          <IconButton icon="close" tone="plain" accessibilityLabel="Fechar" onPress={onClose} />
        </View>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: palette.backdrop,
  },
  sheet: {
    width: "100%",
    maxWidth: layout.maxContentWidth,
    alignSelf: "center",
    backgroundColor: palette.sheet,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    overflow: "hidden",
    ...shadow.sheet,
  },
  tall: {
    height: "90%",
  },
  fit: {
    maxHeight: "80%",
  },
  handleArea: {
    alignItems: "center",
    paddingTop: space.sm,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.rule,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.md,
    paddingHorizontal: layout.gutter,
    paddingTop: space.sm,
    paddingBottom: space.md,
  },
  title: {
    flexShrink: 1,
  },
});

/** The bottom bar of a tall sheet's form: the save button stays in view while the fields scroll. */
export function SheetFooter({ children }: { children: ReactNode }) {
  return <View style={footerStyles.footer}>{children}</View>;
}

const footerStyles = StyleSheet.create({
  footer: {
    paddingHorizontal: layout.gutter,
    paddingTop: space.md,
    paddingBottom: space.md,
    borderTopWidth: 1,
    borderTopColor: palette.rule,
    backgroundColor: palette.sheet,
    gap: space.xs,
  },
});
