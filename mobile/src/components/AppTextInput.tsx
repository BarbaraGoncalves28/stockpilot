import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import { colors } from "../theme/colors";
import { radius, spacing } from "../theme/spacing";

type AppTextInputProps = TextInputProps & {
  label: string;
  error?: string;
};

export function AppTextInput({
  label,
  error,
  ...props
}: AppTextInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        {...props}
        placeholderTextColor={colors.text.muted}
        style={[
          styles.input,
          error ? styles.inputError : undefined,
        ]}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },

  label: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: spacing[2],
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: radius.md,
    backgroundColor: colors.surface.light,
    color: colors.text.primary,
    fontSize: 15,
    paddingHorizontal: spacing[4],
  },

  inputError: {
    borderColor: colors.danger,
  },

  error: {
    color: colors.danger,
    fontSize: 12,
    marginTop: spacing[1],
  },
});