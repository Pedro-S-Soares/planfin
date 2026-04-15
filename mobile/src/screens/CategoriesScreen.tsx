import { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
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

type Category = NonNullable<CategoriesQuery["categories"]>[number];
type Subcategory = NonNullable<NonNullable<Category>["subcategories"]>[number];

const refetchCategories = [{ query: CategoriesDocument }];

export function CategoriesScreen() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSubName, setNewSubName] = useState<Record<string, string>>({});

  const { data, loading } = useCategoriesQuery({ fetchPolicy: "network-only" });

  const [createCategory] = useCreateCategoryMutation({ refetchQueries: refetchCategories });
  const [updateCategory] = useUpdateCategoryMutation({ refetchQueries: refetchCategories });
  const [deleteCategory] = useDeleteCategoryMutation({ refetchQueries: refetchCategories });
  const [createSubcategory] = useCreateSubcategoryMutation({ refetchQueries: refetchCategories });
  const [deleteSubcategory] = useDeleteSubcategoryMutation({ refetchQueries: refetchCategories });

  const handleAddCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    createCategory({ variables: { name } });
    setNewCategoryName("");
  };

  const handleRenameCategory = (cat: NonNullable<Category>) => {
    Alert.prompt("Renomear categoria", "Novo nome:", (name) => {
      if (name?.trim()) updateCategory({ variables: { id: cat.id ?? "", name: name.trim() } });
    }, "plain-text", cat.name ?? "");
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

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View className="flex-1 pt-14 bg-neutral-100">
      <FlatList
        data={categories}
        keyExtractor={(item) => item?.id ?? ""}
        contentContainerClassName="p-4 gap-2.5"
        ListHeaderComponent={
          <View className="flex-row gap-2 mb-4">
            <TextInput
              className="flex-1 border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-white"
              placeholder="Nova categoria..."
              value={newCategoryName}
              onChangeText={setNewCategoryName}
            />
            <TouchableOpacity className="bg-blue-600 rounded-lg px-4 items-center justify-center" onPress={handleAddCategory}>
              <Text className="text-white text-xl font-bold">+</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item: cat }) => (
          <View className="bg-white rounded-xl overflow-hidden">
            <TouchableOpacity
              className="flex-row items-center justify-between p-4"
              onPress={() => setExpandedId(expandedId === cat.id ? null : cat.id ?? null)}
            >
              <Text className="text-[15px] font-semibold text-neutral-700 flex-1">{cat.name}</Text>
              <View className="flex-row items-center gap-3">
                <TouchableOpacity onPress={() => handleRenameCategory(cat)} className="p-1">
                  <Text className="text-blue-600 text-base">✎</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteCategory(cat.id ?? "")} className="p-1">
                  <Text className="text-red-500 text-sm font-semibold">✕</Text>
                </TouchableOpacity>
                <Text className="text-neutral-400 text-xs">{expandedId === cat.id ? "▲" : "▼"}</Text>
              </View>
            </TouchableOpacity>

            {expandedId === cat.id && (
              <View className="px-4 pb-3 border-t border-neutral-100">
                {(cat.subcategories ?? []).filter(Boolean).map((sub: Subcategory) => (
                  <View key={sub?.id ?? ""} className="flex-row justify-between items-center py-2 border-b border-neutral-50">
                    <Text className="text-sm text-neutral-600">{sub?.name}</Text>
                    <TouchableOpacity onPress={() => handleDeleteSubcategory(sub?.id ?? "")}>
                      <Text className="text-red-500 text-sm font-semibold">✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <View className="flex-row gap-2 mt-2">
                  <TextInput
                    className="flex-1 border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-white"
                    placeholder="Nova subcategoria..."
                    value={newSubName[cat.id ?? ""] ?? ""}
                    onChangeText={(t) => setNewSubName((prev) => ({ ...prev, [cat.id ?? ""]: t }))}
                  />
                  <TouchableOpacity className="bg-blue-600 rounded-lg px-4 items-center justify-center" onPress={() => handleAddSubcategory(cat.id ?? "")}>
                    <Text className="text-white text-xl font-bold">+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
}
