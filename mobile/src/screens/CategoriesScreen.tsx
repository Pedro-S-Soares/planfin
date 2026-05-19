import { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Modal, Platform } from "react-native";
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
import { Card } from "../components/ui/Card";
import { InlineError } from "../components/ui/InlineError";
import { Colors, Radius, Shadow, categoryColor } from "../theme/tokens";
import { usePageTitle } from "../hooks/usePageTitle";

type Category = NonNullable<CategoriesQuery["categories"]>[number];
type Subcategory = NonNullable<NonNullable<Category>["subcategories"]>[number];
type CategoryType = "expense" | "income";

const TYPE_LABELS: Record<CategoryType, string> = {
  expense: "Despesa",
  income: "Receita",
};

const TYPE_COLORS: Record<CategoryType, { bg: string; text: string }> = {
  expense: { bg: "#FEF0EE", text: "#E5392B" },
  income: { bg: "#E8FBF2", text: "#0A7A50" },
};

function TypeToggle({
  value,
  onChange,
}: {
  value: CategoryType;
  onChange: (v: CategoryType) => void;
}) {
  return (
    <View style={{ flexDirection: "row", gap: 6 }}>
      {(["expense", "income"] as CategoryType[]).map((t) => {
        const active = value === t;
        return (
          <TouchableOpacity
            key={t}
            onPress={() => onChange(t)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: Radius.full,
              backgroundColor: active ? (t === "expense" ? Colors.dangerLight : Colors.successLight) : Colors.border,
              borderWidth: 1.5,
              borderColor: active ? (t === "expense" ? Colors.danger : Colors.success) : "transparent",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: active
                  ? t === "expense"
                    ? Colors.danger
                    : Colors.success
                  : Colors.textSec,
              }}
            >
              {TYPE_LABELS[t]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function TypeBadge({ type }: { type: string | null | undefined }) {
  const t = (type ?? "expense") as CategoryType;
  const colors = TYPE_COLORS[t] ?? TYPE_COLORS.expense;
  return (
    <View
      style={{
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: Radius.full,
        backgroundColor: colors.bg,
      }}
    >
      <Text style={{ fontSize: 10, fontWeight: "700", color: colors.text }}>
        {TYPE_LABELS[t] ?? type}
      </Text>
    </View>
  );
}

const refetchCategories = [{ query: CategoriesDocument }];

export function CategoriesScreen() {
  usePageTitle("Planfin - Categorias");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState<CategoryType>("expense");
  const [newSubName, setNewSubName] = useState<Record<string, string>>({});

  // Edit modal state
  const [editingCat, setEditingCat] = useState<NonNullable<Category> | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<CategoryType>("expense");

  const { data, loading, error, refetch } = useCategoriesQuery({ fetchPolicy: "network-only" });

  const [createCategory] = useCreateCategoryMutation({ refetchQueries: refetchCategories });
  const [updateCategory] = useUpdateCategoryMutation({ refetchQueries: refetchCategories });
  const [deleteCategory] = useDeleteCategoryMutation({ refetchQueries: refetchCategories });
  const [createSubcategory] = useCreateSubcategoryMutation({ refetchQueries: refetchCategories });
  const [deleteSubcategory] = useDeleteSubcategoryMutation({ refetchQueries: refetchCategories });

  const handleAddCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    createCategory({ variables: { name, type: newCategoryType } });
    setNewCategoryName("");
  };

  const openEditModal = (cat: NonNullable<Category>) => {
    setEditingCat(cat);
    setEditName(cat.name ?? "");
    setEditType((cat.type as CategoryType) ?? "expense");
  };

  const handleSaveEdit = () => {
    if (!editingCat || !editName.trim()) return;
    updateCategory({
      variables: { id: editingCat.id ?? "", name: editName.trim(), type: editType },
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

  const header = (
    <View style={{
      backgroundColor: Colors.surface,
      paddingTop: Platform.OS === "ios" ? 58 : 24,
      paddingBottom: 14,
      paddingHorizontal: 18,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
    }}>
      <Text style={{ fontSize: 22, fontWeight: "800", color: Colors.text, letterSpacing: -0.4 }}>
        Categorias
      </Text>
      <Text style={{ fontSize: 12, color: Colors.textSec, marginTop: 2 }}>
        Organize seus gastos
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg }}>
        {header}
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg }}>
        {header}
        <View style={{ padding: 16 }}>
          <InlineError onRetry={refetch} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      {header}
      <FlatList
        data={categories}
        keyExtractor={(item) => item?.id ?? ""}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        ListHeaderComponent={
          <Card padding={12} style={{ marginBottom: 4, gap: 10 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TextInput
                style={{
                  flex: 1,
                  height: 40,
                  borderWidth: 1.5,
                  borderColor: Colors.border,
                  borderRadius: Radius.sm,
                  paddingHorizontal: 12,
                  fontSize: 14,
                  color: Colors.text,
                  backgroundColor: Colors.surface,
                }}
                placeholder="Nova categoria..."
                placeholderTextColor={Colors.textTer}
                value={newCategoryName}
                onChangeText={setNewCategoryName}
              />
              <TouchableOpacity
                onPress={handleAddCategory}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: Radius.sm,
                  backgroundColor: Colors.primary,
                  alignItems: "center",
                  justifyContent: "center",
                  ...Shadow.sm,
                }}
              >
                <Text style={{ color: "#fff", fontSize: 22, lineHeight: 28, fontWeight: "300" }}>+</Text>
              </TouchableOpacity>
            </View>
            <TypeToggle value={newCategoryType} onChange={setNewCategoryType} />
          </Card>
        }
        renderItem={({ item: cat }) => {
          const cc = categoryColor(cat.name ?? "");
          const isOpen = expandedId === cat.id;

          return (
            <Card padding={0} style={{ overflow: "hidden" }}>
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14 }}
                onPress={() => setExpandedId(isOpen ? null : cat.id ?? null)}
                activeOpacity={0.7}
              >
                <View style={{
                  width: 36,
                  height: 36,
                  borderRadius: Radius.sm,
                  backgroundColor: cc.bg,
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <View style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: cc.dot }} />
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: Colors.text }}>
                    {cat.name}
                  </Text>
                  <TypeBadge type={cat.type} />
                </View>
                <Text style={{ fontSize: 12, color: Colors.textSec, marginRight: 4 }}>
                  {cat.subcategories?.length ?? 0} subcats
                </Text>
                <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                  <TouchableOpacity onPress={() => openEditModal(cat)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                    <Text style={{ color: Colors.primary, fontSize: 14 }}>✎</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteCategory(cat.id ?? "")} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                    <Text style={{ color: Colors.danger, fontSize: 13, fontWeight: "700" }}>✕</Text>
                  </TouchableOpacity>
                </View>
                <Text style={{ color: Colors.textTer, fontSize: 11, marginLeft: 4 }}>{isOpen ? "▲" : "▼"}</Text>
              </TouchableOpacity>

              {isOpen && (
                <View style={{ paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1, borderTopColor: Colors.border }}>
                  {(cat.subcategories ?? []).filter(Boolean).map((sub: Subcategory) => (
                    <View key={sub?.id ?? ""} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
                      <Text style={{ fontSize: 13.5, color: Colors.text }}>{sub?.name}</Text>
                      <TouchableOpacity
                        onPress={() => handleDeleteSubcategory(sub?.id ?? "")}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <Text style={{ color: Colors.danger, fontSize: 13, fontWeight: "700" }}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
                    <TextInput
                      placeholder="Nova subcategoria..."
                      placeholderTextColor={Colors.textTer}
                      style={{
                        flex: 1,
                        height: 38,
                        borderWidth: 1.5,
                        borderColor: Colors.border,
                        borderRadius: Radius.sm,
                        paddingHorizontal: 10,
                        fontSize: 13,
                        color: Colors.text,
                        backgroundColor: Colors.surface,
                      }}
                      value={newSubName[cat.id ?? ""] ?? ""}
                      onChangeText={(t) => setNewSubName((prev) => ({ ...prev, [cat.id ?? ""]: t }))}
                    />
                    <TouchableOpacity
                      onPress={() => handleAddSubcategory(cat.id ?? "")}
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: Radius.sm,
                        backgroundColor: Colors.primaryLight,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ color: Colors.primaryText, fontSize: 20, fontWeight: "700", lineHeight: 26 }}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Card>
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
          backgroundColor: "rgba(0,0,0,0.4)",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}>
          <View style={{
            backgroundColor: Colors.surface,
            borderRadius: Radius.lg,
            padding: 24,
            width: "100%",
            gap: 16,
            ...Shadow.md,
          }}>
            <Text style={{ fontSize: 17, fontWeight: "800", color: Colors.text }}>
              Editar categoria
            </Text>
            <TextInput
              style={{
                height: 44,
                borderWidth: 1.5,
                borderColor: Colors.border,
                borderRadius: Radius.sm,
                paddingHorizontal: 12,
                fontSize: 15,
                color: Colors.text,
                backgroundColor: Colors.surface,
              }}
              placeholder="Nome da categoria"
              placeholderTextColor={Colors.textTer}
              value={editName}
              onChangeText={setEditName}
              autoFocus
            />
            <TypeToggle value={editType} onChange={setEditType} />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={() => setEditingCat(null)}
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
                <Text style={{ fontSize: 14, fontWeight: "700", color: Colors.textSec }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveEdit}
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
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#fff" }}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
