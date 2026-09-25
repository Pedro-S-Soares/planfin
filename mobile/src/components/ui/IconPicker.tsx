import { useState } from "react";
import { FlatList, Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { CURATED_ICONS, isIconName } from "./icons/curated-icons";
import { Colors, Radius, Shadow } from "../../theme/tokens";
import type { IconName } from "./icons/curated-icons";

const SEARCH_LIMIT = 120;
const ALL_ICON_NAMES: readonly IconName[] = Object.keys(MaterialCommunityIcons.glyphMap).filter(isIconName);

function searchIcons(query: string): readonly IconName[] {
  const term = query.trim().toLowerCase();
  if (term.length === 0) return CURATED_ICONS;
  return ALL_ICON_NAMES.filter((name) => name.includes(term)).slice(0, SEARCH_LIMIT);
}

interface IconPickerProps {
  visible: boolean;
  value: string | null;
  onSelect: (icon: string | null) => void;
  onClose: () => void;
}

export function IconPicker({ visible, value, onSelect, onClose }: IconPickerProps) {
  const [query, setQuery] = useState("");
  const icons = searchIcons(query);

  const handleClose = () => {
    setQuery("");
    onClose();
  };

  const handleSelect = (icon: string | null) => {
    onSelect(icon);
    handleClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={{
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}>
        <View style={{
          backgroundColor: Colors.surface,
          borderRadius: Radius.lg,
          padding: 20,
          width: "100%",
          maxWidth: 420,
          maxHeight: "80%",
          gap: 12,
          ...Shadow.md,
        }}>
          <Text style={{ fontSize: 17, fontWeight: "800", color: Colors.text }}>Escolher ícone</Text>
          <TextInput
            style={{
              height: 40,
              borderWidth: 1.5,
              borderColor: Colors.border,
              borderRadius: Radius.sm,
              paddingHorizontal: 12,
              fontSize: 14,
              color: Colors.text,
              backgroundColor: Colors.surface,
            }}
            placeholder="Buscar ícone (em inglês)..."
            placeholderTextColor={Colors.textTer}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <FlatList
            data={icons}
            keyExtractor={(item) => item}
            numColumns={6}
            style={{ flexGrow: 0 }}
            columnWrapperStyle={{ gap: 8 }}
            contentContainerStyle={{ gap: 8 }}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Text style={{ fontSize: 13, color: Colors.textSec, textAlign: "center", paddingVertical: 16 }}>
                Nenhum ícone encontrado
              </Text>
            }
            renderItem={({ item }) => {
              const isSelected = item === value;
              return (
                <TouchableOpacity
                  onPress={() => handleSelect(item)}
                  accessibilityLabel={item}
                  style={{
                    flex: 1,
                    aspectRatio: 1,
                    maxWidth: 52,
                    borderRadius: Radius.sm,
                    borderWidth: 1.5,
                    borderColor: isSelected ? Colors.primary : Colors.border,
                    backgroundColor: isSelected ? Colors.primaryLight : Colors.surface,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MaterialCommunityIcons
                    name={item}
                    size={22}
                    color={isSelected ? Colors.primaryText : Colors.textSec}
                  />
                </TouchableOpacity>
              );
            }}
          />
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              onPress={() => handleSelect(null)}
              style={{
                flex: 1,
                height: 44,
                borderRadius: Radius.sm,
                borderWidth: 1.5,
                borderColor: Colors.border,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "700", color: Colors.textSec }}>Sem ícone</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleClose}
              style={{
                flex: 1,
                height: 44,
                borderRadius: Radius.sm,
                backgroundColor: Colors.primary,
                alignItems: "center",
                justifyContent: "center",
                ...Shadow.sm,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#fff" }}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
