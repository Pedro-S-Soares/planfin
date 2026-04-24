import { View, ViewStyle } from "react-native";
import { Colors, Radius, Shadow } from "../../theme/tokens";

interface CardProps {
  children: React.ReactNode;
  padding?: number;
  style?: ViewStyle;
}

export function Card({ children, padding = 18, style }: CardProps) {
  return (
    <View style={[{
      backgroundColor: Colors.surface,
      borderRadius: Radius.xl,
      padding,
      ...Shadow.md,
    }, style]}>
      {children}
    </View>
  );
}
