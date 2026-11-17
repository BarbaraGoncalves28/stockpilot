import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";

import type { DashboardSummary } from "../../dashboard.types";
import { useStockFlow } from "../../hooks/useStockFlow";
import {
  formatDashboardNumber,
  formatTurnoverRate,
} from "../../utils/dashboard.utils";
import { styles } from "./StockFlow.styles";

type StockFlowProps = {
  summary: DashboardSummary;
  selectedPeriod: number;
  periodLoading: boolean;
  onPeriodChange: (days: number) => void;
};

export function StockFlow({
  summary,
  selectedPeriod,
  periodLoading,
  onPeriodChange,
}: StockFlowProps) {
  const {
    periodMenuOpen,
    togglePeriodMenu,
    handlePeriodChange,
    showTurnoverInfo,
  } = useStockFlow({
    selectedPeriod,
    onPeriodChange,
  });

  const balance = Number(summary.period_balance);
  const turnoverRate = Number(summary.stock_turnover_rate);
  const normalizedTurnover = Math.min(
    Math.max(turnoverRate, 0),
    100,
  );

  const circleSize = 54;
  const circleRadius = 22;
  const circleCircumference = 2 * Math.PI * circleRadius;

  return (
    <View style={styles.section}>
      <View style={styles.periodCard}>
        <View style={styles.periodHeader}>
          <View style={styles.periodHeading}>
            <Ionicons name="calendar-outline" size={20} color="#00E599" />

            <View style={styles.periodHeadingText}>
              <Text style={styles.periodTitle}>
                Últimos {selectedPeriod} dias
              </Text>

              <Text style={styles.periodDescription}>
                Fluxo de estoque por entradas e saídas registradas no período.
              </Text>
            </View>
          </View>

          <View style={styles.periodSelectorContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={togglePeriodMenu}
              style={styles.periodSelector}
            >
              <Text style={styles.periodSelectorText}>
                Últimos {selectedPeriod} dias
              </Text>

              <Ionicons
                name={periodMenuOpen ? "chevron-up" : "chevron-down"}
                size={14}
                color="#8B9BB4"
              />
            </TouchableOpacity>

            {periodMenuOpen && (
              <View style={styles.periodDropdown}>
                {[7, 15, 30].map((days) => (
                  <TouchableOpacity
                    key={days}
                    activeOpacity={0.7}
                    onPress={() => handlePeriodChange(days)}
                    style={[
                      styles.periodDropdownOption,
                      selectedPeriod === days &&
                        styles.periodDropdownOptionActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.periodDropdownText,
                        selectedPeriod === days &&
                          styles.periodDropdownTextActive,
                      ]}
                    >
                      Últimos {days} dias
                    </Text>

                    {selectedPeriod === days && (
                      <Ionicons
                        name="checkmark"
                        size={15}
                        color="#00E599"
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={styles.flowRow}>
          <View style={[styles.flowItem, styles.entryItem]}>
            <View style={styles.flowLabelRow}>
              <MaterialCommunityIcons
                name="trending-up"
                size={13}
                color="#00E599"
              />
              <Text style={styles.flowLabel}>Entradas</Text>
            </View>

            <View style={styles.flowMetricRow}>
              <MaterialCommunityIcons
                name="package-variant-closed"
                size={19}
                color="#00E599"
              />

              <View style={styles.flowContent}>
                <Text style={[styles.flowValue, { color: "#FFFFFF" }]}>
                  +{formatDashboardNumber(summary.period_entries)}
                </Text>

                <Text style={styles.flowUnit}>produtos</Text>
              </View>
            </View>
          </View>

          <View style={[styles.flowItem, styles.exitItem]}>
            <View style={styles.flowLabelRow}>
              <MaterialCommunityIcons
                name="trending-down"
                size={13}
                color="#FF3366"
              />
              <Text style={styles.flowLabel}>Saídas</Text>
            </View>

            <View style={styles.flowMetricRow}>
              <MaterialCommunityIcons
                name="package-variant-closed"
                size={19}
                color="#FF3366"
              />

              <View style={styles.flowContent}>
                <Text style={[styles.flowValue, { color: "#FFFFFF" }]}>
                  -{formatDashboardNumber(summary.period_exits)}
                </Text>

                <Text style={styles.flowUnit}>produtos</Text>
              </View>
            </View>
          </View>

          <View style={[styles.flowItem, styles.balanceItem]}>
            <View style={styles.flowLabelRow}>
              <MaterialCommunityIcons
                name="pulse"
                size={13}
                color="#00D1FF"
              />
              <Text style={styles.flowLabel}>Saldo do período</Text>
            </View>

            <View style={styles.flowMetricRow}>
              <MaterialCommunityIcons
                name="scale-balance"
                size={19}
                color="#00D1FF"
              />

              <View style={styles.flowContent}>
                <Text
                  style={[
                    styles.flowValue,
                    {
                      color: balance >= 0 ? "#00E599" : "#FF3366",
                    },
                  ]}
                >
                  {balance > 0 ? "+" : ""}
                  {formatDashboardNumber(summary.period_balance)}
                </Text>

                <Text style={styles.flowUnit}>produtos</Text>
              </View>
            </View>
          </View>

          <View style={[styles.flowItem, styles.turnoverItem]}>
            <View style={styles.turnoverCircle}>
              <Svg
                width={circleSize}
                height={circleSize}
                viewBox={`0 0 ${circleSize} ${circleSize}`}
              >
                <Circle
                  cx={circleSize / 2}
                  cy={circleSize / 2}
                  r={circleRadius}
                  stroke="#1E2A3B"
                  strokeWidth={4.5}
                  fill="none"
                />

                <Circle
                  cx={circleSize / 2}
                  cy={circleSize / 2}
                  r={circleRadius}
                  stroke="#00E599"
                  strokeWidth={8}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circleCircumference}
                  strokeDashoffset={
                    circleCircumference -
                    (normalizedTurnover / 100) * circleCircumference
                  }
                  transform={`rotate(-90 ${circleSize / 2} ${circleSize / 2})`}
                />
              </Svg>

              <Text style={styles.turnoverPercentage}>
                {formatTurnoverRate(summary.stock_turnover_rate)}%
              </Text>
            </View>

            <View style={styles.flowContent}>
              <View style={styles.turnoverTitleRow}>
                <Text style={styles.flowLabel}>Giro de estoque</Text>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={showTurnoverInfo}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={15}
                    color="#8B9BB4"
                  />
                </TouchableOpacity>
              </View>

              
            </View>
          </View>
        </View>

        {periodLoading && (
          <View style={styles.periodLoading}>
            <ActivityIndicator size="small" color="#00E599" />

            <Text style={styles.periodLoadingText}>
              Atualizando indicadores...
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
