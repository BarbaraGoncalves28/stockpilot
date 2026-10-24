import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  useFocusEffect,
  useRouter,
} from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../../../../src/auth/AuthContext";
import {
  getSuppliers,
} from "../../../../src/modules/suppliers/supplierService";
import type {
  Supplier,
} from "../../../../src/modules/suppliers/supplier.types";
import { colors } from "../../../../src/theme/colors";
import {
  radius,
  shadows,
  spacing,
} from "../../../../src/theme/spacing";

const PAGE_SIZE = 5;

export default function SuppliersScreen() {
  const router = useRouter();

  const {
    accessToken,
    user,
  } = useAuth();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const requestIdRef = useRef(0);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const isAdmin = user?.role === "ADMIN";

  function handleSearchChange(value: string) {
    requestIdRef.current += 1;
    setSearch(value);
  }

  const loadSuppliers = useCallback(
    async (
      targetPage = 1,
      append = false,
      currentSearch = debouncedSearch,
    ) => {
      if (!accessToken) {
        setError("Sessão expirada. Faça login novamente.");
        setLoading(false);
        return;
      }

      const requestId = ++requestIdRef.current;

      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await getSuppliers(accessToken, {
          page: targetPage,
          pageSize: PAGE_SIZE,
          search: currentSearch,
          isActive: undefined,
        });

        if (requestId !== requestIdRef.current) return;

        setSuppliers((current) =>
          append ? [...current, ...response.items] : response.items,
        );
        setPage(response.page);
        setTotal(response.total);
        setTotalPages(response.total_pages);
      } catch (err) {
        if (requestId === requestIdRef.current) {
          setError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar os fornecedores.",
          );
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
          setRefreshing(false);
        }
      }
    },
    [accessToken, debouncedSearch],
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      setDebouncedSearch(search.trim());
    }, 200);

    return () => clearTimeout(timeout);
  }, [search]);

  useFocusEffect(
    useCallback(() => {
      if (!accessToken) return;
      loadSuppliers(1, false, debouncedSearch);
    }, [accessToken, debouncedSearch, loadSuppliers]),
  );

  function handleRefresh() {
    setRefreshing(true);
    loadSuppliers(1, false, debouncedSearch);
  }

  function handleLoadMore() {
    if (
      loading ||
      loadingMore ||
      page >= totalPages
    ) {
      return;
    }

    loadSuppliers(
      page + 1,
      true,
      search,
    );
  }

  function renderSupplier({
    item,
  }: {
    item: Supplier;
  }) {
    return (
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/(tabs)/more/suppliers/[id]",
            params: { id: String(item.id) },
            })
        }
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
      >
        <View style={styles.cardTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.name
                .trim()
                .charAt(0)
                .toUpperCase()}
            </Text>
          </View>

          <View style={styles.cardMain}>
            <Text
              style={styles.name}
              numberOfLines={1}
            >
              {item.name}
            </Text>

            {item.email ? (
              <Text
                style={styles.secondary}
                numberOfLines={1}
              >
                {item.email}
              </Text>
            ) : item.phone ? (
              <Text
                style={styles.secondary}
                numberOfLines={1}
              >
                {item.phone}
              </Text>
            ) : (
              <Text style={styles.secondary}>
                Sem contato informado
              </Text>
            )}
          </View>

          <View
            style={[
              styles.statusBadge,
              item.is_active
                ? styles.activeBadge
                : styles.inactiveBadge,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                item.is_active
                  ? styles.activeDot
                  : styles.inactiveDot,
              ]}
            />

            <Text
              style={[
                styles.statusText,
                item.is_active
                  ? styles.activeText
                  : styles.inactiveText,
              ]}
            >
              {item.is_active
                ? "Ativo"
                : "Inativo"}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.details}>
          {item.phone ? (
            <View style={styles.detailItem}>
              <Ionicons
                name="call-outline"
                size={15}
                color={colors.text.muted}
              />

              <Text
                style={styles.detailText}
                numberOfLines={1}
              >
                {item.phone}
              </Text>
            </View>
          ) : null}

          {item.document ? (
            <View style={styles.detailItem}>
              <Ionicons
                name="document-text-outline"
                size={15}
                color={colors.text.muted}
              />

              <Text
                style={styles.detailText}
                numberOfLines={1}
              >
                {item.document}
              </Text>
            </View>
          ) : null}
        </View>
      </Pressable>
    );
  }

  function renderEmpty() {
    if (loading) {
      return null;
    }

    return (
      <View style={styles.empty}>
        <View style={styles.emptyIcon}>
          <Ionicons
            name="business-outline"
            size={28}
            color={colors.brand[500]}
          />
        </View>

        <Text style={styles.emptyTitle}>
          Nenhum fornecedor encontrado
        </Text>

        <Text style={styles.emptyDescription}>
          {search.trim()
            ? "Tente alterar os termos da busca."
            : "Cadastre seu primeiro fornecedor para começar."}
        </Text>

        {isAdmin && !search.trim() ? (
          <Pressable
            onPress={() =>
              router.push(
                "/(tabs)/more/suppliers/create",
              )
            }
            style={styles.emptyButton}
          >
            <Text style={styles.emptyButtonText}>
              Cadastrar fornecedor
            </Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  if (loading && suppliers.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color={colors.brand[500]}
          />

          <Text style={styles.loadingText}>
            Carregando fornecedores...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>
              CADASTRO
            </Text>

            <Text style={styles.title}>
              Fornecedores
            </Text>

            <Text style={styles.subtitle}>
              Gerencie os fornecedores vinculados ao seu estoque.
            </Text>
          </View>

          {isAdmin ? ( 
            <Pressable
              onPress={() =>
                router.push(
                  "/(tabs)/more/suppliers/create",
                )
              }
              style={({ pressed }) => [
                styles.addButton,
                pressed && styles.addButtonPressed,
              ]}
            >
              <Ionicons
                name="add"
                size={23}
                color={colors.text.inverse}
              />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={19}
            color={colors.text.muted}
          />

          <TextInput
            value={search}
            onChangeText={handleSearchChange}
            placeholder="Buscar fornecedor..."
            placeholderTextColor={colors.text.muted}
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />

          {search.length > 0 ? (
            <Pressable
              onPress={() => handleSearchChange("")}
              hitSlop={8}
            >
              <Ionicons
                name="close-circle"
                size={19}
                color={colors.text.muted}
              />
            </Pressable>
          ) : null}
        </View>


        {error ? (
          <View style={styles.errorBox}>
            <Ionicons
              name="alert-circle-outline"
              size={19}
              color={colors.danger}
            />

            <Text style={styles.errorText}>
              {error}
            </Text>

            <Pressable
              onPress={() =>
                loadSuppliers(
                  1,
                  false,
                  search,
                )
              }
            >
              <Text style={styles.retryText}>
                Tentar novamente
              </Text>
            </Pressable>
          </View>
        ) : null}

        <FlatList
          data={suppliers}
          keyExtractor={(item) =>
            String(item.id)
          }
          renderItem={renderSupplier}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            suppliers.length === 0
              ? styles.emptyList
              : styles.list
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.brand[500]}
            />
          }
          ListFooterComponent={
            totalPages > 1 ? (
              <View style={styles.pagination}>
                <Pressable
                  disabled={page <= 1 || loading || loadingMore}
                  onPress={() => loadSuppliers(page - 1, false, search)}
                  style={[
                    styles.pageButton,
                    (page <= 1 || loading || loadingMore) && styles.pageButtonDisabled,
                  ]}
                >
                  <Ionicons name="chevron-back" size={18} color={colors.text.primary} />
                </Pressable>

                <Text style={styles.pageLabel}>
                  Página {page} de {totalPages}
                </Text>

                <Pressable
                  disabled={page >= totalPages || loading || loadingMore}
                  onPress={() => loadSuppliers(page + 1, false, search)}
                  style={[
                    styles.pageButton,
                    (page >= totalPages || loading || loadingMore) && styles.pageButtonDisabled,
                  ]}
                >
                  <Ionicons name="chevron-forward" size={18} color={colors.text.primary} />
                </Pressable>
              </View>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.light,
  },

  container: {
    flex: 1,
    paddingHorizontal: spacing[5],
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingTop: spacing[4],
    marginBottom: spacing[5],
  },

  headerText: {
    flex: 1,
    paddingRight: spacing[3],
  },

  eyebrow: {
    color: colors.brand[600],
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: spacing[1],
  },

  title: {
    color: colors.text.primary,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.7,
  },

  subtitle: {
    color: colors.text.secondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing[1],
  },

  addButton: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.brand[500],
    alignItems: "center",
    justifyContent: "center",
    ...shadows.floating,
  },

  addButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },

  searchContainer: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface.light,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: radius.md,
    paddingHorizontal: spacing[3],
    marginBottom: spacing[4],
    ...shadows.soft,
  },

  searchInput: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 14,
    marginHorizontal: spacing[2],
  },

  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing[3],
  },

  resultCount: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: "700",
  },

  resultHint: {
    color: colors.text.muted,
    fontSize: 11,
  },

  list: {
    paddingBottom: spacing[8],
  },

  card: {
    backgroundColor: colors.surface.light,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: radius.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
    ...shadows.soft,
  },

  cardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.995 }],
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.brand[50],
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing[3],
  },

  avatarText: {
    color: colors.brand[600],
    fontSize: 18,
    fontWeight: "800",
  },

  cardMain: {
    flex: 1,
    marginRight: spacing[2],
  },

  name: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: "700",
  },

  secondary: {
    color: colors.text.secondary,
    fontSize: 12,
    marginTop: spacing[1],
  },

  statusBadge: {
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
    fontSize: 10,
    fontWeight: "700",
  },

  activeText: {
    color: colors.teal[700],
  },

  inactiveText: {
    color: colors.text.secondary,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing[3],
  },

  details: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing[3],
  },

  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "100%",
  },

  detailText: {
    color: colors.text.secondary,
    fontSize: 12,
    marginLeft: spacing[1],
    flexShrink: 1,
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.coral[50],
    borderWidth: 1,
    borderColor: colors.coral[100],
    borderRadius: radius.md,
    padding: spacing[3],
    marginBottom: spacing[3],
    gap: spacing[2],
  },

  errorText: {
    flex: 1,
    color: colors.danger,
    fontSize: 12,
    lineHeight: 18,
  },

  retryText: {
    color: colors.brand[600],
    fontSize: 12,
    fontWeight: "700",
  },

  emptyList: {
    flexGrow: 1,
  },

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[10],
  },

  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    backgroundColor: colors.brand[50],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing[4],
  },

  emptyTitle: {
    color: colors.text.primary,
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
  },

  emptyDescription: {
    color: colors.text.secondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: spacing[2],
  },

  emptyButton: {
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.brand[500],
    paddingHorizontal: spacing[5],
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing[5],
    ...shadows.soft,
  },

  emptyButtonText: {
    color: colors.text.inverse,
    fontSize: 13,
    fontWeight: "700",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: colors.text.secondary,
    fontSize: 14,
    marginTop: spacing[3],
  },

  footerLoading: {
    paddingVertical: spacing[4],
    alignItems: "center",
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[4],
    paddingVertical: spacing[4],
  },

  pageButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.surface.light,
  },

  pageButtonDisabled: {
    opacity: 0.35,
  },

  pageLabel: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: "600",
  },
});
