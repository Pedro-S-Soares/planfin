import { TextInput as NativeTextInput, type TextInputProps } from "react-native";
import { font, palette } from "../../theme";

/** react-native's TextInput in Manrope, with the theme's placeholder color. */
export function TextInput({ style, placeholderTextColor = palette.muted, ...rest }: TextInputProps) {
  return <NativeTextInput style={[font("medium"), style]} placeholderTextColor={placeholderTextColor} {...rest} />;
}
