import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";

import { useAuth } from "../../src/auth/AuthContext";
import { getStockMovements } from "../../src/modules/stock-movements/stockMovementService";
import type {
  StockMovement,
  StockMovementType,
} from "../../src/modules/stock-movements/stockMovement.types";
import { colors } from "../../src/theme/colors";
import { radius, shadows, spacing } from "../../src/theme/spacing";

type MovementFilter = "ALL" | StockMovementType;

const filters: {
  key: MovementFilter;
  label: string;
}[] = [
  {
    key: "ALL",
    label: "Todos",
  },
  {
    key: "IN",
    label: "Entradas",
  },
  {
    key: "OUT",
    label: "Saídas",
  },
  {
    key: "ADJUSTMENT",
    label: "Ajustes",
  },
];

function getMovementLabel(type: StockMovementType) {
  switch (type) {
    case "IN":
      return "Entrada";

    case "OUT":
      return "Saída";

    case "ADJUSTMENT":
      return "Ajuste";
  }
}

function getMovementIcon(
  type: StockMovementType,
): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case "IN":
      return "arrow-down";

    case "OUT":
      return "arrow-up";

    case "ADJUSTMENT":
      return "sync-outline";
  }
}

function getMovementColor(type: StockMovementType) {
  switch (type) {
    case "IN":
      return colors.teal[600];

    case "OUT":
      return colors.coral[600];

    case "ADJUSTMENT":
      return colors.amber[600];
  }
}

function formatQuantity(quantity: string) {
  const value = Number(quantity);

  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 3,
  }).format(value);
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function MovementCard({ movement }: { movement: StockMovement }) {
  const color = getMovementColor(movement.movement_type);

  const isPositive = movement.movement_type === "IN";

  const isAdjustment = movement.movement_type === "ADJUSTMENT";

  return (
    <View style={styles.movementCard}>
      <View
        style={[
          styles.movementIcon,
          {
            backgroundColor:
              movement.movement_type === "IN"
                ? colors.teal[50]
                : movement.movement_type === "OUT"
                  ? colors.coral[50]
                  : colors.amber[50],
          },
        ]}
      >
        <Ionicons
          name={getMovementIcon(movement.movement_type)}
          size={19}
          color={color}
        />
      </View>

      <View style={styles.movementContent}>
        <View style={styles.movementTopRow}>
          <Text style={styles.movementTitle}>
            {getMovementLabel(movement.movement_type)}
          </Text>

          <Text
            style={[
              styles.quantity,
              {
                color,
              },
            ]}
          >
            {isAdjustment
              ? `Novo saldo: ${formatQuantity(movement.new_stock)}`
              : `${isPositive ? "+" : "−"}${formatQuantity(movement.quantity)}`}
          </Text>
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productText} numberOfLines={1}>
            {movement.product_name}
          </Text>

          <Text style={styles.productSku}>SKU · {movement.product_sku}</Text>
        </View>

        <View style={styles.movementMeta}>
          <Text style={styles.metaText}>
            Estoque: {formatQuantity(movement.previous_stock)}
            {" → "}
            {formatQuantity(movement.new_stock)}
          </Text>

          <Text style={styles.metaText}>{formatDate(movement.created_at)}</Text>
        </View>

        {movement.reason ? (
          <Text style={styles.reason} numberOfLines={1}>
            {movement.reason}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export default function MovementsScreen() {
  const { accessToken, user } = useAuth();

  const router = useRouter();

  const [movements, setMovements] = useState<StockMovement[]>([]);

  const [selectedFilter, setSelectedFilter] = useState<MovementFilter>("ALL");

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMovements = useCallback(
    async (nextPage = 1, append = false) => {
      if (!accessToken) {
        return;
      }

      try {
        setError(null);

        if (append) {
          setLoadingMore(true);
        } else if (!refreshing) {
          setLoading(true);
        }

        const response = await getStockMovements(accessToken, {
          page: nextPage,
          pageSize: 20,
          movementType: selectedFilter === "ALL" ? undefined : selectedFilter,
        });

        setMovements((current) =>
          append ? [...current, ...response.items] : response.items,
        );

        setPage(response.page);
        setTotal(response.total);
        setTotalPages(response.total_pages);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Não foi possível carregar as movimentações.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [accessToken, refreshing, selectedFilter],
  );

  useEffect(() => {
    loadMovements(1, false);
  }, [loadMovements]);

  function handleRefresh() {
    setRefreshing(true);
    loadMovements(1, false);
  }

  function handleFilterChange(filter: MovementFilter) {
    if (filter === selectedFilter) {
      return;
    }

    setSelectedFilter(filter);
    setPage(1);
  }

  function handleLoadMore() {
    if (loading || loadingMore || page >= totalPages || !accessToken) {
      return;
    }

    loadMovements(page + 1, true);
  }

  function handleScrollEndDrag(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;

    const distanceFromBottom =
      contentSize.height - (contentOffset.y + layoutMeasurement.height);

    if (distanceFromBottom <= 100) {
      handleLoadMore();
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.brand[500]}
          />
        }
        onScrollEndDrag={handleScrollEndDrag}
        scrollEventThrottle={16}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>ESTOQUE</Text>

            <Text style={styles.title}>Movimentações</Text>

            <Text style={styles.description}>
              Acompanhe entradas, saídas e ajustes realizados no estoque.
            </Text>
          </View>

          {user?.role === "ADMIN" && (
            <Pressable
              onPress={() => router.push("/(tabs)/movement-create")}
              style={styles.addButton}
            >
              <Ionicons name="add" size={22} color={colors.text.inverse} />
            </Pressable>
          )}
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons
              name="swap-vertical"
              size={22}
              color={colors.brand[600]}
            />
          </View>

          <View style={styles.summaryContent}>
            <Text style={styles.summaryLabel}>Total de movimentações</Text>

            <Text style={styles.summaryValue}>{total}</Text>
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Filtrar por tipo</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}
          >
            {filters.map((filter) => {
              const selected = selectedFilter === filter.key;

              return (
                <Pressable
                  key={filter.key}
                  onPress={() => handleFilterChange(filter.key)}
                  style={[
                    styles.filterButton,
                    selected ? styles.filterButtonActive : undefined,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      selected ? styles.filterTextActive : undefined,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.historyHeader}>
          <View>
            <Text style={styles.historyTitle}>Histórico</Text>

            <Text style={styles.historyDescription}>
              Registros mais recentes
            </Text>
          </View>

          {loading ? (
            <ActivityIndicator size="small" color={colors.brand[500]} />
          ) : null}
        </View>

        {error ? (
          <View style={styles.feedbackCard}>
            <View style={styles.feedbackIcon}>
              <Ionicons
                name="alert-circle-outline"
                size={22}
                color={colors.danger}
              />
            </View>

            <Text style={styles.feedbackTitle}>Não foi possível carregar</Text>

            <Text style={styles.feedbackText}>{error}</Text>

            <Pressable
              onPress={() => loadMovements(1, false)}
              style={styles.retryButton}
            >
              <Text style={styles.retryText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : null}

        {!loading && !error && movements.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="swap-vertical-outline"
                size={28}
                color={colors.brand[500]}
              />
            </View>

            <Text style={styles.emptyTitle}>Nenhuma movimentação</Text>

            <Text style={styles.emptyText}>
              Ainda não existem registros para o filtro selecionado.
            </Text>
          </View>
        ) : null}

        {!error && movements.length > 0 ? (
          <View style={styles.movementList}>
            {movements.map((movement) => (
              <MovementCard key={movement.id} movement={movement} />
            ))}

            {loadingMore ? (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color={colors.brand[500]} />
              </View>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  addButton: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.brand[500],
    alignItems: "center",
    justifyContent: "center",
    ...shadows.floating,
  },

  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },

  content: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[8],
    paddingBottom: spacing[12],
  },

  header: {
    marginBottom: spacing[5],
    flexDirection: "row",
    alignItems: "flex-start",
  },

  headerText: {
    flex: 1,
    paddingRight: spacing[3],
  },

  eyebrow: {
    color: colors.teal[600],
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
  },

  title: {
    color: colors.text.primary,
    fontSize: 30,
    fontWeight: "800",
    marginTop: spacing[2],
  },

  description: {
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing[1],
    maxWidth: 340,
  },

  summaryCard: {
    backgroundColor: colors.surface.light,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing[4],
    flexDirection: "row",
    alignItems: "center",
    ...shadows.soft,
  },

  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.brand[50],
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing[3],
  },

  summaryContent: {
    flex: 1,
  },

  summaryLabel: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: "600",
  },

  summaryValue: {
    color: colors.text.primary,
    fontSize: 24,
    fontWeight: "800",
    marginTop: 2,
  },

  filterSection: {
    marginTop: spacing[6],
  },

  filterTitle: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: spacing[2],
  },

  filterList: {
    gap: spacing[2],
  },

  filterButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    backgroundColor: colors.surface.light,
    borderWidth: 1,
    borderColor: colors.border.light,
  },

  filterButtonActive: {
    backgroundColor: colors.brand[500],
    borderColor: colors.brand[500],
  },

  filterText: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: "700",
  },

  filterTextActive: {
    color: colors.text.inverse,
  },

  historyHeader: {
    marginTop: spacing[7],
    marginBottom: spacing[3],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  historyTitle: {
    color: colors.text.primary,
    fontSize: 17,
    fontWeight: "800",
  },

  historyDescription: {
    color: colors.text.muted,
    fontSize: 12,
    marginTop: 2,
  },

  movementList: {
    gap: spacing[2],
  },

  movementCard: {
    backgroundColor: colors.surface.light,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing[4],
    flexDirection: "row",
    ...shadows.soft,
  },

  movementIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing[3],
  },

  movementContent: {
    flex: 1,
  },

  movementTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  movementTitle: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: "700",
  },

  quantity: {
    fontSize: 15,
    fontWeight: "800",
  },

  productText: {
    color: colors.text.secondary,
    fontSize: 12,
    marginTop: 3,
  },

  productInfo: {
    flex: 1,
    minWidth: 0,
    marginTop: 3,
  },

  productSku: {
    color: colors.text.muted,
    fontSize: 10,
    marginTop: 2,
  },

  movementMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing[2],
    marginTop: spacing[3],
  },

  metaText: {
    color: colors.text.muted,
    fontSize: 10,
    flexShrink: 1,
  },

  reason: {
    color: colors.text.secondary,
    fontSize: 11,
    marginTop: spacing[2],
  },

  feedbackCard: {
    backgroundColor: colors.surface.light,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing[5],
    alignItems: "center",
  },

  feedbackIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.full,
    backgroundColor: colors.coral[50],
    alignItems: "center",
    justifyContent: "center",
  },

  feedbackTitle: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: "700",
    marginTop: spacing[3],
  },

  feedbackText: {
    color: colors.text.secondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: spacing[1],
  },

  retryButton: {
    marginTop: spacing[4],
    backgroundColor: colors.brand[500],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radius.md,
  },

  retryText: {
    color: colors.text.inverse,
    fontSize: 12,
    fontWeight: "700",
  },

  emptyCard: {
    backgroundColor: colors.surface.light,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[8],
    alignItems: "center",
  },

  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.brand[50],
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "800",
    marginTop: spacing[3],
  },

  emptyText: {
    color: colors.text.secondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: spacing[1],
    maxWidth: 280,
  },

  loadingMore: {
    paddingVertical: spacing[4],
    alignItems: "center",
  },
});
