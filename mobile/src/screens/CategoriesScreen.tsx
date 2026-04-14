import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";

const CATEGORIES_QUERY = gql`
  query Categories {
    categories {
      id
      name
      subcategories {
        id
        name
      }
    }
  }
`;

const CREATE_CATEGORY_MUTATION = gql`
  mutation CreateCategory($name: String!) {
    createCategory(name: $name) { id name subcategories { id name } }
  }
`;

const UPDATE_CATEGORY_MUTATION = gql`
  mutation UpdateCategory($id: ID!, $name: String!) {
    updateCategory(id: $id, name: $name) { id name }
  }
`;

const DELETE_CATEGORY_MUTATION = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`;

const CREATE_SUBCATEGORY_MUTATION = gql`
  mutation CreateSubcategory($categoryId: ID!, $name: String!) {
    createSubcategory(categoryId: $categoryId, name: $name) { id name }
  }
`;

const DELETE_SUBCATEGORY_MUTATION = gql`
  mutation DeleteSubcategory($id: ID!) {
    deleteSubcategory(id: $id)
  }
`;

type Subcategory = { id: string; name: string };
type Category = { id: string; name: string; subcategories: Subcategory[] };

const refetchCategories = [{ query: CATEGORIES_QUERY }];

export function CategoriesScreen() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSubName, setNewSubName] = useState<Record<string, string>>({});

  const { data, loading } = useQuery<{ categories: Category[] }>(CATEGORIES_QUERY, {
    fetchPolicy: "network-only",
  });

  const [createCategory] = useMutation(CREATE_CATEGORY_MUTATION, { refetchQueries: refetchCategories });
  const [updateCategory] = useMutation(UPDATE_CATEGORY_MUTATION, { refetchQueries: refetchCategories });
  const [deleteCategory] = useMutation(DELETE_CATEGORY_MUTATION, { refetchQueries: refetchCategories });
  const [createSubcategory] = useMutation(CREATE_SUBCATEGORY_MUTATION, { refetchQueries: refetchCategories });
  const [deleteSubcategory] = useMutation(DELETE_SUBCATEGORY_MUTATION, { refetchQueries: refetchCategories });

  const handleAddCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    createCategory({ variables: { name } });
    setNewCategoryName("");
  };

  const handleRenameCategory = (cat: Category) => {
    Alert.prompt("Renomear categoria", "Novo nome:", (name) => {
      if (name?.trim()) updateCategory({ variables: { id: cat.id, name: name.trim() } });
    }, "plain-text", cat.name);
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

  const categories = data?.categories ?? [];

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.addRow}>
            <TextInput
              style={styles.addInput}
              placeholder="Nova categoria..."
              value={newCategoryName}
              onChangeText={setNewCategoryName}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddCategory}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item: cat }) => (
          <View style={styles.categoryCard}>
            <TouchableOpacity
              style={styles.categoryHeader}
              onPress={() => setExpandedId(expandedId === cat.id ? null : cat.id)}
            >
              <Text style={styles.categoryName}>{cat.name}</Text>
              <View style={styles.categoryActions}>
                <TouchableOpacity onPress={() => handleRenameCategory(cat)} style={styles.actionBtn}>
                  <Text style={styles.editText}>✎</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteCategory(cat.id)} style={styles.actionBtn}>
                  <Text style={styles.deleteText}>✕</Text>
                </TouchableOpacity>
                <Text style={styles.chevron}>{expandedId === cat.id ? "▲" : "▼"}</Text>
              </View>
            </TouchableOpacity>

            {expandedId === cat.id && (
              <View style={styles.subcategorySection}>
                {cat.subcategories.map((sub: Subcategory) => (
                  <View key={sub.id} style={styles.subRow}>
                    <Text style={styles.subName}>{sub.name}</Text>
                    <TouchableOpacity onPress={() => handleDeleteSubcategory(sub.id)}>
                      <Text style={styles.deleteText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <View style={styles.addRow}>
                  <TextInput
                    style={[styles.addInput, styles.addInputSm]}
                    placeholder="Nova subcategoria..."
                    value={newSubName[cat.id] ?? ""}
                    onChangeText={(t) => setNewSubName((prev) => ({ ...prev, [cat.id]: t }))}
                  />
                  <TouchableOpacity style={styles.addButton} onPress={() => handleAddSubcategory(cat.id)}>
                    <Text style={styles.addButtonText}>+</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: 16, gap: 10 },
  addRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  addInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  addInputSm: { marginBottom: 0 },
  addButton: {
    backgroundColor: "#2563EB",
    borderRadius: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  categoryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  categoryName: { fontSize: 15, fontWeight: "600", color: "#333", flex: 1 },
  categoryActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  actionBtn: { padding: 4 },
  editText: { color: "#2563EB", fontSize: 16 },
  deleteText: { color: "#ef4444", fontSize: 14, fontWeight: "600" },
  chevron: { color: "#999", fontSize: 12 },
  subcategorySection: { paddingHorizontal: 16, paddingBottom: 12, borderTopWidth: 1, borderTopColor: "#f0f0f0" },
  subRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f9f9f9",
  },
  subName: { fontSize: 14, color: "#555" },
});
