import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../../../../src/auth/AuthContext";
import {
  deleteCategory,
  getCategory,
  restoreCategory,
} from "../../../../src/modules/categories/categoryService";
import type { Category } from "../../../../src/modules/categories/category.types";
import { colors } from "../../../../src/theme/colors";
import { radius, shadows, spacing } from "../../../../src/theme/spacing";

export default function CategoryDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { accessToken, user } = useAuth();

  const categoryId = Number(id);
  const isAdmin = user?.role === "ADMIN";

  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
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


  const executeDeactivate = async () => {
    if (!category || !accessToken || actionLoading) return;

    try {
      setActionLoading(true);

      await deleteCategory(accessToken, category.id);
      await loadCategory();

      if (Platform.OS === "web") {
        window.alert("Categoria desativada com sucesso.");
      } else {
        Alert.alert(
          "Categoria desativada",
          "A categoria foi desativada com sucesso.",
        );
      }
    } catch (err) {
      const originalMessage =
        err instanceof Error ? err.message : "";

      const message = originalMessage.includes(
        "Cannot deactivate a category with active products.",
      )
        ? "Existem produtos ativos vinculados a esta categoria. Para desativá-la, primeiro altere ou desative os produtos associados."
        : originalMessage ||
          "Ocorreu um erro ao desativar a categoria.";

      if (Platform.OS === "web") {
        window.alert(
          `Não foi possível desativar a categoria.\n\n${message}`,
        );
      } else {
        Alert.alert("Não foi possível desativar a categoria", message);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivate = () => {
    if (!category || !accessToken || actionLoading) return;

    const message =
      "Tem certeza de que deseja desativar esta categoria? " +
      "Ela não poderá ser usada em novos produtos.";

    if (Platform.OS === "web") {
      if (window.confirm(message)) {
        void executeDeactivate();
      }
      return;
    }

    Alert.alert("Desativar categoria", message, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Desativar",
        style: "destructive",
        onPress: () => {
          void executeDeactivate();
        },
      },
    ]);
  };



  const handleRestore = () => {
    if (!category || !accessToken || actionLoading) return;

    const executeRestore = async () => {
      try {
        setActionLoading(true);
        setError("");

        await restoreCategory(accessToken, category.id);
        await loadCategory();

        if (Platform.OS === "web") {
          window.alert("Categoria restaurada com sucesso.");
        } else {
          Alert.alert(
            "Categoria restaurada",
            "A categoria está ativa novamente.",
          );
        }
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Ocorreu um erro ao restaurar a categoria.";

        if (Platform.OS === "web") {
          window.alert(
            `Não foi possível restaurar a categoria.\n\n${message}`,
          );
        } else {
          Alert.alert("Não foi possível restaurar", message);
        }
      } finally {
        setActionLoading(false);
      }
    };

    const message = "Deseja reativar esta categoria?";

    if (Platform.OS === "web") {
      if (window.confirm(message)) {
        void executeRestore();
      }
      return;
    }

    Alert.alert("Restaurar categoria", message, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Restaurar",
        onPress: () => {
          void executeRestore();
        },
      },
    ]);
  };


  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.brand[500]} />
        <Text style={styles.loadingText}>Carregando categoria...</Text>
      </View>
    );
  }

  if (error || !category) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/(tabs)/more/categories")}
        >
          <Ionicons name="arrow-back" size={22} color={colors.neutral[700]} />
          <Text style={styles.backText}>Categorias</Text>
        </TouchableOpacity>

        <View style={styles.messageCard}>
          <Ionicons
            name="alert-circle-outline"
            size={36}
            color={colors.coral[500]}
          />
          <Text style={styles.messageTitle}>Não foi possível abrir</Text>
          <Text style={styles.messageText}>
            {error || "Categoria não encontrada."}
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={loadCategory}>
            <Text style={styles.primaryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace("/(tabs)/more/categories")}
      >
        <Ionicons name="arrow-back" size={22} color={colors.neutral[700]} />
        <Text style={styles.backText}>Categorias</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="pricetags-outline"
            size={28}
            color={colors.brand[600]}
          />
        </View>
        <Text style={styles.title}>{category.name}</Text>
        <View
          style={[
            styles.statusBadge,
            category.is_active ? styles.activeBadge : styles.inactiveBadge,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: category.is_active
                  ? colors.teal[600]
                  : colors.neutral[500],
              },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              {
                color: category.is_active
                  ? colors.teal[700]
                  : colors.neutral[600],
              },
            ]}
          >
            {category.is_active ? "Ativa" : "Inativa"}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Informações</Text>

        <Text style={styles.fieldLabel}>Nome</Text>
        <Text style={styles.fieldValue}>{category.name}</Text>

        <View style={styles.separator} />

        <Text style={styles.fieldLabel}>Descrição</Text>
        <Text style={styles.fieldValue}>
          {category.description?.trim() || "Nenhuma descrição cadastrada."}
        </Text>

        <View style={styles.separator} />

        <Text style={styles.fieldLabel}>Criada em</Text>
        <Text style={styles.fieldValue}>
          {new Date(category.created_at).toLocaleDateString("pt-BR")}
        </Text>

        <View style={styles.separator} />

        <Text style={styles.fieldLabel}>Última atualização</Text>
        <Text style={styles.fieldValue}>
          {new Date(category.updated_at).toLocaleDateString("pt-BR")}
        </Text>
      </View>

      {isAdmin && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            disabled={actionLoading}
            onPress={() =>
              router.push({
                pathname: "/(tabs)/more/categories/[id]/edit",
                params: { id: String(category.id) },
              })
            }
          >
            <Ionicons name="create-outline" size={19} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Editar categoria</Text>
          </TouchableOpacity>

          {category.is_active ? (
            <TouchableOpacity
              style={styles.dangerButton}
              disabled={actionLoading}
              onPress={handleDeactivate}
            >
              {actionLoading ? (
                <ActivityIndicator color={colors.coral[600]} />
              ) : (
                <>
                  <Ionicons
                    name="remove-circle-outline"
                    size={19}
                    color={colors.coral[600]}
                  />
                  <Text style={styles.dangerButtonText}>
                    Desativar categoria
                  </Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.restoreButton}
              disabled={actionLoading}
              onPress={handleRestore}
            >
              {actionLoading ? (
                <ActivityIndicator color={colors.teal[700]} />
              ) : (
                <>
                  <Ionicons
                    name="refresh-circle-outline"
                    size={19}
                    color={colors.teal[700]}
                  />
                  <Text style={styles.restoreButtonText}>
                    Restaurar categoria
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
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
    gap: spacing[3],
  },
  loadingText: { color: colors.text.secondary, fontSize: 14 },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    alignSelf: "flex-start",
    paddingVertical: spacing[2],
    marginBottom: spacing[5],
  },
  backText: { color: colors.neutral[700], fontSize: 15, fontWeight: "600" },
  header: { alignItems: "center", marginBottom: spacing[6] },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    backgroundColor: colors.brand[50],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing[3],
  },
  title: {
    color: colors.text.primary,
    fontSize: 23,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: spacing[2],
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
  },
  activeBadge: { backgroundColor: colors.teal[50] },
  inactiveBadge: { backgroundColor: colors.neutral[100] },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: "600" },
  card: {
    backgroundColor: colors.surface.light,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing[5],
    ...shadows.soft,
  },
  sectionTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: spacing[4],
  },
  fieldLabel: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: spacing[1],
  },
  fieldValue: {
    color: colors.text.primary,
    fontSize: 15,
    lineHeight: 22,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing[4],
  },
  actions: { gap: spacing[3], marginTop: spacing[5] },
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
  primaryButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  dangerButton: {
    minHeight: 50,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.coral[500],
    backgroundColor: colors.coral[50],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
  },
  dangerButtonText: {
    color: colors.coral[600],
    fontSize: 15,
    fontWeight: "700",
  },
  restoreButton: {
    minHeight: 50,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.teal[600],
    backgroundColor: colors.teal[50],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
  },
  restoreButtonText: {
    color: colors.teal[700],
    fontSize: 15,
    fontWeight: "700",
  },
  messageCard: {
    alignItems: "center",
    backgroundColor: colors.surface.light,
    borderRadius: radius.xl,
    padding: spacing[5],
    gap: spacing[3],
    ...shadows.soft,
  },
  messageTitle: {
    color: colors.text.primary,
    fontSize: 17,
    fontWeight: "700",
  },
  messageText: {
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 21,
  },
});
