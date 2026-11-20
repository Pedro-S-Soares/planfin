import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ledger, Shadow } from "../../../theme/tokens";

export type SheetOption = { key: string; label: string; isSelected: boolean; onSelect: () => void };
export type SheetSection = { title?: string; options: SheetOption[] };

interface OptionSheetProps {
  title: string;
  sections: SheetSection[];
  isOpen: boolean;
  onClose: () => void;
}

/** Small bottom sheet with single-choice lists, used by the compact history filters. */
export function OptionSheet({ title, sections, isOpen, onClose }: OptionSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Pressable
          accessibilityLabel="Fechar"
          onPress={onClose}
          style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(23,22,43,0.45)" }}
        />
        <View
          style={{
            maxHeight: "80%",
            width: "100%",
            maxWidth: 560,
            alignSelf: "center",
            backgroundColor: Ledger.sheet,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingBottom: insets.bottom + 12,
            ...Shadow.lg,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "700", color: Ledger.ink, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 }}>
            {title}
          </Text>
          <ScrollView>
            {sections.map((section, index) => (
              <View key={section.title ?? index} style={{ paddingTop: 8 }}>
                {section.title ? (
                  <Text style={{ fontSize: 12, color: Ledger.muted, paddingHorizontal: 16, paddingVertical: 4 }}>
                    {section.title}
                  </Text>
                ) : null}
                {section.options.map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: option.isSelected }}
                    onPress={() => {
                      option.onSelect();
                      onClose();
                    }}
                    style={{
                      minHeight: 48,
                      paddingHorizontal: 16,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: option.isSelected ? Ledger.accentSoft : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: option.isSelected ? "700" : "500",
                        color: option.isSelected ? Ledger.accent : Ledger.ink,
                      }}
                    >
                      {option.label}
                    </Text>
                    {option.isSelected ? <Text style={{ fontSize: 16, color: Ledger.accent }}>✓</Text> : null}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
