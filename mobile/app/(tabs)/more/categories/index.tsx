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
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useAuth } from "../../../../src/auth/AuthContext";
import {
  getCategories,
} from "../../../../src/modules/categories/categoryService";
import type {
  Category,
} from "../../../../src/modules/categories/category.types";
import { colors } from "../../../../src/theme/colors";
import {
  radius,
  shadows,
  spacing,
} from "../../../../src/theme/spacing";

const PAGE_SIZE = 20;

export default function CategoriesScreen() {
  const {
    accessToken,
    user,
  } = useAuth();

  const [categories, setCategories] = useState<Category[]>(
    [],
  );

  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const isAdmin = user?.role === "ADMIN";

  const loadCategories = useCallback(
    async ({
      nextPage = 1,
      replace = true,
    }: {
      nextPage?: number;
      replace?: boolean;
    } = {}) => {
      if (!accessToken) {
        return;
      }

      try {
        if (replace) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        setError("");

        const response = await getCategories(
          accessToken,
          {
            page: nextPage,
            pageSize: PAGE_SIZE,
            search,
            isActive: undefined,
          },
        );

        setCategories((current) =>
          replace
            ? response.items
            : [...current, ...response.items],
        );

        setPage(response.page);
        setTotal(response.total);
        setTotalPages(response.total_pages);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar as categorias.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [accessToken, search],
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadCategories({
        nextPage: 1,
        replace: true,
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [loadCategories]);

  function handleRefresh() {
    setRefreshing(true);

    loadCategories({
      nextPage: 1,
      replace: true,
    });
  }

  function handleLoadMore() {
    if (
      loading ||
      loadingMore ||
      page >= totalPages
    ) {
      return;
    }

    loadCategories({
      nextPage: page + 1,
      replace: false,
    });
  }

  function renderCategory({
    item,
  }: {
    item: Category;
  }) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
        onPress={() =>
          router.push(`/categories/${item.id}`)
        }
      >
        <View style={styles.cardIcon}>
          <Ionicons
            name="pricetags-outline"
            size={21}
            color={colors.brand[500]}
          />
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text
              style={styles.categoryName}
              numberOfLines={1}
            >
              {item.name}
            </Text>

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
                  ? "Ativa"
                  : "Inativa"}
              </Text>
            </View>
          </View>

          <Text
            style={styles.description}
            numberOfLines={2}
          >
            {item.description?.trim()
              ? item.description
              : "Sem descrição cadastrada."}
          </Text>

          <Text style={styles.updatedAt}>
            Atualizada em{" "}
            {new Date(
              item.updated_at,
            ).toLocaleDateString("pt-BR")}
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.neutral[300]}
        />
      </Pressable>
    );
  }

  function renderFooter() {
    if (!loadingMore) {
      return <View style={styles.listFooter} />;
    }

    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator
          size="small"
          color={colors.brand[500]}
        />
      </View>
    );
  }

  if (loading && categories.length === 0) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator
          size="large"
          color={colors.brand[500]}
        />

        <Text style={styles.loadingText}>
          Carregando categorias...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={categories}
        keyExtractor={(item) =>
          String(item.id)
        }
        renderItem={renderCategory}
        contentContainerStyle={
          categories.length === 0
            ? styles.emptyList
            : styles.listContent
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.brand[500]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View style={styles.headerTop}>
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
                    Categorias
                  </Text>

                  <Text style={styles.subtitle}>
                    Organize seus produtos por categoria
                  </Text>
                </View>

                {isAdmin ? (
                  <Pressable
                    style={styles.addButton}
                    onPress={() =>
                      router.push(
                        "/categories/create",
                      )
                    }
                  >
                    <Ionicons
                      name="add"
                      size={23}
                      color={colors.text.inverse}
                    />
                  </Pressable>
                ) : null}
              </View>

              <View style={styles.summaryCard}>
                <View
                  style={styles.summaryIcon}
                >
                  <Ionicons
                    name="pricetags"
                    size={19}
                    color={colors.brand[500]}
                  />
                </View>

                <View>
                  <Text style={styles.summaryValue}>
                    {total}
                  </Text>

                  <Text style={styles.summaryLabel}>
                    categorias cadastradas
                  </Text>
                </View>
              </View>

              <View style={styles.searchContainer}>
                <Ionicons
                  name="search-outline"
                  size={20}
                  color={colors.text.muted}
                />

                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Buscar categoria..."
                  placeholderTextColor={
                    colors.text.muted
                  }
                  style={styles.searchInput}
                  returnKeyType="search"
                  clearButtonMode="while-editing"
                />

                {search.length > 0 ? (
                  <Pressable
                    onPress={() => setSearch("")}
                    hitSlop={8}
                  >
                    <Ionicons
                      name="close-circle"
                      size={19}
                      color={colors.neutral[400]}
                    />
                  </Pressable>
                ) : null}
              </View>

              {error ? (
                <View style={styles.errorCard}>
                  <View style={styles.errorIcon}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={20}
                      color={colors.danger}
                    />
                  </View>

                  <View style={styles.errorContent}>
                    <Text style={styles.errorTitle}>
                      Não foi possível carregar
                    </Text>

                    <Text style={styles.errorMessage}>
                      {error}
                    </Text>

                    <Pressable
                      onPress={() =>
                        loadCategories({
                          nextPage: 1,
                          replace: true,
                        })
                      }
                    >
                      <Text style={styles.retryText}>
                        Tentar novamente
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}

              {categories.length > 0 ? (
                <Text style={styles.resultLabel}>
                  {search.trim()
                    ? `Resultados para "${search.trim()}"`
                    : "Todas as categorias"}
                </Text>
              ) : null}
            </View>
          </View>
        }
        ListEmptyComponent={
          !error ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="pricetags-outline"
                  size={34}
                  color={colors.brand[500]}
                />
              </View>

              <Text style={styles.emptyTitle}>
                {search.trim()
                  ? "Nenhuma categoria encontrada"
                  : "Nenhuma categoria cadastrada"}
              </Text>

              <Text style={styles.emptyDescription}>
                {search.trim()
                  ? "Tente buscar por outro nome."
                  : isAdmin
                    ? "Cadastre a primeira categoria para começar a organizar seus produtos."
                    : "Ainda não existem categorias cadastradas."}
              </Text>

              {isAdmin && !search.trim() ? (
                <Pressable
                  style={styles.emptyButton}
                  onPress={() =>
                    router.push(
                      "/categories/create",
                    )
                  }
                >
                  <Ionicons
                    name="add"
                    size={19}
                    color={colors.text.inverse}
                  />

                  <Text style={styles.emptyButtonText}>
                    Nova categoria
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ) : null
        }
        ListFooterComponent={renderFooter}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background.light,
  },

  listContent: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[10],
  },

  emptyList: {
    flexGrow: 1,
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[10],
  },

  header: {
    paddingTop: spacing[6],
    paddingBottom: spacing[4],
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "center",
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
    marginTop: spacing[1],
  },

  addButton: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brand[500],
    ...shadows.floating,
  },

  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    backgroundColor: colors.surface.light,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: radius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
    ...shadows.soft,
  },

  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brand[50],
  },

  summaryValue: {
    color: colors.text.primary,
    fontSize: 21,
    fontWeight: "800",
  },

  summaryLabel: {
    color: colors.text.secondary,
    fontSize: 12,
    marginTop: 1,
  },

  searchContainer: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    backgroundColor: colors.surface.light,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: radius.md,
    paddingHorizontal: spacing[3],
  },

  searchInput: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 14,
    height: "100%",
  },

  errorCard: {
    flexDirection: "row",
    gap: spacing[3],
    backgroundColor: colors.coral[50],
    borderWidth: 1,
    borderColor: colors.coral[100],
    borderRadius: radius.md,
    padding: spacing[3],
    marginTop: spacing[4],
  },

  errorIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.coral[100],
  },

  errorContent: {
    flex: 1,
  },

  errorTitle: {
    color: colors.coral[700],
    fontSize: 13,
    fontWeight: "700",
  },

  errorMessage: {
    color: colors.text.secondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },

  retryText: {
    color: colors.brand[600],
    fontSize: 12,
    fontWeight: "700",
    marginTop: spacing[2],
  },

  resultLabel: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: "600",
    marginTop: spacing[5],
    marginBottom: spacing[3],
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    backgroundColor: colors.surface.light,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: radius.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
    ...shadows.soft,
  },

  cardPressed: {
    opacity: 0.82,
  },

  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brand[50],
  },

  cardContent: {
    flex: 1,
    minWidth: 0,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },

  categoryName: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: "700",
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 5,
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
  },

  activeDot: {
    backgroundColor: colors.success,
  },

  inactiveDot: {
    backgroundColor: colors.neutral[400],
  },

  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },

  activeText: {
    color: colors.teal[700],
  },

  inactiveText: {
    color: colors.neutral[600],
  },

  description: {
    color: colors.text.secondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing[2],
  },

  updatedAt: {
    color: colors.text.muted,
    fontSize: 10,
    marginTop: spacing[2],
  },

  emptyState: {
    flex: 1,
    minHeight: 360,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing[6],
  },

  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brand[50],
    marginBottom: spacing[4],
  },

  emptyTitle: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },

  emptyDescription: {
    color: colors.text.secondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: spacing[2],
    maxWidth: 310,
  },

  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    backgroundColor: colors.brand[500],
    borderRadius: radius.md,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    marginTop: spacing[5],
    ...shadows.floating,
  },

  emptyButtonText: {
    color: colors.text.inverse,
    fontSize: 13,
    fontWeight: "700",
  },

  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background.light,
    gap: spacing[3],
  },

  loadingText: {
    color: colors.text.secondary,
    fontSize: 13,
  },

  loadingMore: {
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },

  listFooter: {
    height: spacing[4],
  },
});
