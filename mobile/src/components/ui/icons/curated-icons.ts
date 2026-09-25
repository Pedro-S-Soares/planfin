import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export function isIconName(name: string | null | undefined): name is IconName {
  return (
    typeof name === "string" &&
    Object.prototype.hasOwnProperty.call(MaterialCommunityIcons.glyphMap, name)
  );
}

// Icons shown in the picker before the user searches. Every name must exist in
// MaterialCommunityIcons.glyphMap — the IconName type enforces it at compile time.
export const CURATED_ICONS: readonly IconName[] = [
  // Food & drinks
  "food",
  "silverware-fork-knife",
  "food-apple",
  "coffee",
  "pizza",
  "hamburger",
  "cake-variant",
  "glass-wine",
  "beer",
  // Shopping
  "cart",
  "basket",
  "shopping",
  "store",
  "sale",
  "tag",
  "gift",
  // Money
  "cash",
  "cash-multiple",
  "credit-card",
  "wallet",
  "bank",
  "piggy-bank",
  "chart-line",
  "trending-up",
  "trending-down",
  "percent",
  "calculator",
  "receipt",
  // Work
  "briefcase",
  "laptop",
  "office-building",
  "file-document",
  "calendar",
  // Home & bills
  "home",
  "home-city",
  "lightbulb",
  "flash",
  "water",
  "fire",
  "wifi",
  "phone",
  "cellphone",
  "television",
  "tools",
  // Transport
  "car",
  "bus",
  "train",
  "airplane",
  "bike",
  "motorbike",
  "gas-station",
  "taxi",
  "parking",
  // Leisure
  "gamepad-variant",
  "movie",
  "music",
  "ticket",
  "party-popper",
  "beach",
  "palm-tree",
  "camera",
  "book-open-variant",
  // Education
  "school",
  "pencil",
  // Health & care
  "heart-pulse",
  "hospital-box",
  "pill",
  "medical-bag",
  "dumbbell",
  "run",
  "spa",
  "content-cut",
  "lipstick",
  // Clothing
  "tshirt-crew",
  "shoe-heel",
  "hanger",
  // Family & pets
  "paw",
  "dog",
  "cat",
  "baby-carriage",
  "human-male-female",
  "account-group",
  // Giving & protection
  "hand-heart",
  "charity",
  "church",
  "shield-check",
  // Nature
  "leaf",
  "flower",
  "tree",
  // Misc
  "star",
  "help-circle",
  "dots-horizontal",
];
