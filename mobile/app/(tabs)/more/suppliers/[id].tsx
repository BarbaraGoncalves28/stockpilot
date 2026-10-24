import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  router,
  useLocalSearchParams,
  useFocusEffect,
} from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../../../../src/auth/AuthContext";
import {
  deleteSupplier,
  getSupplier,
  restoreSupplier,
} from "../../../../src/modules/suppliers/supplierService";
import type { Supplier } from "../../../../src/modules/suppliers/supplier.types";
import { colors } from "../../../../src/theme/colors";
import { radius, shadows, spacing } from "../../../../src/theme/spacing";

export default function SupplierDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { accessToken, user } = useAuth();

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const isAdmin = user?.role === "ADMIN";
  const supplierId = Number(id);

  const loadSupplier = useCallback(async () => {
    if (!accessToken) {
      setError("Sessão expirada. Faça login novamente.");
      setLoading(false);
      return;
    }

    if (!Number.isInteger(supplierId) || supplierId <= 0) {
      setError("Fornecedor inválido.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getSupplier(accessToken, supplierId);
      setSupplier(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar o fornecedor.",
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken, supplierId]);

  useEffect(() => {
    void loadSupplier();
  }, [loadSupplier]);

  useFocusEffect(
    useCallback(() => {
      if (!accessToken) {
        return;
      }

      void loadSupplier();
    }, [accessToken, loadSupplier]),
  );

  async function performDelete() {
    if (!supplier || !accessToken || actionLoading) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await deleteSupplier(accessToken, supplier.id);

      router.replace("/(tabs)/more/suppliers");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível desativar o fornecedor.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  function handleDelete() {
    if (!supplier || !accessToken || actionLoading) {
      return;
    }

    const message = `Deseja realmente desativar "${supplier.name}"?`;

    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        `Desativar fornecedor\n\n${message}`,
      );

      if (confirmed) {
        void performDelete();
      }

      return;
    }

    Alert.alert("Desativar fornecedor", message, [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Desativar",
        style: "destructive",
        onPress: () => {
          void performDelete();
        },
      },
    ]);
  }

  async function performRestore() {
    if (!supplier || !accessToken || actionLoading) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const response = await restoreSupplier(accessToken, supplier.id);

      setSupplier(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível restaurar o fornecedor.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  function handleRestore() {
    if (!supplier || !accessToken || actionLoading) {
      return;
    }

    const message = `Deseja restaurar "${supplier.name}"?`;

    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        `Restaurar fornecedor\n\n${message}`,
      );

      if (confirmed) {
        void performRestore();
      }

      return;
    }

    Alert.alert("Restaurar fornecedor", message, [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Restaurar",
        onPress: () => {
          void performRestore();
        },
      },
    ]);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brand[500]} />
          <Text style={styles.loadingText}>Carregando fornecedor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!supplier) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <View style={styles.errorIcon}>
            <Ionicons
              name="alert-circle-outline"
              size={28}
              color={colors.danger}
            />
          </View>

          <Text style={styles.errorTitle}>Não foi possível carregar</Text>

          <Text style={styles.errorMessage}>
            {error || "Fornecedor não encontrado."}
          </Text>

          <Pressable
            style={styles.backButtonLarge}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Voltar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
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
            <Text style={styles.eyebrow}>FORNECEDOR</Text>
            <Text style={styles.title} numberOfLines={1}>
              {supplier.name}
            </Text>
          </View>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {supplier.name.trim().charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={styles.heroMain}>
            <Text style={styles.heroName}>{supplier.name}</Text>

            <View
              style={[
                styles.statusBadge,
                supplier.is_active
                  ? styles.activeBadge
                  : styles.inactiveBadge,
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  supplier.is_active
                    ? styles.activeDot
                    : styles.inactiveDot,
                ]}
              />

              <Text
                style={[
                  styles.statusText,
                  supplier.is_active
                    ? styles.activeText
                    : styles.inactiveText,
                ]}
              >
                {supplier.is_active
                  ? "Fornecedor ativo"
                  : "Fornecedor inativo"}
              </Text>
            </View>
          </View>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons
              name="alert-circle-outline"
              size={18}
              color={colors.danger}
            />
            <Text style={styles.errorBoxText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações de contato</Text>

          <View style={styles.infoCard}>
            <InfoRow
              icon="mail-outline"
              label="E-mail"
              value={supplier.email}
            />
            <InfoRow
              icon="call-outline"
              label="Telefone"
              value={supplier.phone}
            />
            <InfoRow
              icon="document-text-outline"
              label="Documento"
              value={supplier.document}
            />
            <InfoRow
              icon="location-outline"
              label="Endereço"
              value={supplier.address}
              last
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações do cadastro</Text>

          <View style={styles.infoCard}>
            <InfoRow
              icon="calendar-outline"
              label="Cadastrado em"
              value={formatDate(supplier.created_at)}
            />
            <InfoRow
              icon="time-outline"
              label="Atualizado em"
              value={formatDate(supplier.updated_at)}
              last
            />
          </View>
        </View>

        {isAdmin ? (
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/more/suppliers/[id]/edit",
                  params: {
                    id: String(supplier.id),
                  },
                })
              }
              disabled={actionLoading}
            >
              <Ionicons
                name="create-outline"
                size={20}
                color={colors.text.inverse}
              />
              <Text style={styles.primaryButtonText}>
                Editar fornecedor
              </Text>
            </Pressable>

            {supplier.is_active ? (
              <Pressable
                style={({ pressed }) => [
                  styles.dangerButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleDelete}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color={colors.danger} />
                ) : (
                  <>
                    <Ionicons
                      name="archive-outline"
                      size={20}
                      color={colors.danger}
                    />
                    <Text style={styles.dangerButtonText}>
                      Desativar fornecedor
                    </Text>
                  </>
                )}
              </Pressable>
            ) : (
              <Pressable
                style={({ pressed }) => [
                  styles.restoreButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleRestore}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color={colors.teal[700]} />
                ) : (
                  <>
                    <Ionicons
                      name="refresh-outline"
                      size={20}
                      color={colors.teal[700]}
                    />
                    <Text style={styles.restoreButtonText}>
                      Restaurar fornecedor
                    </Text>
                  </>
                )}
              </Pressable>
            )}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

type InfoRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | null;
  last?: boolean;
};

function InfoRow({
  icon,
  label,
  value,
  last = false,
}: InfoRowProps) {
  return (
    <View
      style={[
        styles.infoRow,
        last ? undefined : styles.infoRowBorder,
      ]}
    >
      <View style={styles.infoIcon}>
        <Ionicons
          name={icon}
          size={18}
          color={colors.brand[500]}
        />
      </View>

      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>
          {value || "Não informado"}
        </Text>
      </View>
    </View>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  content: {
    padding: spacing[5],
    paddingBottom: spacing[12],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing[5],
  },
  backButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: colors.surface.light,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  headerText: {
    flex: 1,
    marginLeft: spacing[3],
  },
  eyebrow: {
    color: colors.brand[500],
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 3,
  },
  title: {
    color: colors.text.primary,
    fontSize: 22,
    fontWeight: "800",
  },
  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing[5],
    marginBottom: spacing[5],
    backgroundColor: colors.surface.light,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.soft,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brand[50],
  },
  avatarText: {
    color: colors.brand[600],
    fontSize: 25,
    fontWeight: "800",
  },
  heroMain: {
    flex: 1,
    marginLeft: spacing[4],
  },
  heroName: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: spacing[2],
  },
  statusBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.full,
    paddingHorizontal: spacing[2],
    paddingVertical: 6,
  },
  activeBadge: {
    backgroundColor: colors.teal[50],
  },
  inactiveBadge: {
    backgroundColor: colors.neutral[100],
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
    marginRight: 6,
  },
  activeDot: {
    backgroundColor: colors.success,
  },
  inactiveDot: {
    backgroundColor: colors.text.muted,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  activeText: {
    color: colors.teal[700],
  },
  inactiveText: {
    color: colors.text.secondary,
  },
  section: {
    marginBottom: spacing[5],
  },
  sectionTitle: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: spacing[2],
  },
  infoCard: {
    backgroundColor: colors.surface.light,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
    paddingHorizontal: spacing[4],
    ...shadows.soft,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing[4],
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.brand[50],
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing[3],
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: colors.text.muted,
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 3,
  },
  infoValue: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  actions: {
    gap: spacing[3],
    marginTop: spacing[2],
  },
  primaryButton: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
    borderRadius: radius.md,
    backgroundColor: colors.brand[500],
    ...shadows.floating,
  },
  primaryButtonText: {
    color: colors.text.inverse,
    fontSize: 14,
    fontWeight: "800",
  },
  dangerButton: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
    borderRadius: radius.md,
    backgroundColor: colors.coral[50],
    borderWidth: 1,
    borderColor: colors.coral[100],
  },
  dangerButtonText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "800",
  },
  restoreButton: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
    borderRadius: radius.md,
    backgroundColor: colors.teal[50],
    borderWidth: 1,
    borderColor: colors.teal[100],
  },
  restoreButtonText: {
    color: colors.teal[700],
    fontSize: 14,
    fontWeight: "800",
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: spacing[3],
    marginBottom: spacing[4],
    borderRadius: radius.md,
    backgroundColor: colors.coral[50],
    borderWidth: 1,
    borderColor: colors.coral[100],
  },
  errorBoxText: {
    flex: 1,
    marginLeft: spacing[2],
    color: colors.danger,
    fontSize: 13,
    lineHeight: 19,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing[6],
  },
  loadingText: {
    color: colors.text.secondary,
    fontSize: 14,
    marginTop: spacing[3],
  },
  errorIcon: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing[4],
    borderRadius: radius.full,
    backgroundColor: colors.coral[50],
  },
  errorTitle: {
    marginBottom: spacing[2],
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  errorMessage: {
    maxWidth: 320,
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  backButtonLarge: {
    marginTop: spacing[5],
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    borderRadius: radius.md,
    backgroundColor: colors.brand[500],
  },
  backButtonText: {
    color: colors.text.inverse,
    fontSize: 14,
    fontWeight: "700",
  },
});