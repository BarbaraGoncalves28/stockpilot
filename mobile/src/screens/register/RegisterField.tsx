import { useState } from "react";
import {
  Pressable,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, s } from "../../styles/screens/register.styles";

type RegisterFieldProps = {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  password?: boolean;
  keyboardType?: TextInputProps["keyboardType"];
  autoCapitalize?: TextInputProps["autoCapitalize"];
};

export default function RegisterField({
  icon,
  placeholder,
  value,
  onChangeText,
  password = false,
  keyboardType = "default",
  autoCapitalize = "sentences",
}: RegisterFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={s.field}>
      <Ionicons name={icon} size={18} color={C.muted} />
      <TextInput
        style={s.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.muted}
        secureTextEntry={password && !visible}
        autoCapitalize={password || keyboardType === "email-address" ? "none" : autoCapitalize}
        autoCorrect={false}
        keyboardType={keyboardType}
        editable
      />
      {password && (
        <Pressable onPress={() => setVisible((current) => !current)} hitSlop={10}>
          <Ionicons
            name={visible ? "eye-off-outline" : "eye-outline"}
            size={18}
            color={C.muted}
          />
        </Pressable>
      )}
    </View>
  );
}
