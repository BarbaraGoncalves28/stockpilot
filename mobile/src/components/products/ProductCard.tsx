import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import type { Product } from "../../modules/products/product.types";
import { styles } from "./ProductCard.styles";

type Props = {
  product: Product;
  onPress: () => void;
};

export function ProductCard({ product, onPress }: Props) {
  const stock = Number(product.current_stock);
  const min = Number(product.min_stock);
  const out = stock <= 0;
  const low = !out && stock <= min;
  const color = out ? "#FF3366" : low ? "#FFB800" : "#00E599";
  const label = out ? "Sem estoque" : low ? "Estoque baixo" : "Em estoque";

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[styles.card, { borderLeftColor: color }]}>
      <View style={styles.info}>
        <Text numberOfLines={1} style={styles.name}>{product.name}</Text>
        <Text style={styles.sku}>{product.sku}</Text>
        <View style={styles.meta}>
          <Ionicons name="cube-outline" size={17} color="#A9C9F5" />
          <Text style={styles.quantity}>
            {stock.toLocaleString("pt-BR", { maximumFractionDigits: 3 })} {product.unit}
          </Text>
        </View>
      </View>

      <View style={styles.right}>
        <Text style={styles.price}>
          {Number(product.sale_price).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </Text>
        <View style={[styles.badge, { borderColor: color, backgroundColor: out ? "rgba(255,51,102,0.10)" : low ? "rgba(255,184,0,0.10)" : "rgba(0,229,153,0.10)" }]}>
          <Ionicons name={out ? "alert-circle" : "checkmark-circle"} size={17} color={color} />
          <Text style={[styles.badgeText, { color }]}>{label}</Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#A9C9F5" />
    </TouchableOpacity>
  );
}
