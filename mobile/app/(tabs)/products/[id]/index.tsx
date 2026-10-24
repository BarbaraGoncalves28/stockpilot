import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState, } from "react";
import { useAuth } from "../../../../src/auth/AuthContext";
import { deleteProduct, getProduct, restoreProduct, } from "../../../../src/modules/products/productService";
import type { Product } from "../../../../src/modules/products/product.types";
import { getProductMovements } from "../../../../src/modules/stock-movements/stockMovementService";
import type { StockMovement } from "../../../../src/modules/stock-movements/stockMovement.types";
import { getProductStockIntelligence } from "../../../../src/modules/stock-intelligence/stockIntelligenceService";
import type { StockIntelligenceItem, } from "../../../../src/modules/stock-intelligence/stockIntelligence.types";
import { colors } from "../../../../src/theme/colors";
import { radius, shadows, spacing, } from "../../../../src/theme/spacing";
import { getCategory } from "../../../../src/modules/categories/categoryService";
import { getSupplier } from "../../../../src/modules/suppliers/supplierService";

function formatNumber(value: string) {
  return Number(value).toLocaleString("pt-BR", {
    maximumFractionDigits: 3,
  });
}

function formatCurrency(value: string) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
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

function getRiskStatus(riskLevel: StockIntelligenceItem["risk_level"]) {
  switch (riskLevel) {
    case "OUT_OF_STOCK":
      return {
        label: "Sem estoque",
        color: colors.coral[600],
        background: colors.coral[50],
      };

    case "CRITICAL":
      return {
        label: "Crítico",
        color: colors.coral[600],
        background: colors.coral[50],
      };

    case "HIGH":
      return {
        label: "Alto risco",
        color: colors.amber[700],
        background: colors.amber[50],
      };

    case "MEDIUM":
      return {
        label: "Atenção",
        color: colors.amber[700],
        background: colors.amber[50],
      };

    case "LOW":
      return {
        label: "Baixo risco",
        color: colors.teal[700],
        background: colors.teal[50],
      };

    default:
      return {
        label: "Sem dados",
        color: colors.text.secondary,
        background: colors.neutral[100],
      };
  }
}

function getMovementMeta(type: StockMovement["movement_type"]) {
  switch (type) {
    case "IN":
      return {
        label: "Entrada",
        symbol: "+",
        color: colors.teal[700],
        background: colors.teal[50],
      };

    case "OUT":
      return {
        label: "Saída",
        symbol: "−",
        color: colors.coral[600],
        background: colors.coral[50],
      };

    default:
      return {
        label: "Ajuste",
        symbol: "↔",
        color: colors.brand[600],
        background: colors.brand[50],
      };
  }
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>
        {label}
      </Text>

      <Text
        style={styles.detailValue}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const {
    accessToken,
    user,
  } = useAuth();

  const [product, setProduct] =
    useState<Product | null>(null);

  const [movements, setMovements] =
    useState<StockMovement[]>([]);

  const [intelligence, setIntelligence] =
    useState<StockIntelligenceItem | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [actionLoading, setActionLoading] = useState(false);

  const [categoryName, setCategoryName] = useState("");
const [supplierName, setSupplierName] = useState("");

  const loadProduct = useCallback(async () => {
    if (!accessToken) {
      router.replace("/");
      return;
    }

    if (!id) {
      setError("Produto não identificado.");
      setLoading(false);
      return;
    }

    try {
      setError("");
      setLoading(true);

      const productId = Number(id);

      const [
        productResponse,
        movementsResponse,
        intelligenceResponse,
      ] = await Promise.all([
        getProduct(
          accessToken,
          productId,
        ),
        getProductMovements(
          accessToken,
          productId,
        ),
        getProductStockIntelligence(
          accessToken,
          productId,
          30,
        ),
      ]);

      setProduct(productResponse);
setMovements(movementsResponse.slice(0, 5));
setIntelligence(intelligenceResponse);

setCategoryName("");
setSupplierName("");

const [categoryResult, supplierResult] = await Promise.allSettled([
  getCategory(accessToken, productResponse.category_id),
  productResponse.supplier_id !== null
    ? getSupplier(accessToken, productResponse.supplier_id)
    : Promise.resolve(null),
]);

if (categoryResult.status === "fulfilled") {
  setCategoryName(categoryResult.value.name);
}

if (supplierResult.status === "fulfilled") {
  setSupplierName(supplierResult.value?.name ?? "");
}
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar o produto.",
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken, id]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  async function executeDeactivate() {
    if (!accessToken || !product || actionLoading) {
      return;
    }

    try {
      setActionLoading(true);

      await deleteProduct(accessToken, product.id);

      if (Platform.OS === "web") {
        window.alert("Produto desativado com sucesso.");
        router.replace("/(tabs)/products");
      } else {
        Alert.alert(
          "Produto desativado",
          "O produto foi desativado com sucesso.",
          [
            {
              text: "OK",
              onPress: () =>
                router.replace("/(tabs)/products"),
            },
          ],
        );
      }
    } catch (err) {
      const message = 
      err instanceof Error
        ? err.message
        : "Não foi possível desativar o produto.";

        if (Platform.OS === "web") {
          window.alert(
            `Não foi possível desativar o produto.\n\n${message}`,
          );
        } else {
          Alert.alert(
            "Não foi possível desativar o produto",
            message,
          );
        }
    } finally {
      setActionLoading(false);
    }
  }

  async function executeRestore() {
    if(!accessToken || !product || actionLoading) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await restoreProduct(accessToken, product.id);
      await loadProduct();
    } catch (err) {
      setError(
        err instanceof Error 
          ? err.message
          : "Não foi possível restaurar o produto.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  function handleDeactivate() {
    if (!accessToken || !product || actionLoading) {
      return;
    }

    const message = `Tem certeza de que deseja desativar o produto "${product.name}"?` + "O registro e o histórico de movimentações  serão preservados.";

    if (Platform.OS === "web") {
      if (window.confirm(message)) {
        void executeDeactivate();
      }
      return;
    }

    Alert.alert(
      "Desativar produto",
      message,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Desativar",
          style: "destructive",
          onPress: () => {
            void executeDeactivate();
          },
        },
      ],
    );
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
          Carregando produto...
        </Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.centered}>
        <View style={styles.errorIcon}>
          <Text style={styles.errorIconText}>
            !
          </Text>
        </View>

        <Text style={styles.errorTitle}>
          Produto indisponível
        </Text>

        <Text style={styles.errorDescription}>
          {error ||
            "Não foi possível encontrar este produto."}
        </Text>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>
            Voltar para produtos
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const stockStatus =
    getStockStatus(product);

  const initial =
    product.name.trim().slice(0, 1).toUpperCase();

  const riskStatus = intelligence
    ? getRiskStatus(
        intelligence.risk_level,
      )
    : null;

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            style={styles.backIcon}
          >
            <Text style={styles.backIconText}>
              ‹
            </Text>
          </TouchableOpacity>

          <Text style={styles.topBarTitle}>
            Produto
          </Text>

          <View style={styles.topBarSpacer} />
        </View>

        <View style={styles.hero}>
          <View style={styles.productIcon}>
            <Text style={styles.productIconText}>
              {initial}
            </Text>
          </View>

          <View style={styles.heroInfo}>
            <Text style={styles.productName}>
              {product.name}
            </Text>

            <Text style={styles.productSku}>
              SKU · {product.sku}
            </Text>

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
        </View>

        <View style={styles.stockCard}>
          <Text style={styles.cardEyebrow}>
            ESTOQUE ATUAL
          </Text>

          <View style={styles.stockMain}>
            <Text style={styles.stockValue}>
              {formatNumber(
                product.current_stock,
              )}
            </Text>

            <Text style={styles.stockUnit}>
              {product.unit}
            </Text>
          </View>

          <View style={styles.stockLimits}>
            <View>
              <Text style={styles.limitLabel}>
                Mínimo
              </Text>

              <Text style={styles.limitValue}>
                {formatNumber(
                  product.min_stock,
                )}
              </Text>
            </View>

            <View style={styles.limitDivider} />

            <View>
              <Text style={styles.limitLabel}>
                Máximo
              </Text>

              <Text style={styles.limitValue}>
                {product.max_stock !== null
                  ? formatNumber(
                      product.max_stock,
                    )
                  : "—"}
              </Text>
            </View>
          </View>
        </View>

        {intelligence && riskStatus ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Inteligência de estoque
              </Text>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  router.push(
                    `/(tabs)/more/intelligence/${product.id}`,
                  )
                }
              >
                <Text style={styles.sectionLink}>
                  Ver detalhes
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.intelligenceCard}>
              <View style={styles.intelligenceTop}>
                <View style={styles.intelligenceIcon}>
                  <Text style={styles.intelligenceIconText}>
                    ✦
                  </Text>
                </View>

                <View style={styles.intelligenceInfo}>
                  <Text style={styles.intelligenceTitle}>
                    Risco do estoque
                  </Text>

                  <View
                    style={[
                      styles.riskBadge,
                      {
                        backgroundColor:
                          riskStatus.background,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.riskBadgeText,
                        {
                          color:
                            riskStatus.color,
                        },
                      ]}
                    >
                      {riskStatus.label}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.intelligenceMetrics}>
                <View style={styles.intelligenceMetric}>
                  <Text style={styles.metricLabel}>
                    Consumo médio
                  </Text>

                  <Text style={styles.metricValue}>
                    {formatNumber(
                      intelligence.average_daily_consumption,
                    )}
                    {" "}
                    {product.unit}/dia
                  </Text>
                </View>

                <View style={styles.metricDivider} />

                <View style={styles.intelligenceMetric}>
                  <Text style={styles.metricLabel}>
                    Até o mínimo
                  </Text>

                  <Text style={styles.metricValue}>
                    {intelligence.estimated_days_until_min_stock !==
                    null
                      ? `${formatNumber(
                          intelligence.estimated_days_until_min_stock,
                        )} dias`
                      : "Sem previsão"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Valores
          </Text>

          <View style={styles.card}>
            <DetailRow
              label="Preço de custo"
              value={formatCurrency(
                product.cost_price,
              )}
            />

            <View style={styles.rowDivider} />

            <DetailRow
              label="Preço de venda"
              value={formatCurrency(
                product.sale_price,
              )}
            />

            <View style={styles.rowDivider} />

            <DetailRow
              label="Unidade"
              value={product.unit}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Informações
          </Text>

          <View style={styles.card}>
            <DetailRow
  label="Categoria"
  value={categoryName || "Não informado"}
/>

            <View style={styles.rowDivider} />

            <DetailRow
  label="Fornecedor"
  value={supplierName || "Não informado"}
/>

            <View style={styles.rowDivider} />

            <DetailRow
              label="Status"
              value={
                product.is_active
                  ? "Ativo"
                  : "Inativo"
              }
            />
          </View>
        </View>

        {product.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Descrição
            </Text>

            <View style={styles.card}>
              <Text
                style={styles.description}
              >
                {product.description}
              </Text>
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Movimentações recentes
            </Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                router.push(
                  "/(tabs)/movements",
                )
              }
            >
              <Text style={styles.sectionLink}>
                Ver todas
              </Text>
            </TouchableOpacity>
          </View>

          {movements.length > 0 ? (
            <View style={styles.card}>
              {movements.map(
                (movement, index) => {
                  const meta =
                    getMovementMeta(
                      movement.movement_type,
                    );

                  return (
                    <View
                      key={movement.id}
                    >
                      <View
                        style={
                          styles.movementRow
                        }
                      >
                        <View
                          style={[
                            styles.movementIcon,
                            {
                              backgroundColor:
                                meta.background,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.movementIconText,
                              {
                                color:
                                  meta.color,
                              },
                            ]}
                          >
                            {meta.symbol}
                          </Text>
                        </View>

                        <View
                          style={
                            styles.movementInfo
                          }
                        >
                          <Text
                            style={
                              styles.movementType
                            }
                          >
                            {meta.label}
                          </Text>

                          <Text
                            style={
                              styles.movementDate
                            }
                          >
                            {formatDateTime(
                              movement.created_at,
                            )}
                          </Text>
                        </View>

                        <View
                          style={
                            styles.movementValue
                          }
                        >
                          <Text
                            style={[
                              styles.movementQuantity,
                              {
                                color:
                                  meta.color,
                              },
                            ]}
                          >
                            {meta.symbol}
                            {formatNumber(
                              movement.quantity,
                            )}
                          </Text>

                          <Text
                            style={
                              styles.movementStock
                            }
                          >
                            Estoque:{" "}
                            {formatNumber(
                              movement.new_stock,
                            )}
                          </Text>
                        </View>
                      </View>

                      {index <
                      movements.length - 1 ? (
                        <View
                          style={
                            styles.rowDivider
                          }
                        />
                      ) : null}
                    </View>
                  );
                },
              )}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <Text style={styles.emptyIconText}>
                  ↔
                </Text>
              </View>

              <Text style={styles.emptyTitle}>
                Nenhuma movimentação
              </Text>

              <Text style={styles.emptyDescription}>
                Este produto ainda não possui
                movimentações registradas.
              </Text>
            </View>
          )}
        </View>

        {user.role === "ADMIN" ? (
          <View style={styles.actions}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.primaryAction}
              onPress={() =>
                router.push(
                  `/(tabs)/products/${product.id}/edit`,
                )
              }
            >
              <Text
                style={
                  styles.primaryActionText
                }
              >
                Editar produto
              </Text>
            </TouchableOpacity>

            
{product.is_active ? (
  <TouchableOpacity
    activeOpacity={0.85}
    disabled={actionLoading}
    style={[
      styles.dangerAction,
      actionLoading && styles.actionDisabled,
    ]}
    onPress={handleDeactivate}
  >
    {actionLoading ? (
      <ActivityIndicator
        size="small"
        color={colors.coral[600]}
      />
    ) : (
      <Text style={styles.dangerActionText}>
        Desativar produto
      </Text>
    )}
  </TouchableOpacity>

) : (
    <TouchableOpacity
       activeOpacity={0.85}
       disabled={actionLoading}
       style={[
          styles.restoreAction,
          actionLoading && styles.actionDisabled,
       ]}
       onPress={executeRestore}
    >
     {actionLoading ? (
      <ActivityIndicator size="small" color={colors.text.inverse} />
     ) : (
      <Text style={styles.restoreActionText}>
        Restaurar produto
      </Text>
     )}
    </TouchableOpacity>
  )}
          </View>
        ) : null}

        <View style={styles.bottomSpace} />
      </ScrollView>
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
    paddingTop: spacing[7],
    paddingBottom: spacing[10],
  },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background.light,
    paddingHorizontal: spacing[6],
  },

  loadingText: {
    color: colors.text.secondary,
    fontSize: 14,
    marginTop: spacing[3],
  },

  errorIcon: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
    backgroundColor: colors.coral[50],
    marginBottom: spacing[4],
  },

  errorIconText: {
    color: colors.coral[600],
    fontSize: 24,
    fontWeight: "800",
  },

  errorTitle: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: "700",
  },

  errorDescription: {
    maxWidth: 300,
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: spacing[2],
  },

  backButton: {
    marginTop: spacing[5],
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    borderRadius: radius.md,
    backgroundColor: colors.brand[500],
  },

  backButtonText: {
    color: colors.text.inverse,
    fontSize: 13,
    fontWeight: "700",
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing[7],
  },

  backIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: colors.surface.light,
    borderWidth: 1,
    borderColor: colors.border.light,
  },

  backIconText: {
    color: colors.text.primary,
    fontSize: 30,
    fontWeight: "300",
    lineHeight: 32,
  },

  topBarTitle: {
    color: colors.text.primary,
    fontSize: 17,
    fontWeight: "700",
  },

  topBarSpacer: {
    width: 42,
  },

  hero: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing[5],
  },

  productIcon: {
    width: 68,
    height: 68,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.xl,
    backgroundColor: colors.brand[50],
  },

  productIconText: {
    color: colors.brand[600],
    fontSize: 27,
    fontWeight: "800",
  },

  heroInfo: {
    flex: 1,
    marginLeft: spacing[4],
  },

  productName: {
    color: colors.text.primary,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
  },

  productSku: {
    color: colors.text.secondary,
    fontSize: 12,
    marginTop: spacing[1],
  },

  statusBadge: {
    alignSelf: "flex-start",
    marginTop: spacing[2],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "800",
  },

  stockCard: {
    padding: spacing[6],
    borderRadius: radius.xl,
    backgroundColor: colors.brand[500],
    ...shadows.floating,
  },

  cardEyebrow: {
    color: colors.brand[100],
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },

  stockMain: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: spacing[2],
  },

  stockValue: {
    color: colors.text.inverse,
    fontSize: 38,
    fontWeight: "800",
    letterSpacing: -1,
  },

  stockUnit: {
    color: colors.brand[100],
    fontSize: 13,
    fontWeight: "600",
    marginLeft: spacing[2],
  },

  stockLimits: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing[5],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.18)",
  },

  limitLabel: {
    color: colors.brand[100],
    fontSize: 10,
    fontWeight: "600",
  },

  limitValue: {
    color: colors.text.inverse,
    fontSize: 15,
    fontWeight: "700",
    marginTop: 2,
  },

  limitDivider: {
    width: 1,
    height: 30,
    marginHorizontal: spacing[6],
    backgroundColor: "rgba(255,255,255,0.18)",
  },

  section: {
    marginTop: spacing[7],
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing[3],
  },

  sectionTitle: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 17,
    fontWeight: "700",
  },

  sectionHeaderTitle: {
    flex: 1,
  },

  sectionLink: {
    color: colors.brand[600],
    fontSize: 12,
    fontWeight: "700",
  },

  card: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[2],
    borderRadius: radius.xl,
    backgroundColor: colors.surface.light,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.soft,
  },

  detailRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[4],
  },

  detailLabel: {
    flex: 1,
    color: colors.text.secondary,
    fontSize: 13,
  },

  detailValue: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "right",
  },

  rowDivider: {
    height: 1,
    backgroundColor: colors.border.light,
  },

  description: {
    color: colors.text.secondary,
    fontSize: 13,
    lineHeight: 21,
    paddingVertical: spacing[3],
  },

  intelligenceCard: {
    padding: spacing[5],
    borderRadius: radius.xl,
    backgroundColor: colors.surface.light,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.soft,
  },

  intelligenceTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  intelligenceIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: colors.brand[50],
  },

  intelligenceIconText: {
    color: colors.brand[600],
    fontSize: 21,
    fontWeight: "800",
  },

  intelligenceInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },

  intelligenceTitle: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: "700",
  },

  riskBadge: {
    alignSelf: "flex-start",
    marginTop: spacing[1],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
  },

  riskBadgeText: {
    fontSize: 10,
    fontWeight: "800",
  },

  intelligenceMetrics: {
    flexDirection: "row",
    marginTop: spacing[5],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },

  intelligenceMetric: {
    flex: 1,
  },

  metricDivider: {
    width: 1,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing[4],
  },

  metricLabel: {
    color: colors.text.muted,
    fontSize: 10,
    fontWeight: "600",
  },

  metricValue: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: "700",
    marginTop: spacing[1],
  },

  movementRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
  },

  movementIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },

  movementIconText: {
    fontSize: 18,
    fontWeight: "800",
  },

  movementInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },

  movementType: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: "700",
  },

  movementDate: {
    color: colors.text.muted,
    fontSize: 10,
    marginTop: 2,
  },

  movementValue: {
    alignItems: "flex-end",
  },

  movementQuantity: {
    fontSize: 13,
    fontWeight: "800",
  },

  movementStock: {
    color: colors.text.muted,
    fontSize: 9,
    marginTop: 2,
  },

  emptyCard: {
    alignItems: "center",
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[6],
    borderRadius: radius.xl,
    backgroundColor: colors.surface.light,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.soft,
  },

  emptyIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
  },

  emptyIconText: {
    color: colors.text.muted,
    fontSize: 20,
    fontWeight: "700",
  },

  emptyTitle: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: "700",
    marginTop: spacing[3],
  },

  emptyDescription: {
    color: colors.text.secondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: spacing[1],
  },

  actions: {
    marginTop: spacing[8],
  },

  primaryAction: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
    backgroundColor: colors.brand[500],
    ...shadows.floating,
  },

  primaryActionText: {
    color: colors.text.inverse,
    fontSize: 14,
    fontWeight: "700",
  },

  bottomSpace: {
    height: spacing[5],
  },

  
dangerAction: {
  minHeight: 52,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: radius.lg,
  backgroundColor: colors.coral[50],
  borderWidth: 1,
  borderColor: colors.coral[100],
  marginTop: spacing[3],
},

dangerActionText: {
  color: colors.coral[600],
  fontSize: 14,
  fontWeight: "700",
},

actionDisabled: {
  opacity: 0.6,
},


restoreAction: {
  backgroundColor: colors.teal[700],
  borderRadius: radius.lg,
  paddingVertical: spacing[4],
  alignItems: "center",
  justifyContent: "center",
},
restoreActionText: {
  color: colors.text.inverse,
  fontSize: 14,
  fontWeight: "700",
},

});

