import { useState, type ReactNode } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { AppText } from "../../../components/ui/AppText";
import { Button } from "../../../components/ui/Button";
import { Chip } from "../../../components/ui/Chip";
import { SheetFooter } from "../../../components/ui/Sheet";
import { confirm } from "../../../lib/alert";
import { layout, palette, radius, space, textVariants } from "../../../theme";
import { categoryColor } from "../../../theme/tokens";
import { FormLabel as FieldLabel } from "../../finance/components/FormLabel";
import { ToggleRow } from "../../finance/components/ToggleRow";
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
      <View style={styles.chips}>
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
          <View style={styles.chips}>
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
    <ToggleRow
      title={title}
      description="Não conta no limite diário, só no orçamento total"
      value={value}
      onChange={onChange}
    />
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
    <View style={styles.noteField}>
      <FieldLabel>Nota</FieldLabel>
      <TextInput
        style={styles.noteInput}
        value={value}
        onChangeText={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={palette.muted}
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
    <View style={styles.moreOptions}>
      <Pressable
        accessibilityRole="button"
        aria-expanded={isOpen}
        onPress={() => setIsOpen((open) => !open)}
        style={[styles.moreOptionsToggle, isOpen ? styles.moreOptionsToggleOpen : null]}
      >
        <View style={styles.moreOptionsTexts}>
          <AppText variant="baseStrong" tone="accent">Mais opções</AppText>
          {isOpen ? null : <AppText variant="caption">{summary}</AppText>}
        </View>
        <MaterialCommunityIcons name={isOpen ? "chevron-up" : "chevron-down"} size={20} color={palette.accent} />
      </Pressable>
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
    <Button
      label={label}
      variant="destructive"
      isDisabled={isDisabled}
      style={styles.deleteButton}
      onPress={() =>
        confirm({ title: confirmTitle, message: confirmMessage, confirmLabel: "Excluir", destructive: true }, onConfirm)
      }
    />
  );
}

interface EntryFormLayoutProps {
  /** The fields, in a scrolling column. */
  children: ReactNode;
  /** Form error to show right above the save button. */
  error?: string;
  /** The save button, pinned at the bottom of the sheet. */
  submit: ReactNode;
}

/** Fields scroll; the save button stays pinned at the bottom, always in reach. */
export function EntryFormLayout({ children, error, submit }: EntryFormLayoutProps) {
  return (
    <View style={styles.formRoot}>
      <ScrollView
        style={styles.formScroll}
        contentContainerStyle={styles.formContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
      <SheetFooter>
        {error ? (
          <AppText variant="body" tone="danger" style={styles.formError}>
            {error}
          </AppText>
        ) : null}
        {submit}
      </SheetFooter>
    </View>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
    marginBottom: space.lg,
  },
  noteField: {
    marginBottom: space.lg,
  },
  noteInput: {
    ...textVariants.base,
    height: 48,
    borderWidth: 1,
    borderColor: palette.rule,
    borderRadius: radius.control,
    paddingHorizontal: 14,
    backgroundColor: palette.sheet,
  },
  moreOptions: {
    marginBottom: space.sm,
  },
  moreOptionsToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 48,
    borderTopWidth: 1,
    borderTopColor: palette.rule,
    paddingTop: space.sm,
  },
  moreOptionsToggleOpen: {
    marginBottom: space.md,
  },
  moreOptionsTexts: {
    flex: 1,
  },
  deleteButton: {
    marginTop: space.lg,
  },
  formRoot: {
    flex: 1,
    backgroundColor: palette.sheet,
  },
  formScroll: {
    flex: 1,
  },
  formContent: {
    padding: layout.gutter,
    paddingBottom: space.xl,
  },
  formError: {
    textAlign: "center",
    marginBottom: space.xs,
  },
});
