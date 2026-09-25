import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { router } from "expo-router";

import { useAuth } from "../../../src/auth/AuthContext";
import { getProducts } from "../../../src/modules/products/productService";
import type {
  Product,
  ProductListResponse,
} from "../../../src/modules/products/product.types";
import { colors } from "../../../src/theme/colors";
import {
  radius,
  shadows,
  spacing,
} from "../../../src/theme/spacing";

function formatStock(value: string) {
  return Number(value).toLocaleString("pt-BR", {
    maximumFractionDigits: 3,
  });
}

function getStockStatus(product: Product) {
  const currentStock = Number(product.current_stock);
  const minStock = Number(product.min_stock);

  if (currentStock <= 0) {
    return {
      label: "Sem estoque",
      color: colors.coral[600],
      background: colors.coral[50],
    };
  }

  if (currentStock <= minStock) {
    return {
      label: "Estoque baixo",
      color: colors.amber[700],
      background: colors.amber[50],
    };
  }

  return {
    label: "Em estoque",
    color: colors.teal[700],
    background: colors.teal[50],
  };
}

function ProductCard({
  product,
}: {
  product: Product;
}) {
  const stockStatus = getStockStatus(product);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() =>
        router.push(`/products/${product.id}`)
      }
      style={styles.productCard}
    >
      <View style={styles.productTop}>
        <View style={styles.productIcon}>
          <Text style={styles.productIconText}>
            {product.name
              .trim()
              .slice(0, 1)
              .toUpperCase()}
          </Text>
        </View>

        <View style={styles.productInfo}>
          <Text
            style={styles.productName}
            numberOfLines={1}
          >
            {product.name}
          </Text>

          <Text style={styles.productSku}>
            SKU · {product.sku}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                stockStatus.background,
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color: stockStatus.color,
              },
            ]}
          >
            {stockStatus.label}
          </Text>
        </View>
      </View>

      <View style={styles.productBottom}>
        <View>
          <Text style={styles.stockLabel}>
            Estoque atual
          </Text>

          <Text style={styles.stockValue}>
            {formatStock(product.current_stock)}{" "}
            <Text style={styles.stockUnit}>
              {product.unit}
            </Text>
          </Text>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>
            Venda
          </Text>

          <Text style={styles.priceValue}>
            R${" "}
            {Number(product.sale_price).toLocaleString(
              "pt-BR",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              },
            )}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ProductsScreen() {
  const {
    accessToken,
    user,
  } = useAuth();

  const [products, setProducts] = useState<
    Product[]
  >([]);

  const [pagination, setPagination] =
    useState<ProductListResponse | null>(null);

  const [search, setSearch] = useState("");
  const [searchValue, setSearchValue] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] =
    useState(false);
  const [error, setError] = useState("");

  const loadProducts = useCallback(
    async (
      page = 1,
      options: {
        refresh?: boolean;
        append?: boolean;
        searchTerm?: string;
      } = {},
    ) => {
      if (!accessToken) {
        router.replace("/");
        return;
      }

      try {
        setError("");

        if (options.refresh) {
          setRefreshing(true);
        } else if (options.append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        const response = await getProducts(
          accessToken,
          {
            page,
            pageSize: 20,
            search:
              options.searchTerm ?? search,
            isActive: true,
          },
        );

        if (options.append) {
          setProducts((current) => [
            ...current,
            ...response.items,
          ]);
        } else {
          setProducts(response.items);
        }

        setPagination(response);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar os produtos.",
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
    loadProducts(1);
  }, [loadProducts]);

  function handleSearch() {
    const normalizedSearch =
      searchValue.trim();

    setSearch(normalizedSearch);

    loadProducts(1, {
      searchTerm: normalizedSearch,
    });
  }

  function handleClearSearch() {
    setSearchValue("");
    setSearch("");

    loadProducts(1, {
      searchTerm: "",
    });
  }

  function handleRefresh() {
    loadProducts(1, {
      refresh: true,
    });
  }

  function handleLoadMore() {
    if (
      !pagination ||
      loadingMore ||
      pagination.page >= pagination.total_pages
    ) {
      return;
    }

    loadProducts(pagination.page + 1, {
      append: true,
    });
  }

  if (!accessToken || !user) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator
          size="large"
          color={colors.brand[500]}
        />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator
          size="large"
          color={colors.brand[500]}
        />

        <Text style={styles.loadingText}>
          Carregando produtos...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={products}
        keyExtractor={(item) =>
          String(item.id)
        }
        renderItem={({ item }) => (
          <ProductCard product={item} />
        )}
        contentContainerStyle={[
          styles.content,
          products.length === 0
            ? styles.emptyContent
            : undefined,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.brand[500]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View style={styles.headerText}>
                <Text style={styles.eyebrow}>
                  ESTOQUE
                </Text>

                <Text style={styles.title}>
                  Produtos
                </Text>

                <Text style={styles.subtitle}>
                  {pagination?.total ?? 0}{" "}
                  produtos ativos
                </Text>
              </View>

              {user.role === "ADMIN" ? (
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.addButton}
                  onPress={() =>
                    router.push(
                      "/(tabs)/products/create",
                    )
                  }
                >
                  <Text
                    style={styles.addButtonText}
                  >
                    +
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={styles.searchContainer}>
              <TextInput
                value={searchValue}
                onChangeText={setSearchValue}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
                placeholder="Buscar por nome ou SKU"
                placeholderTextColor={
                  colors.text.muted
                }
                style={styles.searchInput}
              />

              {searchValue ? (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleClearSearch}
                  style={styles.clearButton}
                >
                  <Text
                    style={styles.clearButtonText}
                  >
                    ×
                  </Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleSearch}
                style={styles.searchButton}
              >
                <Text
                  style={styles.searchButtonText}
                >
                  Buscar
                </Text>
              </TouchableOpacity>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Text
                  style={styles.errorText}
                >
                  {error}
                </Text>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    loadProducts(1)
                  }
                >
                  <Text
                    style={styles.retryText}
                  >
                    Tentar novamente
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>
                □
              </Text>
            </View>

            <Text style={styles.emptyTitle}>
              {search
                ? "Nenhum produto encontrado"
                : "Nenhum produto cadastrado"}
            </Text>

            <Text
              style={styles.emptyDescription}
            >
              {search
                ? "Tente buscar usando outro nome ou SKU."
                : user.role === "ADMIN"
                  ? "Cadastre seu primeiro produto para começar a controlar o estoque."
                  : "Ainda não existem produtos ativos cadastrados."}
            </Text>

            {!search &&
            user.role === "ADMIN" ? (
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.emptyButton}
                onPress={() =>
                  router.push(
                    "/(tabs)/products/create",
                  )
                }
              >
                <Text
                  style={styles.emptyButtonText}
                >
                  Cadastrar produto
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator
                size="small"
                color={colors.brand[500]}
              />
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background.light,
  },

  content: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[8],
    paddingBottom: spacing[8],
  },

  emptyContent: {
    flexGrow: 1,
  },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background.light,
  },

  loadingText: {
    color: colors.text.secondary,
    fontSize: 14,
    marginTop: spacing[3],
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing[5],
  },

  headerText: {
    flex: 1,
  },

  eyebrow: {
    color: colors.brand[600],
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
  },

  title: {
    color: colors.text.primary,
    fontSize: 28,
    fontWeight: "800",
    marginTop: spacing[2],
  },

  subtitle: {
    color: colors.text.secondary,
    fontSize: 13,
    marginTop: spacing[1],
  },

  addButton: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: colors.brand[500],
    ...shadows.soft,
  },

  addButtonText: {
    color: colors.text.inverse,
    fontSize: 28,
    fontWeight: "400",
    lineHeight: 30,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing[5],
  },

  searchInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: spacing[4],
    paddingRight: spacing[10],
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: radius.md,
    backgroundColor: colors.surface.light,
    color: colors.text.primary,
    fontSize: 13,
  },

  clearButton: {
    position: "absolute",
    right: 82,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  clearButtonText: {
    color: colors.text.muted,
    fontSize: 22,
    lineHeight: 24,
  },

  searchButton: {
    height: 48,
    paddingHorizontal: spacing[4],
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing[2],
    borderRadius: radius.md,
    backgroundColor: colors.brand[500],
  },

  searchButtonText: {
    color: colors.text.inverse,
    fontSize: 12,
    fontWeight: "700",
  },

  errorBox: {
    padding: spacing[3],
    marginBottom: spacing[4],
    borderRadius: radius.md,
    backgroundColor: colors.coral[50],
    borderWidth: 1,
    borderColor: colors.coral[100],
  },

  errorText: {
    color: colors.coral[700],
    fontSize: 12,
    lineHeight: 18,
  },

  retryText: {
    color: colors.coral[700],
    fontSize: 12,
    fontWeight: "700",
    marginTop: spacing[2],
  },

  productCard: {
    marginBottom: spacing[3],
    padding: spacing[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface.light,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.soft,
  },

  productTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  productIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: colors.brand[50],
  },

  productIconText: {
    color: colors.brand[600],
    fontSize: 17,
    fontWeight: "800",
  },

  productInfo: {
    flex: 1,
    minWidth: 0,
    marginLeft: spacing[3],
    marginRight: spacing[2],
  },

  productName: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: "700",
  },

  productSku: {
    color: colors.text.muted,
    fontSize: 11,
    marginTop: spacing[1],
  },

  statusBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
  },

  statusText: {
    fontSize: 9,
    fontWeight: "800",
  },

  productBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: spacing[4],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },

  stockLabel: {
    color: colors.text.muted,
    fontSize: 10,
    fontWeight: "600",
  },

  stockValue: {
    color: colors.text.primary,
    fontSize: 17,
    fontWeight: "800",
    marginTop: 2,
  },

  stockUnit: {
    color: colors.text.secondary,
    fontSize: 11,
    fontWeight: "600",
  },

  priceContainer: {
    alignItems: "flex-end",
  },

  priceLabel: {
    color: colors.text.muted,
    fontSize: 10,
    fontWeight: "600",
  },

  priceValue: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 2,
  },

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[10],
  },

  emptyIcon: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
    backgroundColor: colors.brand[50],
    marginBottom: spacing[4],
  },

  emptyIconText: {
    color: colors.brand[500],
    fontSize: 25,
    fontWeight: "700",
  },

  emptyTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },

  emptyDescription: {
    maxWidth: 290,
    color: colors.text.secondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: spacing[2],
  },

  emptyButton: {
    marginTop: spacing[5],
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    borderRadius: radius.md,
    backgroundColor: colors.brand[500],
  },

  emptyButtonText: {
    color: colors.text.inverse,
    fontSize: 13,
    fontWeight: "700",
  },

  loadingMore: {
    paddingVertical: spacing[5],
  },
});


