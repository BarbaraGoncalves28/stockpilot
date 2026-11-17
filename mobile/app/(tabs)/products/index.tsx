import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, FlatList, RefreshControl, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { router } from "expo-router";

import { useAuth } from "../../../src/auth/AuthContext";
import { getProducts } from "../../../src/modules/products/productService";
import type { Product, ProductListResponse } from "../../../src/modules/products/product.types";
import { getCategories } from "../../../src/modules/categories/categoryService";
import type { Category } from "../../../src/modules/categories/category.types";
import { ProductCard } from "../../../src/components/products/ProductCard";
import { ProductsFilters, type StockFilter } from "../../../src/components/products/ProductsFilters";
import { CategoryFilterModal } from "../../../src/components/products/CategoryFilterModal";
import { styles } from "./products.styles";

export default function ProductsScreen() {
  const { accessToken, user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<ProductListResponse | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("ALL");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [categoryModal, setCategoryModal] = useState(false);
  const [sortNewest, setSortNewest] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const loadProducts = useCallback(async (term = search, refresh = false) => {
    if (!accessToken) {
      router.replace("/");
      return;
    }
    try {
      setError("");
      if (refresh) setRefreshing(true);
      else setLoading(true);

      const response = await getProducts(accessToken, {
        page: 1,
        pageSize: 100,
        search: term,
        categoryId,
        isActive: user?.role === "ADMIN" ? undefined : true,
      });

      setProducts(response.items);
      setPagination(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar os produtos.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [accessToken, categoryId, search, user?.role]);

  useEffect(() => {
    if (!accessToken) return;
    loadProducts();
  }, [accessToken, categoryId, loadProducts]);

  useEffect(() => {
    if (!accessToken) return;
    getCategories(accessToken, { page: 1, pageSize: 100, isActive: true })
      .then((result) => setCategories(result.items))
      .catch(() => setCategories([]));
  }, [accessToken]);

  const visibleProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const stock = Number(product.current_stock);
      if (stockFilter === "IN_STOCK" && stock <= 0) return false;
      if (stockFilter === "OUT_OF_STOCK" && stock > 0) return false;
      return true;
    });
    return [...filtered].sort((a, b) => sortNewest
      ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      : new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [products, stockFilter, sortNewest]);

  const selectedCategory = categories.find((item) => item.id === categoryId)?.name ?? "";
  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / pageSize));
  const paginatedProducts = visibleProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function handleSearch() {
    setCurrentPage(1);
    setSearch(searchInput.trim());
  }

  useEffect(() => {
    if (accessToken) loadProducts(search);
  }, [search]);

  if (!accessToken || !user) {
    return <View style={styles.center}><ActivityIndicator color="#00E599" size="large" /></View>;
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={paginatedProducts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ProductCard product={item} onPress={() => router.push(`/(tabs)/products/${item.id}`)} />
        )}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadProducts(search, true)} tintColor="#00E599" />}
        ListHeaderComponent={
          <View>
<View style={styles.heading}>
              <View style={styles.headingText}>
                <Text style={styles.title}>Produtos</Text>
                <Text style={styles.subtitle}>Gerencie seus produtos de forma prática{"\n"}e mantenha seu estoque sempre em dia.</Text>
              </View>
              {user.role === "ADMIN" && (
                <TouchableOpacity style={styles.addButton} onPress={() => router.push("/(tabs)/products/create")}>
                  <Ionicons name="add" size={25} color="#050B14" />
                  <Text style={styles.addText}>Novo produto</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.searchRow}>
              <View style={styles.searchBox}>
                <Ionicons name="search-outline" size={22} color="#A9C9F5" />
                <TextInput
                  value={searchInput}
                  onChangeText={setSearchInput}
                  onSubmitEditing={handleSearch}
                  returnKeyType="search"
                  placeholder="Buscar por nome, código ou categoria..."
                  placeholderTextColor="#8B9BB4"
                  style={styles.searchInput}
                />
              </View>
              <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                <Ionicons name="search" size={21} color="#050B14" />
                <Text style={styles.searchButtonText}>Buscar</Text>
              </TouchableOpacity>
            </View>

            <ProductsFilters
              value={stockFilter}
              onChange={(value) => { setStockFilter(value); setCurrentPage(1); }}
              categoryName={selectedCategory}
              onCategoryPress={() => setCategoryModal(true)}
            />

            <View style={styles.resultsRow}>
              <Text style={styles.resultsText}>
                <Text style={styles.resultsCount}>{pagination?.total ?? visibleProducts.length}</Text> produtos encontrados
              </Text>
              <TouchableOpacity style={styles.sortButton} onPress={() => setSortNewest((value) => !value)}>
                <Ionicons name="arrow-up" size={16} color="#D7E6FA" />
                <Text style={styles.sortText}>{sortNewest ? "Mais recentes" : "Mais antigos"}</Text>
                <Ionicons name="chevron-down" size={15} color="#D7E6FA" />
              </TouchableOpacity>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={() => loadProducts(search)}>
                  <Text style={styles.retry}>Tentar novamente</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            {loading ? <ActivityIndicator color="#00E599" /> : (
              <>
                <Ionicons name="cube-outline" size={36} color="#8B9BB4" />
                <Text style={styles.emptyTitle}>Nenhum produto encontrado</Text>
                <Text style={styles.emptyText}>Tente ajustar a busca ou os filtros.</Text>
              </>
            )}
          </View>
        }
        ListFooterComponent={
          totalPages > 1 ? (
            <View style={styles.pagination}>
              <TouchableOpacity
                disabled={currentPage <= 1}
                onPress={() => setCurrentPage((page) => Math.max(1, page - 1))}
                style={[styles.paginationButton, currentPage <= 1 && styles.paginationButtonDisabled]}
              >
                <Ionicons name="chevron-back" size={19} color={currentPage <= 1 ? "#536174" : "#00E599"} />
              </TouchableOpacity>

              <Text style={styles.paginationText}>{currentPage} / {totalPages}</Text>

              <TouchableOpacity
                disabled={currentPage >= totalPages}
                onPress={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                style={[styles.paginationButton, currentPage >= totalPages && styles.paginationButtonDisabled]}
              >
                <Ionicons name="chevron-forward" size={19} color={currentPage >= totalPages ? "#536174" : "#00E599"} />
              </TouchableOpacity>
            </View>
          ) : null
        }
      />

      <CategoryFilterModal
        visible={categoryModal}
        categories={categories}
        selectedId={categoryId}
        onClose={() => setCategoryModal(false)}
        onSelect={(id) => {
          setCurrentPage(1);
          setCategoryId(id);
          setCategoryModal(false);
        }}
      />
    </View>
  );
}

