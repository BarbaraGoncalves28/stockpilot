import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";

import { useAuth } from "../../../../src/auth/AuthContext";
import {
  getStockIntelligence,
  getStockIntelligenceAlerts,
} from "../../../../src/modules/stock-intelligence/stockIntelligenceService";
import type {
  StockAlertItem,
  StockIntelligenceItem,
  StockRiskLevel,
} from "../../../../src/modules/stock-intelligence/stockIntelligence.types";
import { colors } from "../../../../src/theme/colors";
import { radius, shadows, spacing } from "../../../../src/theme/spacing";

const PERIOD_OPTIONS = [7, 30, 90];

function formatNumber(value: string | null, decimals = 1) {
  if (value === null) {
    return "—";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return number.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

function getRiskLabel(risk: StockRiskLevel) {
  switch (risk) {
    case "OUT_OF_STOCK":
      return "Sem estoque";
    case "CRITICAL":
      return "Crítico";
    case "HIGH":
      return "Alto";
    case "MEDIUM":
      return "Médio";
    case "LOW":
      return "Baixo";
    case "NO_DATA":
      return "Sem dados";
  }
}

function getRiskColors(risk: StockRiskLevel) {
  switch (risk) {
    case "OUT_OF_STOCK":
      return {
        background: colors.coral[50],
        text: colors.coral[700],
        icon: "close-circle" as const,
      };

    case "CRITICAL":
      return {
        background: colors.coral[50],
        text: colors.coral[700],
        icon: "alert-circle" as const,
      };

    case "HIGH":
      return {
        background: colors.amber[50],
        text: colors.amber[700],
        icon: "warning" as const,
      };

    case "MEDIUM":
      return {
        background: colors.amber[50],
        text: colors.amber[700],
        icon: "time" as const,
      };

    case "LOW":
      return {
        background: colors.teal[50],
        text: colors.teal[700],
        icon: "checkmark-circle" as const,
      };

    case "NO_DATA":
      return {
        background: colors.neutral[100],
        text: colors.neutral[600],
        icon: "remove-circle-outline" as const,
      };
  }
}

function getAlertSummary(alerts: StockAlertItem[]) {
  const outOfStock = alerts.filter(
    (item) => item.risk_level === "OUT_OF_STOCK",
  ).length;

  const critical = alerts.filter(
    (item) => item.risk_level === "CRITICAL",
  ).length;

  const high = alerts.filter(
    (item) => item.risk_level === "HIGH",
  ).length;

  const medium = alerts.filter(
    (item) => item.risk_level === "MEDIUM",
  ).length;

  return {
    outOfStock,
    critical,
    high,
    medium,
  };
}

export default function StockIntelligenceScreen() {
  const router = useRouter();
  const { accessToken } = useAuth();

  const [days, setDays] = useState(30);
  const [items, setItems] = useState<StockIntelligenceItem[]>([]);
  const [alerts, setAlerts] = useState<StockAlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(
    async (showLoading = true) => {
      if (!accessToken) {
        return;
      }

      if (showLoading) {
        setLoading(true);
      }

      setError(null);

      try {
        const [intelligenceData, alertsData] = await Promise.all([
          getStockIntelligence(accessToken, days),
          getStockIntelligenceAlerts(accessToken, days),
        ]);

        setItems(intelligenceData);
        setAlerts(alertsData);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Não foi possível carregar os dados.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken, days],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(false);
  }, [loadData]);

  const summary = useMemo(() => {
    const outOfStock = items.filter(
      (item) => item.risk_level === "OUT_OF_STOCK",
    ).length;

    const critical = items.filter(
      (item) => item.risk_level === "CRITICAL",
    ).length;

    const high = items.filter(
      (item) => item.risk_level === "HIGH",
    ).length;

    const medium = items.filter(
      (item) => item.risk_level === "MEDIUM",
    ).length;

    const withConsumption = items.filter(
      (item) => Number(item.average_daily_consumption) > 0,
    );

    const averageConsumption =
      withConsumption.length > 0
        ? withConsumption.reduce(
            (total, item) =>
              total + Number(item.average_daily_consumption),
            0,
          ) / withConsumption.length
        : 0;

    return {
      totalProducts: items.length,
      alerts: alerts.length,
      outOfStock,
      critical,
      high,
      medium,
      averageConsumption,
    };
  }, [items, alerts]);

  const visibleItems = useMemo(() => {
    return [...items]
      .filter((item) => item.risk_level !== "LOW")
      .sort((a, b) => {
        const riskOrder: Record<StockRiskLevel, number> = {
          OUT_OF_STOCK: 0,
          CRITICAL: 1,
          HIGH: 2,
          MEDIUM: 3,
          LOW: 4,
          NO_DATA: 5,
        };

        return riskOrder[a.risk_level] - riskOrder[b.risk_level];
      })
      .slice(0, 8);
  }, [items]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingIcon}>
          <Ionicons
            name="analytics-outline"
            size={28}
            color={colors.brand[500]}
          />
        </View>

        <ActivityIndicator
          size="small"
          color={colors.brand[500]}
        />

        <Text style={styles.loadingTitle}>
          Analisando o estoque...
        </Text>

        <Text style={styles.loadingDescription}>
          Calculando consumo e níveis de risco.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.brand[500]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Pressable
              onPress={() => router.back()}
              style={styles.backButton}
              hitSlop={8}
            >
              <Ionicons
                name="arrow-back"
                size={21}
                color={colors.text.primary}
              />
            </Pressable>

            <View>
              <Text style={styles.eyebrow}>
                INTELIGÊNCIA
              </Text>

              <Text style={styles.title}>
                Estoque inteligente
              </Text>

              <Text style={styles.subtitle}>
                Entenda o consumo e antecipe riscos.
              </Text>
            </View>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="analytics"
              size={24}
              color={colors.brand[500]}
            />
          </View>
        </View>

        {error ? (
          <View style={styles.errorCard}>
            <View style={styles.errorIcon}>
              <Ionicons
                name="alert-circle"
                size={21}
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
                onPress={() => loadData()}
                style={styles.retryButton}
              >
                <Text style={styles.retryButtonText}>
                  Tentar novamente
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.periodSection}>
              <Text style={styles.sectionLabel}>
                Período de análise
              </Text>

              <View style={styles.periodRow}>
                {PERIOD_OPTIONS.map((option) => {
                  const active = days === option;

                  return (
                    <Pressable
                      key={option}
                      onPress={() => setDays(option)}
                      style={[
                        styles.periodButton,
                        active && styles.periodButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.periodButtonText,
                          active && styles.periodButtonTextActive,
                        ]}
                      >
                        {option} dias
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.heroCard}>
              <View style={styles.heroTop}>
                <View style={styles.heroIcon}>
                  <Ionicons
                    name="pulse"
                    size={25}
                    color={colors.brand[500]}
                  />
                </View>

                <View style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>
                    {summary.alerts} alertas
                  </Text>
                </View>
              </View>

              <Text style={styles.heroTitle}>
                Visão geral do estoque
              </Text>

              <Text style={styles.heroDescription}>
                A análise considera os últimos {days} dias de
                movimentações para estimar o consumo.
              </Text>

              <View style={styles.heroStats}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>
                    {summary.totalProducts}
                  </Text>

                  <Text style={styles.heroStatLabel}>
                    Produtos
                  </Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.heroStat}>
                  <Text
                    style={[
                      styles.heroStatValue,
                      summary.alerts > 0 && styles.warningValue,
                    ]}
                  >
                    {summary.alerts}
                  </Text>

                  <Text style={styles.heroStatLabel}>
                    Em atenção
                  </Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>
                    {formatNumber(
                      String(summary.averageConsumption),
                    )}
                  </Text>

                  <Text style={styles.heroStatLabel}>
                    Consumo/dia
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.riskGrid}>
              <View style={styles.riskCard}>
                <View
                  style={[
                    styles.riskIcon,
                    { backgroundColor: colors.coral[50] },
                  ]}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={20}
                    color={colors.coral[600]}
                  />
                </View>

                <Text style={styles.riskValue}>
                  {summary.outOfStock}
                </Text>

                <Text style={styles.riskLabel}>
                  Sem estoque
                </Text>
              </View>

              <View style={styles.riskCard}>
                <View
                  style={[
                    styles.riskIcon,
                    { backgroundColor: colors.coral[50] },
                  ]}
                >
                  <Ionicons
                    name="alert-circle-outline"
                    size={20}
                    color={colors.coral[600]}
                  />
                </View>

                <Text style={styles.riskValue}>
                  {summary.critical}
                </Text>

                <Text style={styles.riskLabel}>
                  Críticos
                </Text>
              </View>

              <View style={styles.riskCard}>
                <View
                  style={[
                    styles.riskIcon,
                    { backgroundColor: colors.amber[50] },
                  ]}
                >
                  <Ionicons
                    name="warning-outline"
                    size={20}
                    color={colors.amber[600]}
                  />
                </View>

                <Text style={styles.riskValue}>
                  {summary.high}
                </Text>

                <Text style={styles.riskLabel}>
                  Alto risco
                </Text>
              </View>

              <View style={styles.riskCard}>
                <View
                  style={[
                    styles.riskIcon,
                    { backgroundColor: colors.amber[50] },
                  ]}
                >
                  <Ionicons
                    name="time-outline"
                    size={20}
                    color={colors.amber[600]}
                  />
                </View>

                <Text style={styles.riskValue}>
                  {summary.medium}
                </Text>

                <Text style={styles.riskLabel}>
                  Médio risco
                </Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  Produtos em atenção
                </Text>

                <Text style={styles.sectionDescription}>
                  Priorize os itens que precisam de acompanhamento.
                </Text>
              </View>

              <View style={styles.alertCount}>
                <Text style={styles.alertCountText}>
                  {visibleItems.length}
                </Text>
              </View>
            </View>

            {visibleItems.length === 0 ? (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIcon}>
                  <Ionicons
                    name="checkmark-circle"
                    size={30}
                    color={colors.teal[600]}
                  />
                </View>

                <Text style={styles.emptyTitle}>
                  Estoque sob controle
                </Text>

                <Text style={styles.emptyDescription}>
                  Nenhum produto apresenta risco de estoque no
                  período analisado.
                </Text>
              </View>
            ) : (
              <View style={styles.productsList}>
                {visibleItems.map((item) => {
                  const risk = getRiskColors(item.risk_level);

                  return (
                    <Pressable
                      key={item.product_id}
                      onPress={() =>
  router.push(
    `/(tabs)/more/intelligence/${item.product_id}`,
  )
}
                      style={({ pressed }) => [
                        styles.productCard,
                        pressed && styles.productCardPressed,
                      ]}
                    >
                      <View
                        style={[
                          styles.productRiskIcon,
                          { backgroundColor: risk.background },
                        ]}
                      >
                        <Ionicons
                          name={risk.icon}
                          size={21}
                          color={risk.text}
                        />
                      </View>

                      <View style={styles.productMain}>
                        <View style={styles.productTitleRow}>
                          <Text
                            style={styles.productName}
                            numberOfLines={1}
                          >
                            {item.product_name}
                          </Text>

                          <View
                            style={[
                              styles.riskBadge,
                              {
                                backgroundColor: risk.background,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.riskBadgeText,
                                { color: risk.text },
                              ]}
                            >
                              {getRiskLabel(item.risk_level)}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.productSku}>
                          SKU {item.sku}
                        </Text>

                        <View style={styles.productMetrics}>
                          <View style={styles.metric}>
                            <Text style={styles.metricLabel}>
                              Estoque
                            </Text>

                            <Text style={styles.metricValue}>
                              {formatNumber(item.current_stock)}
                            </Text>
                          </View>

                          <View style={styles.metric}>
                            <Text style={styles.metricLabel}>
                              Mínimo
                            </Text>

                            <Text style={styles.metricValue}>
                              {formatNumber(item.min_stock)}
                            </Text>
                          </View>

                          <View style={styles.metric}>
                            <Text style={styles.metricLabel}>
                              Consumo/dia
                            </Text>

                            <Text style={styles.metricValue}>
                              {formatNumber(
                                item.average_daily_consumption,
                              )}
                            </Text>
                          </View>

                          <View style={styles.metric}>
                            <Text style={styles.metricLabel}>
                              Até mínimo
                            </Text>

                            <Text style={styles.metricValue}>
                              {item.estimated_days_until_min_stock ===
                              null
                                ? "—"
                                : `${formatNumber(
                                    item.estimated_days_until_min_stock,
                                  )}d`}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <Ionicons
                        name="chevron-forward"
                        size={19}
                        color={colors.neutral[400]}
                      />
                    </Pressable>
                  );
                })}
              </View>
            )}

            {alerts.length > 0 && (
              <View style={styles.alertInfoCard}>
                <View style={styles.alertInfoIcon}>
                  <Ionicons
                    name="notifications-outline"
                    size={22}
                    color={colors.brand[500]}
                  />
                </View>

                <View style={styles.alertInfoContent}>
                  <Text style={styles.alertInfoTitle}>
                    {alerts.length}{" "}
                    {alerts.length === 1
                      ? "alerta precisa"
                      : "alertas precisam"}{" "}
                    de atenção
                  </Text>

                  <Text style={styles.alertInfoDescription}>
                    Os alertas são calculados automaticamente com
                    base no estoque atual e no consumo histórico.
                  </Text>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },

  content: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
    paddingBottom: spacing[10],
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background.light,
    paddingHorizontal: spacing[6],
  },

  loadingIcon: {
    width: 58,
    height: 58,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brand[50],
    marginBottom: spacing[5],
  },

  loadingTitle: {
    marginTop: spacing[4],
    fontSize: 17,
    fontWeight: "700",
    color: colors.text.primary,
  },

  loadingDescription: {
    marginTop: spacing[2],
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: spacing[6],
  },

  headerText: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface.light,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginRight: spacing[3],
  },

  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: colors.brand[500],
    marginBottom: 3,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text.primary,
  },

  subtitle: {
    marginTop: spacing[1],
    fontSize: 13,
    lineHeight: 19,
    color: colors.text.secondary,
  },

  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brand[50],
    marginLeft: spacing[3],
  },

  errorCard: {
    flexDirection: "row",
    padding: spacing[4],
    borderRadius: radius.lg,
    backgroundColor: colors.coral[50],
    borderWidth: 1,
    borderColor: colors.coral[100],
    marginBottom: spacing[5],
  },

  errorIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface.light,
  },

  errorContent: {
    flex: 1,
    marginLeft: spacing[3],
  },

  errorTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.coral[700],
  },

  errorMessage: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 18,
    color: colors.neutral[600],
  },

  retryButton: {
    alignSelf: "flex-start",
    marginTop: spacing[3],
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    backgroundColor: colors.coral[600],
  },

  retryButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text.inverse,
  },

  periodSection: {
    marginBottom: spacing[4],
  },

  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text.secondary,
    marginBottom: spacing[2],
  },

  periodRow: {
    flexDirection: "row",
    gap: spacing[2],
  },

  periodButton: {
    flex: 1,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: colors.surface.light,
    borderWidth: 1,
    borderColor: colors.border.light,
  },

  periodButtonActive: {
    backgroundColor: colors.brand[500],
    borderColor: colors.brand[500],
  },

  periodButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text.secondary,
  },

  periodButtonTextActive: {
    color: colors.text.inverse,
  },

  heroCard: {
    padding: spacing[5],
    borderRadius: radius.xl,
    backgroundColor: colors.surface.light,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginBottom: spacing[4],
    ...shadows.soft,
  },

  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  heroIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brand[50],
  },

  heroBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.amber[50],
  },

  heroBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.amber[700],
  },

  heroTitle: {
    marginTop: spacing[4],
    fontSize: 18,
    fontWeight: "800",
    color: colors.text.primary,
  },

  heroDescription: {
    marginTop: spacing[2],
    fontSize: 13,
    lineHeight: 19,
    color: colors.text.secondary,
  },

  heroStats: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing[5],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },

  heroStat: {
    flex: 1,
    alignItems: "center",
  },

  heroStatValue: {
    fontSize: 19,
    fontWeight: "800",
    color: colors.text.primary,
  },

  warningValue: {
    color: colors.amber[700],
  },

  heroStatLabel: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: "600",
    color: colors.text.muted,
  },

  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border.light,
  },

  riskGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[3],
    marginBottom: spacing[6],
  },

  riskCard: {
    width: "47.5%",
    padding: spacing[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface.light,
    borderWidth: 1,
    borderColor: colors.border.light,
  },

  riskIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },

  riskValue: {
    marginTop: spacing[3],
    fontSize: 22,
    fontWeight: "800",
    color: colors.text.primary,
  },

  riskLabel: {
    marginTop: 2,
    fontSize: 12,
    color: colors.text.secondary,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing[3],
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text.primary,
  },

  sectionDescription: {
    marginTop: 3,
    fontSize: 12,
    color: colors.text.secondary,
  },

  alertCount: {
    minWidth: 30,
    height: 30,
    paddingHorizontal: 8,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brand[50],
  },

  alertCountText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.brand[600],
  },

  productsList: {
    gap: spacing[3],
  },

  productCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface.light,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.soft,
  },

  productCardPressed: {
    opacity: 0.75,
  },

  productRiskIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing[3],
  },

  productMain: {
    flex: 1,
    minWidth: 0,
  },

  productTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  productName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
    color: colors.text.primary,
    marginRight: spacing[2],
  },

  riskBadge: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: radius.full,
  },

  riskBadgeText: {
    fontSize: 9,
    fontWeight: "800",
  },

  productSku: {
    marginTop: 3,
    fontSize: 10,
    color: colors.text.muted,
  },

  productMetrics: {
    flexDirection: "row",
    marginTop: spacing[3],
    gap: spacing[3],
  },

  metric: {
    flex: 1,
  },

  metricLabel: {
    fontSize: 9,
    color: colors.text.muted,
  },

  metricValue: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "700",
    color: colors.text.primary,
  },

  emptyCard: {
    alignItems: "center",
    padding: spacing[6],
    borderRadius: radius.xl,
    backgroundColor: colors.surface.light,
    borderWidth: 1,
    borderColor: colors.border.light,
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.teal[50],
  },

  emptyTitle: {
    marginTop: spacing[4],
    fontSize: 17,
    fontWeight: "800",
    color: colors.text.primary,
  },

  emptyDescription: {
    marginTop: spacing[2],
    fontSize: 13,
    lineHeight: 19,
    color: colors.text.secondary,
    textAlign: "center",
  },

  alertInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing[5],
    padding: spacing[4],
    borderRadius: radius.lg,
    backgroundColor: colors.brand[50],
    borderWidth: 1,
    borderColor: colors.brand[100],
  },

  alertInfoIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface.light,
  },

  alertInfoContent: {
    flex: 1,
    marginLeft: spacing[3],
  },

  alertInfoTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.text.primary,
  },

  alertInfoDescription: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 17,
    color: colors.text.secondary,
  },
});