import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import type { StockMovement, StockMovementType } from "../../modules/stock-movements/stockMovement.types";
import { styles } from "./MovementCard.styles";

function formatQuantity(value: string) {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 3,
  }).format(Number(value));
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: "--", time: "--:--" };

  return {
    date: new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date),
    time: new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date),
  };
}

const config: Record<StockMovementType, {
  label: string;
  color: string;
  background: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = {
  IN: {
    label: "Entrada",
    color: "#00E599",
    background: "rgba(0,229,153,0.16)",
    icon: "arrow-up",
  },
  OUT: {
    label: "Saída",
    color: "#FF3366",
    background: "rgba(255,51,102,0.16)",
    icon: "arrow-down",
  },
  ADJUSTMENT: {
    label: "Ajuste",
    color: "#9D4EDD",
    background: "rgba(157,78,221,0.18)",
    icon: "swap-horizontal",
  },
};

export default function MovementCard({ movement }: { movement: StockMovement }) {
  const item = config[movement.movement_type];
  const adjustment = movement.movement_type === "ADJUSTMENT";
  const date = formatDate(movement.created_at);

  return (
    <View style={styles.card}>
      <View style={[styles.accent, { backgroundColor: item.color }]} />

      <View style={styles.content}>
        <View style={styles.mainRow}>
          <View style={[styles.iconCircle, { backgroundColor: item.background }]}>
            <Ionicons name={item.icon} size={29} color={item.color} />
          </View>

          <View style={styles.productColumn}>
            <View style={[styles.typeBadge, { backgroundColor: item.background }]}>
              <Text style={[styles.typeText, { color: item.color }]}>
                {item.label}
              </Text>
            </View>

            <Text style={styles.productName} numberOfLines={1}>
              {movement.product_name}
            </Text>
            <Text style={styles.sku}>{movement.product_sku}</Text>

            <View style={styles.stockLine}>
              <Ionicons name="cube-outline" size={17} color="#8BBAF0" />
              <Text style={styles.stockText}>
                Estoque: {formatQuantity(movement.new_stock)}
              </Text>
            </View>
          </View>

          <View style={[styles.quantityBox, { backgroundColor: item.background, borderColor: `${item.color}44` }]}>
            {adjustment ? (
              <>
                <Text style={[styles.adjustmentLabel, { color: item.color }]}>
                  Novo saldo: <Text style={styles.quantity}>{formatQuantity(movement.new_stock)}</Text>
                </Text>
                <Text style={styles.previousStock}>
                  (Anterior: {formatQuantity(movement.previous_stock)})
                </Text>
              </>
            ) : (
              <>
                <Text style={[styles.quantity, { color: item.color }]}>
                  {movement.movement_type === "IN" ? "+" : "−"}
                  {formatQuantity(movement.quantity)}
                </Text>
                <Text style={[styles.units, { color: item.color }]}>
                  {Number(movement.quantity) === 1 ? "Unidade" : "Unidades"}
                </Text>
              </>
            )}
          </View>

          <Ionicons name="chevron-forward" size={21} color="#8B9BB4" />
        </View>

        <View style={styles.footer}>
          <View style={styles.reasonGroup}>
            <Ionicons name="document-text-outline" size={18} color="#8BBAF0" />
            <Text style={styles.reason} numberOfLines={1}>
              {movement.reason || movement.notes || "Sem motivo informado"}
            </Text>
          </View>

          <View style={styles.dateGroup}>
            <Ionicons name="calendar-outline" size={18} color="#8BBAF0" />
            <Text style={styles.dateText}>{date.date}</Text>
            <Text style={styles.dateSeparator}>•</Text>
            <Text style={styles.dateText}>{date.time}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
