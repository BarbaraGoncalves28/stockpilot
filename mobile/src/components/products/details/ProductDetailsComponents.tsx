import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { Product } from "../../../modules/products/product.types";
import type { StockMovement } from "../../../modules/stock-movements/stockMovement.types";
import type { StockIntelligenceItem } from "../../../modules/stock-intelligence/stockIntelligence.types";
import { palette, styles } from "./ProductDetails.styles";
import { heroStyles } from "./ProductHero/ProductHero.styles";
import { intelligenceStyles } from "./ProductIntelligenceCard/ProductIntelligenceCard.styles";
import { valuesStyles } from "./ProductValuesCard/ProductValuesCard.styles";
import { informationStyles } from "./ProductInformationCard/ProductInformationCard.styles";
import { descriptionStyles } from "./ProductDescriptionCard/ProductDescriptionCard.styles";
import { movementsStyles } from "./ProductMovementsCard/ProductMovementsCard.styles";
import { stockCardStyles } from "./ProductStockCard/ProductStockCard.styles";

function formatNumber(value: string | null) {
  if (value === null) return "—";
  return Number(value).toLocaleString("pt-BR", { maximumFractionDigits: 3 });
}

function formatCurrency(value: string) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR");
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function stockStatus(product: Product) {
  const stock = Number(product.current_stock);

  if (stock <= 0) {
    return {
      label: "Sem estoque",
      color: palette.red,
      background: "rgba(255,51,102,0.12)",
      icon: "close-circle" as const,
    };
  }

  if (stock <= Number(product.min_stock)) {
    return {
      label: "Estoque baixo",
      color: palette.yellow,
      background: "rgba(255,184,0,0.12)",
      icon: "alert-circle" as const,
    };
  }

  return {
    label: "Em estoque",
    color: palette.green,
    background: "rgba(0,229,153,0.12)",
    icon: "checkmark-circle" as const,
  };
}

function riskStatus(level: StockIntelligenceItem["risk_level"]) {
  const map = {
    OUT_OF_STOCK: ["Sem estoque", palette.red],
    CRITICAL: ["Crítico", palette.red],
    HIGH: ["Alto risco", palette.red],
    MEDIUM: ["Atenção", palette.yellow],
    LOW: ["Baixo risco", palette.green],
    NO_DATA: ["Sem dados", palette.secondary],
  } as const;
  return map[level] ?? map.NO_DATA;
}

function SectionTitle({ icon, title }: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
}) {
  const iconColor = title === "Descrição" ? palette.text : palette.green;

  return (
    <View style={styles.sectionTitleContainer}>
      <Ionicons name={icon} size={29} color={iconColor} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

export function ProductDetailsHeader({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.topBar}>
      <TouchableOpacity onPress={onBack} activeOpacity={0.7} style={styles.backIcon}>
        <Ionicons name="arrow-back" size={25} color={palette.text} />
      </TouchableOpacity>
    </View>
  );
}

export function ProductHero({ product }: { product: Product }) {
  const status = stockStatus(product);
  return (
    <View style={heroStyles.hero}>
      <Text style={heroStyles.productName}>{product.name}</Text>
      <Text style={heroStyles.sku}>SKU: {product.sku}</Text>
      <View
        style={[
          heroStyles.badge,
          {
            backgroundColor: status.background,
            borderColor: status.color,
          },
        ]}
      >
        <Ionicons name={status.icon} size={19} color={status.color} />
        <Text style={[heroStyles.badgeText, { color: status.color }]}>{status.label}</Text>
      </View>
    </View>
  );
}

export function ProductStockCard({ product }: { product: Product }) {
  return (
    <View style={stockCardStyles.container}>
      <SectionTitle icon="cube-outline" title="Estoque atual" />

      <View style={stockCardStyles.stockOverview}>
        <View style={stockCardStyles.stockCurrent}>
          <View style={stockCardStyles.stockMain}>
            <Text style={stockCardStyles.metricValue}>
              {formatNumber(product.current_stock)} {product.unit}
            </Text>
          </View>
        </View>

        <View style={stockCardStyles.stockLimit}>
          <View style={stockCardStyles.stockDivider} />
          <Text style={stockCardStyles.metricLabel}>Mínimo</Text>
          <Text style={stockCardStyles.metricValue}>
            {formatNumber(product.min_stock)} {product.unit}
          </Text>
        </View>

        <View style={stockCardStyles.stockLimit}>
          <View style={stockCardStyles.stockDivider} />
          <Text style={stockCardStyles.metricLabel}>Máximo</Text>
          <Text style={stockCardStyles.metricValue}>
            {formatNumber(product.max_stock)} {product.unit}
          </Text>
        </View>
      </View>
    </View>
  );
}
export function ProductIntelligenceCard({ item, onDetails }: { item: StockIntelligenceItem; onDetails: () => void }) {
  const [label, color] = riskStatus(item.risk_level);

  return (
    <View style={intelligenceStyles.container}>
      <View style={intelligenceStyles.header}>
        <SectionTitle icon="sparkles-outline" title="Inteligência de estoque" />
        <TouchableOpacity onPress={onDetails}>
          <Text style={intelligenceStyles.link}>Ver detalhes</Text>
        </TouchableOpacity>
      </View>

      <View style={[intelligenceStyles.riskBadge, { backgroundColor: `${color}20` }]}>
        <Text style={[intelligenceStyles.riskText, { color }]}>{label}</Text>
      </View>

      <View style={intelligenceStyles.columns}>
        <View style={intelligenceStyles.metric}>
          <Text style={intelligenceStyles.metricLabel}>Consumo médio/dia</Text>
          <Text style={intelligenceStyles.metricValue}>{formatNumber(item.average_daily_consumption)}</Text>
        </View>

        <View style={intelligenceStyles.metric}>
          <Text style={intelligenceStyles.metricLabel}>Dias até estoque mínimo</Text>
          <Text style={intelligenceStyles.metricValue}>
            {item.estimated_days_until_min_stock === null ? "—" : formatNumber(item.estimated_days_until_min_stock)}
          </Text>
        </View>
      </View>
    </View>
  );
}
export function ProductValuesCard({ product }: { product: Product }) {
  return (
    <View style={valuesStyles.container}>
      <SectionTitle icon="cash-outline" title="Valores" />
      <DetailRow label="Preço de custo" value={formatCurrency(product.cost_price)} rowStyles={valuesStyles} />
      <View style={valuesStyles.separator} />
      <DetailRow label="Preço de venda" value={formatCurrency(product.sale_price)} rowStyles={valuesStyles} />
      <View style={valuesStyles.separator} />
      <DetailRow label="Unidade" value={product.unit} rowStyles={valuesStyles} />
    </View>
  );
}
export function ProductInformationCard({ product, categoryName, supplierName }: { product: Product; categoryName: string; supplierName: string }) {
  return (
    <View style={informationStyles.container}>
      <SectionTitle icon="information-circle-outline" title="Informações" />
      <DetailRow label="Categoria" value={categoryName || "—"} rowStyles={informationStyles} />
      <View style={informationStyles.separator} />
      <DetailRow label="Fornecedor" value={supplierName || "—"} rowStyles={informationStyles} />
      <View style={informationStyles.separator} />
      <DetailRow label="Status" value={product.is_active ? "Ativo" : "Inativo"} rowStyles={informationStyles} />
    </View>
  );
}
export function ProductDescriptionCard({ description }: { description: string }) {
  return (
    <View style={descriptionStyles.container}>
      <SectionTitle icon="document-text-outline" title="Descrição" />
      <Text style={descriptionStyles.description}>{description}</Text>
    </View>
  );
}
function DetailRow({ label, value, rowStyles }: {
  label: string;
  value: string;
  rowStyles: Pick<typeof valuesStyles, "row" | "rowLabel" | "rowValue">;
}) {
  return (
    <View style={rowStyles.row}>
      <Text style={rowStyles.rowLabel}>{label}</Text>
      <Text style={rowStyles.rowValue}>{value}</Text>
    </View>
  );
}
export function ProductMovementsCard({ movements }: { movements: StockMovement[] }) {
  return (
    <View style={movementsStyles.container}>
      <View style={movementsStyles.header}>
        <SectionTitle icon="swap-horizontal-outline" title="Movimentações recentes" />
        <TouchableOpacity onPress={() => router.push("/(tabs)/movements")}>
          <Text style={movementsStyles.link}>Ver todas</Text>
        </TouchableOpacity>
      </View>
      {movements.length === 0 ? (
        <Text style={movementsStyles.emptyText}>Nenhuma movimentação encontrada.</Text>
      ) : movements.map((movement, index) => {
        const isIn = movement.movement_type === "IN";
        const isOut = movement.movement_type === "OUT";
        const color = isIn ? palette.green : isOut ? palette.red : palette.blue;
        const title = isIn ? "Entrada" : isOut ? "Saída" : "Ajuste";
        const symbol = isIn ? "+" : isOut ? "−" : "↔";

        return (
          <React.Fragment key={movement.id}>
            {index > 0 && <View style={movementsStyles.separator} />}
            <View style={movementsStyles.movement}>
              <View style={[movementsStyles.movementIcon, { backgroundColor: `${color}18` }]}>
                <Text style={[movementsStyles.movementSymbol, { color }]}>{symbol}</Text>
              </View>
              <View style={movementsStyles.movementInfo}>
                <Text style={movementsStyles.movementTitle}>{title}</Text>
                <Text style={movementsStyles.movementDate}>{formatDateTime(movement.created_at)}</Text>
              </View>
              <View>
                <Text style={[movementsStyles.movementAmount, { color }]}>
                  {symbol} {formatNumber(movement.quantity)}
                </Text>
                <Text style={movementsStyles.movementDate}>
                  Saldo: {formatNumber(movement.new_stock)}
                </Text>
              </View>
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
}
export function ProductDetailsActions({ product, loading, onEdit, onDeactivate, onRestore }: {
  product: Product; loading: boolean; onEdit: () => void; onDeactivate: () => void; onRestore: () => void;
}) {
  return (
    <View style={{ gap: 10 }}>
      <TouchableOpacity disabled={loading} activeOpacity={0.85} onPress={onEdit} style={[styles.actionButton, styles.editButton, loading && { opacity: 0.5 }]}>
        <Text style={[styles.actionText, styles.editText]}>Editar produto</Text>
      </TouchableOpacity>
      {product.is_active ? (
        <TouchableOpacity disabled={loading} activeOpacity={0.85} onPress={onDeactivate} style={[styles.actionButton, styles.deactivateButton, loading && { opacity: 0.5 }]}>
          <Text style={[styles.actionText, styles.dangerText]}>{loading ? "Aguarde..." : "Desativar produto"}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity disabled={loading} activeOpacity={0.85} onPress={onRestore} style={[styles.actionButton, styles.restoreButton, loading && { opacity: 0.5 }]}>
          <Text style={[styles.actionText, styles.restoreText]}>{loading ? "Aguarde..." : "Restaurar produto"}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}







