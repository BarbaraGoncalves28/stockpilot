
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../../../../../src/auth/AuthContext";
import {
  getCategory,
  updateCategory,
} from "../../../../../src/modules/categories/categoryService";
import type { Category } from "../../../../../src/modules/categories/category.types";
import { colors } from "../../../../../src/theme/colors";
import { radius, shadows, spacing } from "../../../../../src/theme/spacing";

export default function EditCategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { accessToken, user } = useAuth();

  const categoryId = Number(id);
  const isAdmin = user?.role === "ADMIN";

  const [category, setCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadCategory = useCallback(async () => {
    if (!accessToken || !Number.isInteger(categoryId) || categoryId <= 0) {
      setError("Identificador de categoria inválido.");
      setLoading(false);
      return;
    }

    try {
      setError("");
      const data = await getCategory(accessToken, categoryId);
      setCategory(data);
      setName(data.name);
      setDescription(data.description ?? "");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar a categoria.",
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken, categoryId]);

  useEffect(() => {
    loadCategory();
  }, [loadCategory]);

  const handleSave = async () => {
    if (!accessToken || !category) return;

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (trimmedName.length < 2) {
      setError("O nome deve ter pelo menos 2 caracteres.");
      return;
    }

    if (trimmedName.length > 100) {
      setError("O nome deve ter no máximo 100 caracteres.");
      return;
    }

    if (trimmedDescription.length > 255) {
      setError("A descrição deve ter no máximo 255 caracteres.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await updateCategory(accessToken, category.id, {
        name: trimmedName,
        description: trimmedDescription || null,
      });

      Alert.alert("Categoria atualizada", "As alterações foram salvas.", [
        {
          text: "OK",
          onPress: () =>
            router.replace({
              pathname: "/(tabs)/more/categories/[id]",
              params: { id: String(category.id) },
            }),
        },
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível atualizar a categoria.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <View style={styles.center}>
        <Ionicons
          name="lock-closed-outline"
          size={36}
          color={colors.neutral[500]}
        />
        <Text style={styles.permissionTitle}>Acesso restrito</Text>
        <Text style={styles.permissionText}>
          Apenas administradores podem editar categorias.
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace("/(tabs)/more/categories")}
        >
          <Text style={styles.primaryButtonText}>Voltar às categorias</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.brand[500]} />
        <Text style={styles.loadingText}>Carregando categoria...</Text>
      </View>
    );
  }

  if (!category) {
    return (
      <View style={styles.center}>
        <Ionicons
          name="alert-circle-outline"
          size={36}
          color={colors.coral[500]}
        />
        <Text style={styles.permissionTitle}>Não foi possível abrir</Text>
        <Text style={styles.permissionText}>
          {error || "Categoria não encontrada."}
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace("/(tabs)/more/categories")}
        >
          <Text style={styles.primaryButtonText}>Voltar às categorias</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            router.replace({
              pathname: "/(tabs)/more/categories/[id]",
              params: { id: String(category.id) },
            })
          }
        >
          <Ionicons name="arrow-back" size={22} color={colors.neutral[700]} />
          <Text style={styles.backText}>Detalhes da categoria</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Editar categoria</Text>
          <Text style={styles.subtitle}>
            Atualize as informações da categoria.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Nome da categoria *</Text>
          <TextInput
            value={name}
            onChangeText={(value) => {
              setName(value);
              if (error) setError("");
            }}
            placeholder="Ex.: Eletrônicos"
            placeholderTextColor={colors.text.muted}
            maxLength={100}
            autoCapitalize="sentences"
            style={styles.input}
          />
          <Text style={styles.helperText}>{name.length}/100 caracteres</Text>

          <Text style={[styles.label, styles.descriptionLabel]}>
            Descrição
          </Text>
          <TextInput
            value={description}
            onChangeText={(value) => {
              setDescription(value);
              if (error) setError("");
            }}
            placeholder="Descreva essa categoria (opcional)"
            placeholderTextColor={colors.text.muted}
            maxLength={255}
            multiline
            textAlignVertical="top"
            style={[styles.input, styles.textArea]}
          />
          <Text style={styles.helperText}>
            {description.length}/255 caracteres
          </Text>

          {!!error && (
            <View style={styles.errorContainer}>
              <Ionicons
                name="alert-circle-outline"
                size={18}
                color={colors.coral[600]}
              />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, saving && styles.disabledButton]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="save-outline" size={19} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Salvar alterações</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() =>
            router.replace({
              pathname: "/(tabs)/more/categories/[id]",
              params: { id: String(category.id) },
            })
          }
          disabled={saving}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background.light },
  container: {
    flexGrow: 1,
    padding: spacing[5],
    paddingBottom: spacing[10],
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background.light,
    padding: spacing[5],
    gap: spacing[3],
  },
  loadingText: { color: colors.text.secondary, fontSize: 14 },
  permissionTitle: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  permissionText: {
    color: colors.text.secondary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    alignSelf: "flex-start",
    paddingVertical: spacing[2],
    marginBottom: spacing[5],
  },
  backText: { color: colors.neutral[700], fontSize: 15, fontWeight: "600" },
  header: { marginBottom: spacing[5] },
  title: {
    color: colors.text.primary,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: spacing[1],
  },
  subtitle: { color: colors.text.secondary, fontSize: 14, lineHeight: 21 },
  card: {
    backgroundColor: colors.surface.light,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing[5],
    marginBottom: spacing[5],
    ...shadows.soft,
  },
  label: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: spacing[2],
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: radius.md,
    backgroundColor: colors.neutral[50],
    paddingHorizontal: spacing[3],
    color: colors.text.primary,
    fontSize: 15,
  },
  helperText: {
    color: colors.text.muted,
    fontSize: 12,
    textAlign: "right",
    marginTop: spacing[1],
  },
  descriptionLabel: { marginTop: spacing[5] },
  textArea: { minHeight: 120, paddingTop: spacing[3] },
  errorContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing[2],
    backgroundColor: colors.coral[50],
    borderRadius: radius.md,
    padding: spacing[3],
    marginTop: spacing[4],
  },
  errorText: {
    flex: 1,
    color: colors.coral[700],
    fontSize: 13,
    lineHeight: 19,
  },
  primaryButton: {
    minHeight: 50,
    borderRadius: radius.lg,
    backgroundColor: colors.brand[500],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
    paddingHorizontal: spacing[4],
  },
  disabledButton: { opacity: 0.6 },
  primaryButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  cancelButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing[2],
  },
  cancelButtonText: {
    color: colors.text.secondary,
    fontSize: 15,
    fontWeight: "600",
  },
});
