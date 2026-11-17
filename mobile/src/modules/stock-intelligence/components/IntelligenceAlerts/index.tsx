import {
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import type { StockAlertItem } from "../../stockIntelligence.types";

import { formatLastMovement } from "../../utils/formatLastMovement";
import {
  getRiskLabel,
  getVisibleAlerts,
} from "../../utils/stockIntelligence.utils";
import { styles } from "./IntelligenceAlerts.styles";

type IntelligenceAlertsProps = {
  alerts: StockAlertItem[];
  onViewAll: () => void;
  onSelectAlert: (productId: number) => void;
};

export function IntelligenceAlerts({
  alerts,
  onViewAll,
  onSelectAlert,
}: IntelligenceAlertsProps) {
  const visibleAlerts = getVisibleAlerts(alerts);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons
            name="bulb-outline"
            size={22}
            color="#00E599"
          />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.title}>Alertas inteligentes</Text>
          <Text style={styles.description}>
            Fique por dentro do que realmente importa.
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onViewAll}
          style={styles.viewAll}
        >
          <Text style={styles.viewAllText}>Ver todos </Text>
          <Ionicons
            name="arrow-forward"
            size={15}
            color="#00E599"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.alertList}>
        {visibleAlerts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Nenhum alerta de estoque no momento.
            </Text>
          </View>
        ) : (
          visibleAlerts.map((alert) => {
            const lastMovement = formatLastMovement(
              alert.last_movement_at,
            );

            const riskStyle =
              alert.risk_level === "OUT_OF_STOCK"
                ? styles.riskOutOfStock
                : alert.risk_level === "CRITICAL"
                  ? styles.riskCritical
                  : alert.risk_level === "HIGH"
                    ? styles.riskHigh
                    : alert.risk_level === "MEDIUM"
                      ? styles.riskMedium
                      : alert.risk_level === "LOW"
                        ? styles.riskLow
                        : styles.riskDefault;

            return (
              <TouchableOpacity
                key={alert.product_id}
                activeOpacity={0.8}
                onPress={() => onSelectAlert(alert.product_id)}
                style={styles.alertCard}
              >
                <View style={styles.alertContent}>
                  <View style={styles.alertTitleRow}>
                    <Text
                      numberOfLines={1}
                      style={styles.productName}
                    >
                      {alert.product_name}
                    </Text>

                    <View style={[styles.riskBadge, riskStyle]}>
                      <Text style={styles.riskBadgeText}>
                        {getRiskLabel(alert.risk_level)}
                      </Text>
                    </View>
                  </View>

                  <Text
                    numberOfLines={1}
                    style={styles.productSku}
                  >
                    {alert.sku}
                  </Text>

                  <Text
                    numberOfLines={2}
                    style={styles.message}
                  >
                    {alert.message}
                  </Text>
                </View>

                <View style={styles.movementContainer}>
                  {lastMovement ? (
                    <View style={styles.movementRow}>
                      <Ionicons
                        name="time-outline"
                        size={13}
                        color="#8FA5BB"
                      />
                      <Text style={styles.movementText}>
                        {lastMovement}
                      </Text>
                    </View>
                  ) : null}

                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="#8FA5BB"
                  />
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </View>
  );
}
