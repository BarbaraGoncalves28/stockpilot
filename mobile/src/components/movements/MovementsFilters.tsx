import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, View } from "react-native";
import { styles } from "./MovementsFilters.styles";
import type { StockMovementType } from "../../modules/stock-movements/stockMovement.types";

export type MovementFilter = "ALL" | StockMovementType;

const filters: {
  key: MovementFilter;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}[] = [
  { key: "ALL", label: "Todos", icon: "grid-outline", color: "#00E599" },
  { key: "IN", label: "Entradas", icon: "arrow-up", color: "#00E599" },
  { key: "OUT", label: "Saídas", icon: "arrow-down", color: "#FF3366" },
  { key: "ADJUSTMENT", label: "Ajustes", icon: "swap-horizontal", color: "#9D4EDD" },
];

type Props = {
  selected: MovementFilter;
  onSelect: (filter: MovementFilter) => void;
  counts: Record<MovementFilter, number>;
};

export default function MovementsFilters({ selected, onSelect, counts }: Props) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {filters.map((filter) => {
          const active = selected === filter.key;
          return (
            <Pressable
              key={filter.key}
              onPress={() => onSelect(filter.key)}
              style={[
                styles.chip,
                active && styles.chipActive,
                active && { borderColor: filter.color },
                active && {
                  backgroundColor:
                    filter.key === "OUT"
                      ? "rgba(255,51,102,0.12)"
                      : filter.key === "ADJUSTMENT"
                        ? "rgba(157,78,221,0.14)"
                        : "rgba(0,229,153,0.10)",
                },
              ]}
            >
              <Ionicons
                name={filter.icon}
                size={21}
                color={filter.color}
              />
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {filter.label}
              </Text>
              <View
                style={[
                  styles.countBadge,
                  { backgroundColor: `${filter.color}22` },
                ]}
              >
                <Text style={[styles.countText, { color: filter.color }]}>
                  {counts[filter.key]}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
