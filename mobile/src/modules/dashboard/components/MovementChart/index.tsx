import { ActivityIndicator, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import type { MovementChartViewItem } from "../../utils/dashboard.utils";
import { MovementPeriodSelect } from "../MovementPeriodSelect";
import { styles } from "./MovementChart.styles";

const GREEN = "#00E599";
const RED = "#FF3366";

type MovementChartProps = {
  data: MovementChartViewItem[];
  loading: boolean;
  error: string;
  selectedPeriod: number;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onSelectPeriod: (days: number) => void;
};

export function MovementChart({
  data,
  loading,
  error,
  selectedPeriod,
  menuOpen,
  onToggleMenu,
  onSelectPeriod,
}: MovementChartProps) {
  const totalEntries = data.reduce((total, item) => total + item.entries, 0);
  const totalExits = data.reduce((total, item) => total + item.exits, 0);

  const maxValue = Math.max(
    ...data.flatMap((item) => [item.entries, item.exits]),
    0,
  );

  const axisMax = Math.max(80, Math.ceil(maxValue / 20) * 20);
  const axisValues = Array.from(
    { length: axisMax / 20 + 1 },
    (_, index) => axisMax - index * 20,
  );

  const renderPanel = (
    title: string,
    total: number,
    color: string,
    type: "entries" | "exits",
  ) => {
    const panelData = data.filter((item) => item[type] > 0);

    return (
      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <View style={styles.panelTitleContainer}>
            <View style={[styles.legendDot, { backgroundColor: color }]} />
            <Text style={styles.panelTitle}>{title}</Text>
          </View>

          <View style={styles.totalContainer}>
            <Text style={[styles.totalValue, { color }]}>
              {type === "entries" ? "+" : "-"}
              {total.toLocaleString("pt-BR")}
            </Text>
            <Text style={styles.totalCaption}>produtos</Text>
          </View>
        </View>

        <View style={styles.plotContainer}>
          <View style={styles.axisLabels}>
            {axisValues.map((value) => (
              <Text key={value} style={styles.axisLabel}>
                {value}
              </Text>
            ))}
          </View>

          <View style={styles.plot}>
            {axisValues.map((value, index) => (
              <View
                key={value}
                style={[
                  styles.gridLine,
                  {
                    top: (index / (axisValues.length - 1)) * 76,
                  },
                ]}
              />
            ))}

            <View style={styles.barsContainer}>
              {panelData.map((item) => {
                const value = item[type];
                const height = axisMax > 0
                  ? (value / axisMax) * 76
                  : 0;

                return (
                  <View key={item.date} style={styles.barColumn}>
                    <View style={styles.barArea}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: Math.max(height, 3),
                            backgroundColor: color,
                          },
                        ]}
                      />
                    </View>

                    <Text style={styles.dateLabel}>{item.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.heading}>
          <Ionicons
            name="swap-horizontal"
            size={20}
            color={GREEN}
          />

          <View style={styles.headingText}>
            <Text style={styles.title}>Movimentações</Text>
            <Text style={styles.subtitle}>
              Dos últimos {selectedPeriod} dias
            </Text>
          </View>
        </View>

        <MovementPeriodSelect
          selectedPeriod={selectedPeriod}
          menuOpen={menuOpen}
          onToggle={onToggleMenu}
          onSelect={onSelectPeriod}
        />
      </View>

      {loading ? (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="small" color={GREEN} />
          <Text style={styles.stateText}>
            Carregando movimentações...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.stateContainer}>
          <Text style={styles.stateTitle}>
            Não foi possível carregar
          </Text>
          <Text style={styles.stateText}>{error}</Text>
        </View>
      ) : data.length === 0 ? (
        <View style={styles.stateContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons
              name="analytics-outline"
              size={25}
              color={GREEN}
            />
          </View>

          <Text style={styles.stateTitle}>
            Nenhuma movimentação ainda
          </Text>

          <Text style={styles.stateText}>
            As entradas e saídas aparecerão aqui quando houver movimentações no estoque.
          </Text>
        </View>
      ) : (
        <View style={styles.panels}>
          {renderPanel("Entradas", totalEntries, GREEN, "entries")}
          {renderPanel("Saídas", totalExits, RED, "exits")}
        </View>
      )}
    </View>
  );
}
