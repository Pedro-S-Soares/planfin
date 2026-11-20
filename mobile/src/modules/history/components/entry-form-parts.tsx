import { useState, type ReactNode } from "react";
import { Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Chip } from "../../../components/ui/Chip";
import { confirm } from "../../../lib/alert";
import { categoryColor, Ledger } from "../../../theme/tokens";
import { FormLabel as FieldLabel } from "../../finance/components/FormLabel";
import type { CategoriesQuery } from "../../../graphql/__generated__/graphql";

type Category = NonNullable<NonNullable<CategoriesQuery["categories"]>[number]>;
type Subcategory = NonNullable<NonNullable<Category["subcategories"]>[number]>;

export { FieldLabel };

interface CategoryFieldProps {
  categories: CategoriesQuery["categories"];
  categoryId: string;
  subcategoryId: string;
  onCategoryChange: (categoryId: string) => void;
  onSubcategoryChange: (subcategoryId: string) => void;
}

/** Category chips, then the chosen category's subcategories. Tapping the selected chip clears it. */
export function CategoryField({
  categories,
  categoryId,
  subcategoryId,
  onCategoryChange,
  onSubcategoryChange,
}: CategoryFieldProps) {
  const list = (categories ?? []).filter((c): c is Category => c !== null);
  const selected = list.find((c) => c.id === categoryId);
  const subcategories = (selected?.subcategories ?? []).filter((s): s is Subcategory => s !== null);

  return (
    <>
      <FieldLabel>Categoria</FieldLabel>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 16 }}>
        {list.map((cat) => (
          <Chip
            key={cat.id}
            label={cat.name ?? ""}
            selected={categoryId === cat.id}
            dot={categoryColor(cat.name ?? "").dot}
            icon={cat.icon}
            onPress={() => onCategoryChange(categoryId === cat.id ? "" : cat.id ?? "")}
          />
        ))}
      </View>

      {subcategories.length > 0 ? (
        <>
          <FieldLabel>{`Subcategoria de ${selected?.name ?? "categoria"}`}</FieldLabel>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 16 }}>
            {subcategories.map((sub) => (
              <Chip
                key={sub.id}
                label={sub.name ?? ""}
                selected={subcategoryId === sub.id}
                onPress={() => onSubcategoryChange(subcategoryId === sub.id ? "" : sub.id ?? "")}
              />
            ))}
          </View>
        </>
      ) : null}
    </>
  );
}

interface ExtraToggleProps {
  title: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function ExtraToggle({ title, value, onChange }: ExtraToggleProps) {
  return (
    <TouchableOpacity
      onPress={() => onChange(!value)}
      activeOpacity={0.8}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: value ? Ledger.accentSoft : Ledger.paper,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: value ? Ledger.accent : Ledger.rule,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 16,
      }}
    >
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={{ fontSize: 14, fontWeight: "700", color: value ? Ledger.accent : Ledger.ink }}>{title}</Text>
        <Text style={{ fontSize: 12, color: Ledger.muted, marginTop: 2 }}>
          Não conta no limite diário, só no orçamento total
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: Ledger.rule, true: Ledger.accent }}
        thumbColor="#fff"
      />
    </TouchableOpacity>
  );
}

interface NoteFieldProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  placeholder: string;
}

export function NoteField({ value, onChange, onBlur, placeholder }: NoteFieldProps) {
  return (
    <View style={{ marginBottom: 16 }}>
      <FieldLabel>Nota</FieldLabel>
      <TextInput
        style={{
          height: 48,
          borderWidth: 1,
          borderColor: Ledger.rule,
          borderRadius: 8,
          paddingHorizontal: 14,
          fontSize: 16,
          color: Ledger.ink,
          backgroundColor: Ledger.sheet,
        }}
        value={value}
        onChangeText={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={Ledger.muted}
      />
    </View>
  );
}

interface MoreOptionsProps {
  /** What is inside, e.g. "parcelas, orçamento, extra, nota". */
  summary: string;
  /** Open from the start, so an edit never hides a value already set (a note, an installment). */
  isInitiallyOpen?: boolean;
  children: ReactNode;
}

/** The rarely used fields, folded under one line so value → categoria → conta → data come first. */
export function MoreOptions({ summary, isInitiallyOpen = false, children }: MoreOptionsProps) {
  const [isOpen, setIsOpen] = useState(isInitiallyOpen);

  return (
    <View style={{ marginBottom: 8 }}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        onPress={() => setIsOpen((open) => !open)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: 48,
          borderTopWidth: 1,
          borderTopColor: Ledger.rule,
          marginBottom: isOpen ? 12 : 0,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: "600", color: Ledger.accent }}>Mais opções</Text>
          {isOpen ? null : <Text style={{ fontSize: 12, color: Ledger.muted, marginTop: 1 }}>{summary}</Text>}
        </View>
        <Text style={{ fontSize: 14, color: Ledger.accent }}>{isOpen ? "▴" : "▾"}</Text>
      </TouchableOpacity>
      {isOpen ? children : null}
    </View>
  );
}

interface DeleteEntryButtonProps {
  label: string;
  /** Confirmation dialog: deleting is never one tap away. */
  confirmTitle: string;
  confirmMessage?: string;
  isDisabled?: boolean;
  onConfirm: () => void;
}

/** Destructive action of the edit sheet: danger text with no fill, always behind a confirmation. */
export function DeleteEntryButton({ label, confirmTitle, confirmMessage, isDisabled, onConfirm }: DeleteEntryButtonProps) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={() =>
        confirm({ title: confirmTitle, message: confirmMessage, confirmLabel: "Excluir", destructive: true }, onConfirm)
      }
      style={{ height: 48, alignItems: "center", justifyContent: "center", marginTop: 8, opacity: isDisabled ? 0.5 : 1 }}
    >
      <Text style={{ fontSize: 16, fontWeight: "600", color: Ledger.danger }}>{label}</Text>
    </TouchableOpacity>
  );
}
