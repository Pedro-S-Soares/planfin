import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "../../../components/ui/AppText";
import { Sheet } from "../../../components/ui/Sheet";
import { layout, palette, space } from "../../../theme";

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
  return (
    <Sheet isOpen={isOpen} onClose={onClose} title={title} size="fit">
      <ScrollView contentContainerStyle={styles.content}>
        {sections.map((section, index) => (
          <View key={section.title ?? index} style={styles.section}>
            {section.title ? (
              <AppText variant="caption" style={styles.sectionTitle}>
                {section.title}
              </AppText>
            ) : null}
            {section.options.map((option) => (
              <Pressable
                key={option.key}
                accessibilityRole="radio"
                aria-checked={option.isSelected}
                onPress={() => {
                  option.onSelect();
                  onClose();
                }}
                style={({ pressed }) => [
                  styles.option,
                  option.isSelected ? styles.optionSelected : null,
                  pressed ? styles.optionPressed : null,
                ]}
              >
                <AppText variant={option.isSelected ? "baseStrong" : "base"} tone={option.isSelected ? "accent" : "ink"}>
                  {option.label}
                </AppText>
                {option.isSelected ? <MaterialCommunityIcons name="check" size={20} color={palette.accent} /> : null}
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: space.md,
  },
  section: {
    paddingTop: space.xs,
  },
  sectionTitle: {
    paddingHorizontal: layout.gutter,
    paddingVertical: space.xs,
  },
  option: {
    minHeight: 48,
    paddingHorizontal: layout.gutter,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionSelected: {
    backgroundColor: palette.accentSoft,
  },
  optionPressed: {
    backgroundColor: palette.paper,
  },
});
