import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";

import { useAuth } from "../../../../src/auth/AuthContext";
import { createCategory } from "../../../../src/modules/categories/categoryService";
import { colors } from "../../../../src/theme/colors";
import {
  radius,
  shadows,
  spacing,
} from "../../../../src/theme/spacing";

export default function CreateCategoryScreen() {
  const { accessToken, user } = useAuth();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isAdmin = user?.role === "ADMIN";

  async function handleCreate() {
    if (!accessToken) {
      setError("Sessão inválida. Faça login novamente.");
      return;
    }

    if (!isAdmin) {
      setError(
        "Você não tem permissão para cadastrar categorias.",
      );
      return;
    }

    if (!name.trim()) {
      setError("Informe o nome da categoria.");
      return;
    }

    try {
      setError("");
      setLoading(true);

      await createCategory(
        accessToken,
        {
          name: name.trim(),
          description: description.trim() || undefined,
        },
      );

      router.replace("/(tabs)/more/categories");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível cadastrar a categoria.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!isAdmin) {
    return (
      <View style={styles.centeredScreen}>
        <View style={styles.permissionIcon}>
          <Ionicons
            name="lock-closed-outline"
            size={30}
            color={colors.danger}
          />
        </View>

        <Text style={styles.permissionTitle}>
          Acesso restrito
        </Text>

        <Text style={styles.permissionDescription}>
          Apenas administradores podem cadastrar categorias.
        </Text>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.secondaryButtonText}>
            Voltar
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color={colors.text.primary}
            />
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.title}>
              Nova categoria
            </Text>

            <Text style={styles.subtitle}>
              Cadastre uma categoria para organizar seus produtos.
            </Text>
          </View>
        </View>

        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <View style={styles.formIcon}>
              <Ionicons
                name="pricetags-outline"
                size={21}
                color={colors.brand[500]}
              />
            </View>

            <View style={styles.formHeaderText}>
              <Text style={styles.formTitle}>
                Informações da categoria
              </Text>

              <Text style={styles.formSubtitle}>
                Preencha os dados abaixo.
              </Text>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Nome
            </Text>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Ex.: Eletrônicos"
              placeholderTextColor={colors.text.muted}
              style={styles.input}
              autoCapitalize="words"
              editable={!loading}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Descrição
              <Text style={styles.optional}>
                {" "}opcional
              </Text>
            </Text>

            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Descreva brevemente esta categoria..."
              placeholderTextColor={colors.text.muted}
              style={[
                styles.input,
                styles.textArea,
              ]}
              multiline
              textAlignVertical="top"
              editable={!loading}
            />
          </View>

          {error ? (
            <View style={styles.errorCard}>
              <Ionicons
                name="alert-circle-outline"
                size={20}
                color={colors.danger}
              />

              <Text style={styles.errorText}>
                {error}
              </Text>
            </View>
          ) : null}

          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              pressed && styles.buttonPressed,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator
                size="small"
                color={colors.text.inverse}
              />
            ) : (
              <Ionicons
                name="checkmark"
                size={20}
                color={colors.text.inverse}
              />
            )}

            <Text style={styles.submitButtonText}>
              {loading
                ? "Cadastrando..."
                : "Cadastrar categoria"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background.light,
  },

  content: {
    padding: spacing[4],
    paddingTop: spacing[6],
    paddingBottom: spacing[10],
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing[3],
    marginBottom: spacing[5],
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface.light,
    borderWidth: 1,
    borderColor: colors.border.light,
  },

  headerText: {
    flex: 1,
    paddingTop: 1,
  },

  title: {
    color: colors.text.primary,
    fontSize: 27,
    fontWeight: "800",
    letterSpacing: -0.6,
  },

  subtitle: {
    color: colors.text.secondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing[1],
  },

  formCard: {
    backgroundColor: colors.surface.light,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: radius.xl,
    padding: spacing[5],
    ...shadows.soft,
  },

  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    marginBottom: spacing[6],
  },

  formIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brand[50],
  },

  formHeaderText: {
    flex: 1,
  },

  formTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "700",
  },

  formSubtitle: {
    color: colors.text.secondary,
    fontSize: 12,
    marginTop: 2,
  },

  field: {
    marginBottom: spacing[5],
  },

  label: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: spacing[2],
  },

  optional: {
    color: colors.text.muted,
    fontWeight: "500",
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: radius.md,
    backgroundColor: colors.neutral[50],
    color: colors.text.primary,
    fontSize: 14,
    paddingHorizontal: spacing[4],
  },

  textArea: {
    height: 120,
    paddingTop: spacing[3],
    paddingBottom: spacing[3],
  },

  errorCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing[2],
    backgroundColor: colors.coral[50],
    borderWidth: 1,
    borderColor: colors.coral[100],
    borderRadius: radius.md,
    padding: spacing[3],
    marginBottom: spacing[4],
  },

  errorText: {
    flex: 1,
    color: colors.coral[700],
    fontSize: 12,
    lineHeight: 18,
  },

  submitButton: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
    backgroundColor: colors.brand[500],
    borderRadius: radius.md,
    paddingHorizontal: spacing[4],
    ...shadows.floating,
  },

  buttonPressed: {
    opacity: 0.85,
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  submitButtonText: {
    color: colors.text.inverse,
    fontSize: 14,
    fontWeight: "700",
  },

  centeredScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background.light,
    padding: spacing[6],
  },

  permissionIcon: {
    width: 68,
    height: 68,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.coral[50],
    marginBottom: spacing[4],
  },

  permissionTitle: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: "800",
  },

  permissionDescription: {
    color: colors.text.secondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: spacing[2],
    maxWidth: 300,
  },

  secondaryButton: {
    backgroundColor: colors.surface.light,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: radius.md,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    marginTop: spacing[5],
  },

  secondaryButtonText: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: "700",
  },
});
