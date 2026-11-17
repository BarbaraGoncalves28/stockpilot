import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "./ProductsFilters.styles";

export type StockFilter = "ALL" | "IN_STOCK" | "OUT_OF_STOCK";

type Props = {
  value: StockFilter;
  onChange: (value: StockFilter) => void;
  categoryName: string;
  onCategoryPress: () => void;
};

export function ProductsFilters({ value, onChange, categoryName, onCategoryPress }: Props) {
  const options: { label: string; value: StockFilter; icon: keyof typeof Ionicons.glyphMap }[] = [
    { label: "Todos", value: "ALL", icon: "grid-outline" },
    { label: "Em estoque", value: "IN_STOCK", icon: "checkmark-circle-outline" },
    { label: "Sem estoque", value: "OUT_OF_STOCK", icon: "warning-outline" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {options.map((option) => {
          const active = value === option.value;
          return (
            <TouchableOpacity key={option.value} onPress={() => onChange(option.value)} style={[styles.chip, active && (option.value === "OUT_OF_STOCK" ? styles.dangerActiveChip : styles.activeChip)]}>
              <Ionicons name={option.icon} size={17} color={active ? (option.value === "OUT_OF_STOCK" ? "#FF3366" : "#00E599") : "#D7E6FA"} />
              <Text style={[styles.label, active && styles.activeLabel]}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <TouchableOpacity onPress={onCategoryPress} style={styles.category}>
        <Text numberOfLines={1} style={styles.label}>{categoryName || "Categorias"}</Text>
        <Ionicons name="chevron-down" size={17} color="#D7E6FA" />
      </TouchableOpacity>
    </View>
  );
}
