import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, s } from "../../styles/screens/login.styles";

type LoginFieldProps = {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  password?: boolean;
};

export default function LoginField({
  icon,
  placeholder,
  value,
  onChangeText,
  password = false,
}: LoginFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={s.field}>
      <Ionicons name={icon} size={20} color={C.white} />
      <TextInput
        style={s.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.muted}
        secureTextEntry={password && !visible}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType={placeholder === "E-mail" ? "email-address" : "default"}
      />
      {password && (
        <Pressable onPress={() => setVisible((v) => !v)} hitSlop={10}>
          <Ionicons
            name={visible ? "eye-off-outline" : "eye-outline"}
            size={21}
            color={C.muted}
          />
        </Pressable>
      )}
    </View>
  );
}
