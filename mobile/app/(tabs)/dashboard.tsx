import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";

import { useAuth } from "../../src/auth/AuthContext";
import {
  getDashboardMovements,
  getDashboardSummary,
} from "../../src/modules/dashboard/dashboardService";
import type {
  DashboardMovementChartItem,
  DashboardSummary,
} from "../../src/modules/dashboard/dashboard.types";
import {
  getStockIntelligenceAlerts,
} from "../../src/modules/stock-intelligence/stockIntelligenceService";
import type {
  StockAlertItem,
  StockRiskLevel,
} from "../../src/modules/stock-intelligence/stockIntelligence.types";
import { SectionHeader } from "../../src/components/SectionHeader";
import { StatCard } from "../../src/components/StatCard";
import { colors } from "../../src/theme/colors";
import {
  radius,
  shadows,
  spacing,
} from "../../src/theme/spacing";

function formatNumber(value: string | number) {
  return Number(value).toLocaleString("pt-BR", {
    maximumFractionDigits: 3,
  });
}

function getFirstName(name: string) {
  return name.trim().split(" ")[0] || "usuário";
}

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(" ")
    .filter(Boolean);

  if (parts.length === 0) {
    return "U";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 1).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getRiskLabel(riskLevel: StockRiskLevel) {
  switch (riskLevel) {
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

    default:
      return "Atenção";
  }
}

function getRiskColor(riskLevel: StockRiskLevel) {
  switch (riskLevel) {
    case "OUT_OF_STOCK":
    case "CRITICAL":
      return colors.coral[600];

    case "HIGH":
      return colors.amber[700];

    case "MEDIUM":
      return colors.amber[600];

    case "LOW":
      return colors.teal[600];

    default:
      return colors.text.secondary;
  }
}

function getRiskBackground(riskLevel: StockRiskLevel) {
  switch (riskLevel) {
    case "OUT_OF_STOCK":
    case "CRITICAL":
      return colors.coral[50];

    case "HIGH":
    case "MEDIUM":
      return colors.amber[50];

    case "LOW":
      return colors.teal[50];

    default:
      return colors.neutral[100];
  }
}

type MovementChartProps = {
  data: DashboardMovementChartItem[];
};

function MovementChart({
  data,
}: MovementChartProps) {
  const chartData = useMemo(() => {
    return data.slice(-7);
  }, [data]);

  const maxValue = useMemo(() => {
    const values = chartData.flatMap((item) => [
      Number(item.entries),
      Number(item.exits),
    ]);

    return Math.max(...values, 1);
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <View style={styles.emptyChart}>
        <View style={styles.emptyChartIcon}>
          <Text style={styles.emptyChartIconText}>↗</Text>
        </View>

        <Text style={styles.emptyChartTitle}>
          Nenhuma movimentação ainda
        </Text>

        <Text style={styles.emptyChartDescription}>
          As entradas e saídas dos últimos dias aparecerão
          aqui quando houver movimentações no estoque.
        </Text>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.chartLegend}>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              {
                backgroundColor: colors.teal[500],
              },
            ]}
          />

          <Text style={styles.legendText}>
            Entradas
          </Text>
        </View>

        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              {
                backgroundColor: colors.coral[500],
              },
            ]}
          />

          <Text style={styles.legendText}>
            Saídas
          </Text>
        </View>
      </View>

      <View style={styles.chart}>
        {chartData.map((item) => {
          const entries = Number(item.entries);
          const exits = Number(item.exits);

          const entryHeight =
            entries > 0
              ? Math.max((entries / maxValue) * 130, 6)
              : 0;

          const exitHeight =
            exits > 0
              ? Math.max((exits / maxValue) * 130, 6)
              : 0;

          const date = new Date(`${item.date}T00:00:00`);

          const label = date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
          });

          return (
            <View
              key={item.date}
              style={styles.chartColumn}
            >
              <View style={styles.bars}>
                <View style={styles.barTrack}>
                  {entryHeight > 0 ? (
                    <View
                      style={[
                        styles.bar,
                        {
                          height: entryHeight,
                          backgroundColor: colors.teal[500],
                        },
                      ]}
                    />
                  ) : null}
                </View>

                <View style={styles.barTrack}>
                  {exitHeight > 0 ? (
                    <View
                      style={[
                        styles.bar,
                        {
                          height: exitHeight,
                          backgroundColor: colors.coral[500],
                        },
                      ]}
                    />
                  ) : null}
                </View>
              </View>

              <Text style={styles.chartLabel}>
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

type IntelligenceAlertsProps = {
  alerts: StockAlertItem[];
};

function IntelligenceAlerts({
  alerts,
}: IntelligenceAlertsProps) {
  const visibleAlerts = alerts.slice(0, 3);

  if (alerts.length === 0) {
    return (
      <View style={styles.intelligenceEmpty}>
        <View style={styles.intelligenceEmptyIcon}>
          <Text style={styles.intelligenceEmptyIconText}>
            ✓
          </Text>
        </View>

        <View style={styles.intelligenceEmptyContent}>
          <Text style={styles.intelligenceEmptyTitle}>
            Estoque sob controle
          </Text>

          <Text style={styles.intelligenceEmptyDescription}>
            Nenhum produto apresenta risco de reposição
            no momento.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View>
      {visibleAlerts.map((alert) => {
        const riskColor = getRiskColor(alert.risk_level);
        const riskBackground = getRiskBackground(
          alert.risk_level,
        );

        const estimatedDays =
          alert.estimated_days_until_min_stock !== null
            ? Number(
                alert.estimated_days_until_min_stock,
              )
            : null;

        return (
          <TouchableOpacity
            key={alert.product_id}
            activeOpacity={0.8}
            onPress={() =>
              router.push(
                `/(tabs)/more/intelligence/${alert.product_id}`,
              )
            }
            style={styles.alertItem}
          >
            <View
              style={[
                styles.alertIcon,
                {
                  backgroundColor: riskBackground,
                },
              ]}
            >
              <Text
                style={[
                  styles.alertIconText,
                  {
                    color: riskColor,
                  },
                ]}
              >
                !
              </Text>
            </View>

            <View style={styles.alertContent}>
              <View style={styles.alertTitleRow}>
                <Text
                  numberOfLines={1}
                  style={styles.alertProductName}
                >
                  {alert.product_name}
                </Text>

                <View
                  style={[
                    styles.riskBadge,
                    {
                      backgroundColor: riskBackground,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.riskBadgeText,
                      {
                        color: riskColor,
                      },
                    ]}
                  >
                    {getRiskLabel(alert.risk_level)}
                  </Text>
                </View>
              </View>

              <Text style={styles.alertSku}>
                SKU {alert.sku}
              </Text>

              <View style={styles.alertMeta}>
                <Text style={styles.alertMetaText}>
                  Estoque:{" "}
                  <Text style={styles.alertMetaStrong}>
                    {formatNumber(alert.current_stock)}
                  </Text>
                </Text>

                {estimatedDays !== null ? (
                  <Text style={styles.alertMetaText}>
                    Até o mínimo:{" "}
                    <Text style={styles.alertMetaStrong}>
                      {estimatedDays < 1
                        ? "menos de 1 dia"
                        : `${Math.ceil(estimatedDays)} dias`}
                    </Text>
                  </Text>
                ) : null}
              </View>
            </View>

            <Text style={styles.alertChevron}>
              ›
            </Text>
          </TouchableOpacity>
        );
      })}

      {alerts.length > 3 ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            router.push("/(tabs)/more/intelligence")
          }
          style={styles.viewAllButton}
        >
          <Text style={styles.viewAllButtonText}>
            Ver todos os {alerts.length} alertas
          </Text>

          <Text style={styles.viewAllButtonArrow}>
            →
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export default function DashboardScreen() {
  const {
    user,
    accessToken,
  } = useAuth();

  const [summary, setSummary] =
    useState<DashboardSummary | null>(null);

  const [movements, setMovements] =
    useState<DashboardMovementChartItem[]>([]);

  const [alerts, setAlerts] =
    useState<StockAlertItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(
    async (isRefresh = false) => {
      if (!accessToken) {
        router.replace("/");
        return;
      }

      try {
        setError("");

        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const [
          summaryResponse,
          movementsResponse,
          alertsResponse,
        ] = await Promise.all([
          getDashboardSummary(accessToken, 30),
          getDashboardMovements(accessToken, 30),
          getStockIntelligenceAlerts(accessToken, 30),
        ]);

        setSummary(summaryResponse);
        setMovements(movementsResponse);
        setAlerts(alertsResponse);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar o dashboard.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken],
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

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

  if (loading && !summary) {
    return (
      <View style={styles.centered}>
        <View style={styles.loadingIcon}>
          <ActivityIndicator
            size="small"
            color={colors.brand[500]}
          />
        </View>

        <Text style={styles.loadingTitle}>
          Carregando dashboard
        </Text>

        <Text style={styles.loadingDescription}>
          Buscando os dados mais recentes do seu estoque.
        </Text>
      </View>
    );
  }

  if (error && !summary) {
    return (
      <View style={styles.centered}>
        <View style={styles.errorIcon}>
          <Text style={styles.errorIconText}>
            !
          </Text>
        </View>

        <Text style={styles.errorTitle}>
          Não foi possível carregar
        </Text>

        <Text style={styles.errorDescription}>
          {error}
        </Text>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => loadDashboard()}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>
            Tentar novamente
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!summary) {
    return null;
  }

  const firstName = getFirstName(user.name);
  const initials = getInitials(user.name);

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadDashboard(true)}
            tintColor={colors.brand[500]}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>
              VISÃO GERAL
            </Text>

            <Text style={styles.title}>
              Olá, {firstName} 👋
            </Text>

            <Text style={styles.subtitle}>
              Acompanhe o desempenho do seu estoque.
            </Text>
          </View>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {initials}
            </Text>
          </View>
        </View>

        {error ? (
          <View style={styles.inlineError}>
            <Text style={styles.inlineErrorText}>
              {error}
            </Text>

            <TouchableOpacity
              onPress={() => loadDashboard()}
              activeOpacity={0.7}
            >
              <Text style={styles.inlineErrorAction}>
                Tentar novamente
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.statsGrid}>
          <View style={styles.statColumn}>
            <StatCard
              label="Produtos"
              value={summary.total_products}
              description="produtos ativos"
              accent="brand"
            />
          </View>

          <View style={styles.statColumn}>
            <StatCard
              label="Estoque baixo"
              value={summary.low_stock_products}
              description="precisam de atenção"
              accent="amber"
            />
          </View>

          <View style={styles.statColumn}>
            <StatCard
              label="Sem estoque"
              value={summary.out_of_stock_products}
              description="produtos zerados"
              accent="coral"
            />
          </View>

          <View style={styles.statColumn}>
            <StatCard
              label="Movimentações"
              value={summary.total_movements}
              description="registradas"
              accent="teal"
            />
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Alertas inteligentes"
            action={
              alerts.length > 0
                ? `${alerts.length} alertas`
                : "Tudo certo"
            }
          />

          <View style={styles.intelligenceCard}>
            <View style={styles.intelligenceHeader}>
              <View style={styles.intelligenceHeaderIcon}>
                <Text style={styles.intelligenceHeaderIconText}>
                  ✦
                </Text>
              </View>

              <View style={styles.intelligenceHeaderContent}>
                <Text style={styles.intelligenceTitle}>
                  Inteligência de estoque
                </Text>

                <Text style={styles.intelligenceDescription}>
                  Acompanhe riscos de reposição com base
                  no consumo recente.
                </Text>
              </View>
            </View>

            <View style={styles.intelligenceDivider} />

            <IntelligenceAlerts alerts={alerts} />

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                router.push("/(tabs)/more/intelligence")
              }
              style={styles.intelligenceLink}
            >
              <Text style={styles.intelligenceLinkText}>
                Abrir inteligência de estoque
              </Text>

              <Text style={styles.intelligenceLinkArrow}>
                →
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Últimos 30 dias"
            action={`${summary.period_days} dias`}
          />

          <View style={styles.periodCard}>
            <View style={styles.periodHeader}>
              <View>
                <Text style={styles.periodTitle}>
                  Fluxo de estoque
                </Text>

                <Text style={styles.periodDescription}>
                  Entradas e saídas registradas no período
                </Text>
              </View>

              <View style={styles.periodBadge}>
                <Text style={styles.periodBadgeText}>
                  {summary.period_movements}
                </Text>

                <Text style={styles.periodBadgeLabel}>
                  movimentos
                </Text>
              </View>
            </View>

            <View style={styles.flowRow}>
              <View style={styles.flowItem}>
                <View
                  style={[
                    styles.flowIcon,
                    {
                      backgroundColor: colors.teal[50],
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.flowIconText,
                      {
                        color: colors.teal[600],
                      },
                    ]}
                  >
                    ↑
                  </Text>
                </View>

                <View>
                  <Text style={styles.flowLabel}>
                    Entradas
                  </Text>

                  <Text style={styles.flowValue}>
                    {formatNumber(summary.period_entries)}
                  </Text>
                </View>
              </View>

              <View style={styles.flowDivider} />

              <View style={styles.flowItem}>
                <View
                  style={[
                    styles.flowIcon,
                    {
                      backgroundColor: colors.coral[50],
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.flowIconText,
                      {
                        color: colors.coral[600],
                      },
                    ]}
                  >
                    ↓
                  </Text>
                </View>

                <View>
                  <Text style={styles.flowLabel}>
                    Saídas
                  </Text>

                  <Text style={styles.flowValue}>
                    {formatNumber(summary.period_exits)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Movimentações"
            action="Últimos 7 dias"
          />

          <View style={styles.chartCard}>
            <MovementChart data={movements} />
          </View>
        </View>

        <View style={styles.footerSpace} />
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
    paddingTop: spacing[8],
    paddingBottom: spacing[10],
  },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background.light,
    paddingHorizontal: spacing[6],
  },

  loadingIcon: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
    backgroundColor: colors.brand[50],
    marginBottom: spacing[4],
  },

  loadingTitle: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: "700",
  },

  loadingDescription: {
    maxWidth: 280,
    marginTop: spacing[2],
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
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
    textAlign: "center",
  },

  errorDescription: {
    maxWidth: 300,
    marginTop: spacing[2],
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },

  retryButton: {
    marginTop: spacing[5],
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    borderRadius: radius.md,
    backgroundColor: colors.brand[500],
    ...shadows.soft,
  },

  retryButtonText: {
    color: colors.text.inverse,
    fontSize: 14,
    fontWeight: "700",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing[6],
  },

  headerText: {
    flex: 1,
    paddingRight: spacing[4],
  },

  eyebrow: {
    color: colors.brand[600],
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginBottom: spacing[2],
  },

  title: {
    color: colors.text.primary,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  subtitle: {
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing[1],
  },

  avatar: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
    backgroundColor: colors.brand[500],
    ...shadows.soft,
  },

  avatarText: {
    color: colors.text.inverse,
    fontSize: 15,
    fontWeight: "800",
  },

  inlineError: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[3],
    padding: spacing[3],
    marginBottom: spacing[5],
    borderRadius: radius.md,
    backgroundColor: colors.coral[50],
    borderWidth: 1,
    borderColor: colors.coral[100],
  },

  inlineErrorText: {
    flex: 1,
    color: colors.coral[700],
    fontSize: 12,
    lineHeight: 18,
  },

  inlineErrorAction: {
    color: colors.coral[700],
    fontSize: 12,
    fontWeight: "700",
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[3],
  },

  statColumn: {
    width: "48%",
    minWidth: 0,
  },

  section: {
    marginTop: spacing[7],
  },

  intelligenceCard: {
    backgroundColor: colors.surface.light,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing[5],
    ...shadows.soft,
  },

  intelligenceHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  intelligenceHeaderIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: colors.brand[50],
    marginRight: spacing[3],
  },

  intelligenceHeaderIconText: {
    color: colors.brand[600],
    fontSize: 22,
    fontWeight: "800",
  },

  intelligenceHeaderContent: {
    flex: 1,
  },

  intelligenceTitle: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: "800",
  },

  intelligenceDescription: {
    color: colors.text.secondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },

  intelligenceDivider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing[4],
  },

  intelligenceEmpty: {
    flexDirection: "row",
    alignItems: "center",
  },

  intelligenceEmptyIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
    backgroundColor: colors.teal[50],
    marginRight: spacing[3],
  },

  intelligenceEmptyIconText: {
    color: colors.teal[600],
    fontSize: 19,
    fontWeight: "800",
  },

  intelligenceEmptyContent: {
    flex: 1,
  },

  intelligenceEmptyTitle: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: "700",
  },

  intelligenceEmptyDescription: {
    color: colors.text.secondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },

  alertItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },

  alertIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    marginRight: spacing[3],
  },

  alertIconText: {
    fontSize: 18,
    fontWeight: "800",
  },

  alertContent: {
    flex: 1,
    minWidth: 0,
  },

  alertTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },

  alertProductName: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: "700",
  },

  riskBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: 4,
    borderRadius: radius.full,
  },

  riskBadgeText: {
    fontSize: 9,
    fontWeight: "800",
  },

  alertSku: {
    color: colors.text.muted,
    fontSize: 10,
    marginTop: 2,
  },

  alertMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[3],
    marginTop: spacing[2],
  },

  alertMetaText: {
    color: colors.text.secondary,
    fontSize: 10,
  },

  alertMetaStrong: {
    color: colors.text.primary,
    fontWeight: "700",
  },

  alertChevron: {
    color: colors.text.muted,
    fontSize: 24,
    lineHeight: 24,
    marginLeft: spacing[2],
  },

  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: spacing[4],
  },

  viewAllButtonText: {
    color: colors.brand[600],
    fontSize: 12,
    fontWeight: "700",
  },

  viewAllButtonArrow: {
    color: colors.brand[600],
    fontSize: 16,
    fontWeight: "700",
    marginLeft: spacing[2],
  },

  intelligenceLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing[4],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },

  intelligenceLinkText: {
    color: colors.brand[600],
    fontSize: 12,
    fontWeight: "700",
  },

  intelligenceLinkArrow: {
    color: colors.brand[600],
    fontSize: 17,
    fontWeight: "700",
  },

  periodCard: {
    backgroundColor: colors.surface.light,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing[5],
    ...shadows.soft,
  },

  periodHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  periodTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "700",
  },

  periodDescription: {
    maxWidth: 210,
    color: colors.text.secondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing[1],
  },

  periodBadge: {
    alignItems: "flex-end",
    paddingLeft: spacing[3],
  },

  periodBadgeText: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: "800",
  },

  periodBadgeLabel: {
    color: colors.text.muted,
    fontSize: 10,
    marginTop: 1,
  },

  flowRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing[5],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },

  flowItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },

  flowIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },

  flowIconText: {
    fontSize: 20,
    fontWeight: "700",
  },

  flowLabel: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: "600",
  },

  flowValue: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: "800",
    marginTop: 2,
  },

  flowDivider: {
    width: 1,
    height: 38,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing[4],
  },

  chartCard: {
    backgroundColor: colors.surface.light,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing[5],
    ...shadows.soft,
  },

  chartLegend: {
    flexDirection: "row",
    gap: spacing[5],
    marginBottom: spacing[5],
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },

  legendDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },

  legendText: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: "600",
  },

  chart: {
    height: 165,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingTop: spacing[2],
  },

  chartColumn: {
    flex: 1,
    alignItems: "center",
  },

  bars: {
    height: 140,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 3,
  },

  barTrack: {
    width: 8,
    height: 130,
    justifyContent: "flex-end",
  },

  bar: {
    width: 8,
    borderRadius: radius.full,
  },

  chartLabel: {
    color: colors.text.muted,
    fontSize: 9,
    marginTop: spacing[2],
  },

  emptyChart: {
    minHeight: 190,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing[5],
  },

  emptyChartIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
    backgroundColor: colors.brand[50],
    marginBottom: spacing[3],
  },

  emptyChartIconText: {
    color: colors.brand[500],
    fontSize: 24,
    fontWeight: "700",
  },

  emptyChartTitle: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },

  emptyChartDescription: {
    maxWidth: 270,
    color: colors.text.secondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: spacing[2],
  },

  footerSpace: {
    height: spacing[5],
  },
});