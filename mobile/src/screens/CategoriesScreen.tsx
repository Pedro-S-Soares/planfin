import { useState } from "react";
import { View, FlatList, TouchableOpacity, ActivityIndicator, Modal, Platform } from "react-native";
import {
  useCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useCreateSubcategoryMutation,
  useDeleteSubcategoryMutation,
  CategoriesDocument,
  CategoriesQuery,
} from "../graphql/__generated__/hooks";
import { Block } from "../components/ui/Block";
import { CategoryIcon } from "../components/ui/CategoryIcon";
import { IconPicker } from "../components/ui/IconPicker";
import { IconPickerButton } from "../components/ui/IconPickerButton";
import { InlineError } from "../components/ui/InlineError";
import { usePageTitle } from "../hooks/usePageTitle";
import { categoryColor, palette, radius } from "../theme";
import { Text } from "../components/ui/Text";
import { TextInput } from "../components/ui/TextInput";
import { Icon } from "../components/ui/Icon";
import { AppText } from "../components/ui/AppText";
import { ChipGroup } from "../components/ui/Chip";

type Category = NonNullable<CategoriesQuery["categories"]>[number];
type Subcategory = NonNullable<NonNullable<Category>["subcategories"]>[number];
type CategoryType = "expense" | "income";

const TYPE_LABELS: Record<CategoryType, string> = {
  expense: "Despesa",
  income: "Receita",
};

const TYPE_OPTIONS = (["expense", "income"] as CategoryType[]).map((value) => ({ value, label: TYPE_LABELS[value] }));

function TypeToggle({ value, onChange }: { value: CategoryType; onChange: (v: CategoryType) => void }) {
  return <ChipGroup options={TYPE_OPTIONS} value={value} onChange={onChange} />;
}

function typeLabel(type: string | null | undefined): string {
  return type === "income" ? TYPE_LABELS.income : TYPE_LABELS.expense;
}

const refetchCategories = [{ query: CategoriesDocument }];

export function CategoriesScreen() {
  usePageTitle("Planfin - Categorias");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState<CategoryType>("expense");
  const [newCategoryIcon, setNewCategoryIcon] = useState<string | null>(null);
  const [newSubName, setNewSubName] = useState<Record<string, string>>({});
  const [isNewIconPickerOpen, setIsNewIconPickerOpen] = useState(false);

  // Edit modal state
  const [editingCat, setEditingCat] = useState<NonNullable<Category> | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<CategoryType>("expense");
  const [editIcon, setEditIcon] = useState<string | null>(null);
  const [isEditIconPickerOpen, setIsEditIconPickerOpen] = useState(false);

  const { data, loading, error, refetch } = useCategoriesQuery({ fetchPolicy: "network-only" });

  const [createCategory] = useCreateCategoryMutation({ refetchQueries: refetchCategories });
  const [updateCategory] = useUpdateCategoryMutation({ refetchQueries: refetchCategories });
  const [deleteCategory] = useDeleteCategoryMutation({ refetchQueries: refetchCategories });
  const [createSubcategory] = useCreateSubcategoryMutation({ refetchQueries: refetchCategories });
  const [deleteSubcategory] = useDeleteSubcategoryMutation({ refetchQueries: refetchCategories });

  const handleAddCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    createCategory({ variables: { name, type: newCategoryType, icon: newCategoryIcon } });
    setNewCategoryName("");
    setNewCategoryIcon(null);
  };

  const openEditModal = (cat: NonNullable<Category>) => {
    setEditingCat(cat);
    setEditName(cat.name ?? "");
    setEditType((cat.type as CategoryType) ?? "expense");
    setEditIcon(cat.icon ?? null);
  };

  const handleSaveEdit = () => {
    if (!editingCat || !editName.trim()) return;
    updateCategory({
      variables: { id: editingCat.id ?? "", name: editName.trim(), type: editType, icon: editIcon },
    });
    setEditingCat(null);
  };

  const handleDeleteCategory = (id: string) => {
    deleteCategory({ variables: { id } });
  };

  const handleAddSubcategory = (categoryId: string) => {
    const name = newSubName[categoryId]?.trim();
    if (!name) return;
    createSubcategory({ variables: { categoryId, name } });
    setNewSubName((prev) => ({ ...prev, [categoryId]: "" }));
  };

  const handleDeleteSubcategory = (id: string) => {
    deleteSubcategory({ variables: { id } });
  };

  const categories = (data?.categories ?? []).filter(Boolean) as NonNullable<Category>[];

  const header = null;

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: palette.paper }}>
        {header}
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={palette.accent} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: palette.paper }}>
        {header}
        <View style={{ padding: 16 }}>
          <InlineError onRetry={refetch} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: palette.paper }}>
      {header}
      <FlatList
        data={categories}
        keyExtractor={(item) => item?.id ?? ""}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        ListHeaderComponent={
          <Block padding={12} style={{ marginBottom: 4, gap: 10 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <IconPickerButton
                icon={newCategoryIcon}
                name={newCategoryName}
                onPress={() => setIsNewIconPickerOpen(true)}
              />
              <TextInput
                style={{
                  flex: 1,
                  height: 40,
                  borderWidth: 1.5,
                  borderColor: palette.rule,
                  borderRadius: radius.control,
                  paddingHorizontal: 12,
                  fontSize: 14,
                  color: palette.ink,
                  backgroundColor: palette.sheet,
                }}
                placeholder="Nova categoria..."
                placeholderTextColor={palette.muted}
                value={newCategoryName}
                onChangeText={setNewCategoryName}
              />
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Adicionar categoria"
                onPress={handleAddCategory}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: radius.control,
                  backgroundColor: palette.accent,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="plus" size={22} tone="onAccent" />
              </TouchableOpacity>
            </View>
            <TypeToggle value={newCategoryType} onChange={setNewCategoryType} />
          </Block>
        }
        renderItem={({ item: cat }) => {
          const cc = categoryColor(cat.name ?? "");
          const isOpen = expandedId === cat.id;

          return (
            <Block padding={0} style={{ overflow: "hidden" }}>
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14 }}
                onPress={() => setExpandedId(isOpen ? null : cat.id ?? null)}
                activeOpacity={0.7}
              >
                <View style={{
                  width: 36,
                  height: 36,
                  borderRadius: radius.control,
                  backgroundColor: cc.bg,
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <CategoryIcon icon={cat.icon} name={cat.name ?? ""} size={20} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <AppText variant="label" numberOfLines={1}>{cat.name}</AppText>
                  <AppText variant="caption" numberOfLines={1}>
                    {typeLabel(cat.type)} · {cat.subcategories?.length ?? 0}{" "}
                    {(cat.subcategories?.length ?? 0) === 1 ? "subcategoria" : "subcategorias"}
                  </AppText>
                </View>
                <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                  <TouchableOpacity onPress={() => openEditModal(cat)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                    <Icon name="pencil-outline" size={18} tone="accent" />
                  </TouchableOpacity>
                  <TouchableOpacity accessibilityLabel={`Excluir ${cat.name}`} onPress={() => handleDeleteCategory(cat.id ?? "")} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                    <Icon name="trash-can-outline" size={18} tone="danger" />
                  </TouchableOpacity>
                </View>
                <Icon name={isOpen ? "chevron-up" : "chevron-down"} />
              </TouchableOpacity>

              {isOpen && (
                <View style={{ paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1, borderTopColor: palette.rule }}>
                  {(cat.subcategories ?? []).filter(Boolean).map((sub: Subcategory) => (
                    <View key={sub?.id ?? ""} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: palette.rule }}>
                      <Text style={{ fontSize: 13.5, color: palette.ink }}>{sub?.name}</Text>
                      <TouchableOpacity
                        onPress={() => handleDeleteSubcategory(sub?.id ?? "")}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <Icon name="trash-can-outline" size={18} tone="danger" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
                    <TextInput
                      placeholder="Nova subcategoria..."
                      placeholderTextColor={palette.muted}
                      style={{
                        flex: 1,
                        height: 38,
                        borderWidth: 1.5,
                        borderColor: palette.rule,
                        borderRadius: radius.control,
                        paddingHorizontal: 10,
                        fontSize: 13,
                        color: palette.ink,
                        backgroundColor: palette.sheet,
                      }}
                      value={newSubName[cat.id ?? ""] ?? ""}
                      onChangeText={(t) => setNewSubName((prev) => ({ ...prev, [cat.id ?? ""]: t }))}
                    />
                    <TouchableOpacity
                      onPress={() => handleAddSubcategory(cat.id ?? "")}
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: radius.control,
                        backgroundColor: palette.accentSoft,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ color: palette.accent, fontSize: 20, fontWeight: "700", lineHeight: 26 }}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Block>
          );
        }}
      />

      {/* Edit Category Modal */}
      <Modal
        visible={editingCat !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingCat(null)}
      >
        <View style={{
          flex: 1,
          backgroundColor: palette.backdrop,
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}>
          <View style={{
            backgroundColor: palette.sheet,
            borderRadius: radius.block,
            padding: 24,
            width: "100%",
            gap: 16,
          }}>
            <Text style={{ fontSize: 17, fontWeight: "800", color: palette.ink }}>
              Editar categoria
            </Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <IconPickerButton
                icon={editIcon}
                name={editName}
                size={44}
                onPress={() => setIsEditIconPickerOpen(true)}
              />
              <TextInput
                style={{
                  flex: 1,
                  height: 44,
                  borderWidth: 1.5,
                  borderColor: palette.rule,
                  borderRadius: radius.control,
                  paddingHorizontal: 12,
                  fontSize: 15,
                  color: palette.ink,
                  backgroundColor: palette.sheet,
                }}
                placeholder="Nome da categoria"
                placeholderTextColor={palette.muted}
                value={editName}
                onChangeText={setEditName}
                autoFocus
              />
            </View>
            <TypeToggle value={editType} onChange={setEditType} />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={() => setEditingCat(null)}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: radius.control,
                  borderWidth: 1.5,
                  borderColor: palette.rule,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: "700", color: palette.muted }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveEdit}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: radius.control,
                  backgroundColor: palette.accent,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: "700", color: palette.onAccent }}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {/* Nested inside the edit Modal: iOS cannot present two sibling Modals at once. */}
        <IconPicker
          visible={isEditIconPickerOpen}
          value={editIcon}
          onSelect={setEditIcon}
          onClose={() => setIsEditIconPickerOpen(false)}
        />
      </Modal>

      <IconPicker
        visible={isNewIconPickerOpen}
        value={newCategoryIcon}
        onSelect={setNewCategoryIcon}
        onClose={() => setIsNewIconPickerOpen(false)}
      />
    </View>
  );
}
