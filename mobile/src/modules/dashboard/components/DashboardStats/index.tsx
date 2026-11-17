import { View } from "react-native";

import type { DashboardSummary } from "../../dashboard.types";
import { DashboardStatCard } from "../DashboardStatCard";
import { styles } from "./DashboardStats.styles";

type DashboardStatsProps = {
  summary: DashboardSummary;
};

export function DashboardStats({
  summary,
}: DashboardStatsProps) {
  return (
    <View style={styles.container}>
      <DashboardStatCard
        label="Produtos"
        value={summary.total_products}
        trend={summary.monthly_products}
        periodLabel="este mês"
        icon="cube-outline"
        accent="green"
      />

      <DashboardStatCard
        label="Estoque baixo"
        value={summary.low_stock_products}
        trend={summary.weekly_low_stock_products}
        periodLabel="esta semana"
        icon="warning-outline"
        accent="yellow"
      />

      <DashboardStatCard
        label="Sem estoque"
        value={summary.out_of_stock_products}
        trend={summary.weekly_out_of_stock_products}
        periodLabel="esta semana"
        icon="remove-circle-outline"
        accent="red"
      />

      <DashboardStatCard
        label="Movimentações"
        value={summary.total_movements}
        trend={summary.monthly_movements}
        periodLabel="este mês"
        icon="swap-horizontal-outline"
        accent="blue"
      />
    </View>
  );
}
