import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../../../../src/auth/AuthContext";
import { getProductStockIntelligence } from "../../../../src/modules/stock-intelligence/stockIntelligenceService";
import type {
  StockIntelligenceItem,
  StockRiskLevel,
} from "../../../../src/modules/stock-intelligence/stockIntelligence.types";
import { colors } from "../../../../src/theme/colors";
import { radius, shadows, spacing } from "../../../../src/theme/spacing";

const PERIOD_OPTIONS = [7, 30, 90];

function formatNumber(
  value: string | null,
  decimals = 1,
) {
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
      return "Alto risco";
    case "MEDIUM":
      return "Médio risco";
    case "LOW":
      return "Baixo risco";
    case "NO_DATA":
      return "Sem dados";
  }
}

function getRiskColors(risk: StockRiskLevel) {
  switch (risk) {
    case "OUT_OF_STOCK":
      return {
        background: colors.coral[50],
        border: colors.coral[100],
        text: colors.coral[700],
        icon: "close-circle" as const,
      };

    case "CRITICAL":
      return {
        background: colors.coral[50],
        border: colors.coral[100],
        text: colors.coral[700],
        icon: "alert-circle" as const,
      };

    case "HIGH":
      return {
        background: colors.amber[50],
        border: colors.amber[100],
        text: colors.amber[700],
        icon: "warning" as const,
      };

    case "MEDIUM":
      return {
        background: colors.amber[50],
        border: colors.amber[100],
        text: colors.amber[700],
        icon: "time" as const,
      };

    case "LOW":
      return {
        background: colors.teal[50],
        border: colors.teal[100],
        text: colors.teal[700],
        icon: "checkmark-circle" as const,
      };

    case "NO_DATA":
      return {
        background: colors.neutral[100],
        border: colors.neutral[200],
        text: colors.neutral[600],
        icon: "remove-circle-outline" as const,
      };
  }
}

function getRiskDescription(risk: StockRiskLevel) {
  switch (risk) {
    case "OUT_OF_STOCK":
      return "O produto está sem estoque disponível.";

    case "CRITICAL":
      return "O estoque atual está no nível mínimo ou abaixo dele.";

    case "HIGH":
      return "A estimativa indica que o estoque pode atingir o mínimo em até 7 dias.";

    case "MEDIUM":
      return "A estimativa indica que o estoque pode atingir o mínimo em até 30 dias.";

    case "LOW":
      return "O estoque está em uma situação confortável considerando o consumo atual.";

    case "NO_DATA":
      return "Ainda não há consumo suficiente para estimar o tempo até o estoque mínimo.";
  }
}

export default function StockIntelligenceProductScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { accessToken } = useAuth();

  const [days, setDays] = useState(30);
  const [data, setData] =
    useState<StockIntelligenceItem | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!accessToken || !id) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getProductStockIntelligence(
        accessToken,
        Number(id),
        days,
      );

      setData(result);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Não foi possível carregar a inteligência do produto.",
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken, id, days]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
          Analisando produto...
        </Text>

        <Text style={styles.loadingDescription}>
          Calculando consumo e previsão de estoque.
        </Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIcon}>
          <Ionicons
            name="alert-circle-outline"
            size={32}
            color={colors.danger}
          />
        </View>

        <Text style={styles.errorTitle}>
          Não foi possível carregar
        </Text>

        <Text style={styles.errorDescription}>
          {error ?? "Produto não encontrado."}
        </Text>

        <Pressable
          onPress={loadData}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>
            Tentar novamente
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.back()}
          style={styles.backTextButton}
        >
          <Text style={styles.backTextButtonText}>
            Voltar
          </Text>
        </Pressable>
      </View>
    );
  }

  const risk = getRiskColors(data.risk_level);

  const stockAboveMinimum =
    Number(data.current_stock) - Number(data.min_stock);

  const stockPercentage =
    Number(data.min_stock) > 0
      ? Math.min(
          (Number(data.current_stock) /
            Number(data.min_stock)) *
            100,
          200,
        )
      : 100;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
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

          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>
              INTELIGÊNCIA DE ESTOQUE
            </Text>

            <Text
              style={styles.title}
              numberOfLines={2}
            >
              {data.product_name}
            </Text>

            <Text style={styles.sku}>
              SKU {data.sku}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.riskCard,
            {
              backgroundColor: risk.background,
              borderColor: risk.border,
            },
          ]}
        >
          <View
            style={[
              styles.riskIcon,
              { backgroundColor: colors.surface.light },
            ]}
          >
            <Ionicons
              name={risk.icon}
              size={26}
              color={risk.text}
            />
          </View>

          <View style={styles.riskContent}>
            <Text
              style={[
                styles.riskLabel,
                { color: risk.text },
              ]}
            >
              {getRiskLabel(data.risk_level)}
            </Text>

            <Text style={styles.riskDescription}>
              {getRiskDescription(data.risk_level)}
            </Text>
          </View>
        </View>

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
                      active &&
                        styles.periodButtonTextActive,
                    ]}
                  >
                    {option} dias
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View
              style={[
                styles.metricIcon,
                {
                  backgroundColor:
                    colors.brand[50],
                },
              ]}
            >
              <Ionicons
                name="cube-outline"
                size={21}
                color={colors.brand[500]}
              />
            </View>

            <Text style={styles.metricLabel}>
              Estoque atual
            </Text>

            <Text style={styles.metricValue}>
              {formatNumber(data.current_stock)}
            </Text>
          </View>

          <View style={styles.metricCard}>
            <View
              style={[
                styles.metricIcon,
                {
                  backgroundColor:
                    colors.amber[50],
                },
              ]}
            >
              <Ionicons
                name="speedometer-outline"
                size={21}
                color={colors.amber[600]}
              />
            </View>

            <Text style={styles.metricLabel}>
              Estoque mínimo
            </Text>

            <Text style={styles.metricValue}>
              {formatNumber(data.min_stock)}
            </Text>
          </View>

          <View style={styles.metricCard}>
            <View
              style={[
                styles.metricIcon,
                {
                  backgroundColor:
                    colors.teal[50],
                },
              ]}
            >
              <Ionicons
                name="trending-down-outline"
                size={21}
                color={colors.teal[600]}
              />
            </View>

            <Text style={styles.metricLabel}>
              Consumo diário
            </Text>

            <Text style={styles.metricValue}>
              {formatNumber(
                data.average_daily_consumption,
              )}
            </Text>
          </View>

          <View style={styles.metricCard}>
            <View
              style={[
                styles.metricIcon,
                {
                  backgroundColor:
                    colors.coral[50],
                },
              ]}
            >
              <Ionicons
                name="calendar-outline"
                size={21}
                color={colors.coral[600]}
              />
            </View>

            <Text style={styles.metricLabel}>
              Até o mínimo
            </Text>

            <Text style={styles.metricValue}>
              {data.estimated_days_until_min_stock ===
              null
                ? "—"
                : `${formatNumber(
                    data.estimated_days_until_min_stock,
                  )} dias`}
            </Text>
          </View>
        </View>

        <View style={styles.stockCard}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Nível de estoque
              </Text>

              <Text style={styles.sectionDescription}>
                Relação entre o estoque atual e o mínimo.
              </Text>
            </View>

            <Text style={styles.stockPercentage}>
              {Math.round(stockPercentage)}%
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.max(
                    4,
                    Math.min(stockPercentage, 100),
                  )}%`,
                  backgroundColor: risk.text,
                },
              ]}
            />
          </View>

          <View style={styles.stockLegend}>
            <View>
              <Text style={styles.stockLegendLabel}>
                Atual
              </Text>

              <Text style={styles.stockLegendValue}>
                {formatNumber(data.current_stock)}
              </Text>
            </View>

            <View style={styles.stockLegendRight}>
              <Text style={styles.stockLegendLabel}>
                Mínimo
              </Text>

              <Text style={styles.stockLegendValue}>
                {formatNumber(data.min_stock)}
              </Text>
            </View>
          </View>

          <View style={styles.aboveMinimum}>
            <Ionicons
              name={
                stockAboveMinimum >= 0
                  ? "checkmark-circle-outline"
                  : "alert-circle-outline"
              }
              size={18}
              color={
                stockAboveMinimum >= 0
                  ? colors.teal[600]
                  : colors.coral[600]
              }
            />

            <Text style={styles.aboveMinimumText}>
              {stockAboveMinimum >= 0
                ? `${formatNumber(
                    String(stockAboveMinimum),
                  )} unidades acima do mínimo`
                : `${formatNumber(
                    String(Math.abs(stockAboveMinimum)),
                  )} unidades abaixo do mínimo`}
            </Text>
          </View>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightIcon}>
            <Ionicons
              name="bulb-outline"
              size={23}
              color={colors.brand[500]}
            />
          </View>

          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>
              Como interpretar
            </Text>

            <Text style={styles.insightText}>
              A estimativa considera o consumo médio diário
              registrado no período selecionado e calcula
              quanto tempo o estoque atual pode levar para
              atingir o nível mínimo.
            </Text>
          </View>
        </View>
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
    paddingBottom: spacing[12],
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

  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background.light,
    paddingHorizontal: spacing[6],
  },

  errorIcon: {
    width: 66,
    height: 66,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.coral[50],
    marginBottom: spacing[4],
  },

  errorTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: colors.text.primary,
  },

  errorDescription: {
    marginTop: spacing[2],
    fontSize: 13,
    lineHeight: 19,
    color: colors.text.secondary,
    textAlign: "center",
  },

  retryButton: {
    marginTop: spacing[5],
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    borderRadius: radius.md,
    backgroundColor: colors.brand[500],
  },

  retryButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text.inverse,
  },

  backTextButton: {
    marginTop: spacing[3],
    padding: spacing[2],
  },

  backTextButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text.secondary,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing[5],
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface.light,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginRight: spacing[3],
  },

  headerText: {
    flex: 1,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.1,
    color: colors.brand[500],
  },

  title: {
    marginTop: 3,
    fontSize: 23,
    lineHeight: 29,
    fontWeight: "800",
    color: colors.text.primary,
  },

  sku: {
    marginTop: 3,
    fontSize: 11,
    color: colors.text.muted,
  },

  riskCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing[4],
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: spacing[5],
  },

  riskIcon: {
    width: 50,
    height: 50,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },

  riskContent: {
    flex: 1,
    marginLeft: spacing[3],
  },

  riskLabel: {
    fontSize: 16,
    fontWeight: "800",
  },

  riskDescription: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 18,
    color: colors.text.secondary,
  },

  periodSection: {
    marginBottom: spacing[5],
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

  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[3],
    marginBottom: spacing[5],
  },

  metricCard: {
    width: "47.5%",
    padding: spacing[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface.light,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.soft,
  },

  metricIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },

  metricLabel: {
    marginTop: spacing[3],
    fontSize: 11,
    color: colors.text.secondary,
  },

  metricValue: {
    marginTop: 3,
    fontSize: 18,
    fontWeight: "800",
    color: colors.text.primary,
  },

  stockCard: {
    padding: spacing[5],
    borderRadius: radius.xl,
    backgroundColor: colors.surface.light,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginBottom: spacing[5],
    ...shadows.soft,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text.primary,
  },

  sectionDescription: {
    marginTop: 3,
    fontSize: 11,
    color: colors.text.secondary,
  },

  stockPercentage: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text.primary,
  },

  progressTrack: {
    height: 9,
    marginTop: spacing[5],
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: radius.full,
  },

  stockLegend: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing[3],
  },

  stockLegendRight: {
    alignItems: "flex-end",
  },

  stockLegendLabel: {
    fontSize: 10,
    color: colors.text.muted,
  },

  stockLegendValue: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "700",
    color: colors.text.primary,
  },

  aboveMinimum: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing[4],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },

  aboveMinimumText: {
    marginLeft: spacing[2],
    fontSize: 12,
    color: colors.text.secondary,
  },

  insightCard: {
    flexDirection: "row",
    padding: spacing[4],
    borderRadius: radius.xl,
    backgroundColor: colors.brand[50],
    borderWidth: 1,
    borderColor: colors.brand[100],
  },

  insightIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface.light,
  },

  insightContent: {
    flex: 1,
    marginLeft: spacing[3],
  },

  insightTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.text.primary,
  },

  insightText: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 17,
    color: colors.text.secondary,
  },
});