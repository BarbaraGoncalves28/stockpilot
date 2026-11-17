import React from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useProductDetails } from "../../../../src/modules/products/hooks/useProductDetails";
import {
  ProductDetailsHeader, ProductHero, ProductStockCard, ProductIntelligenceCard,
  ProductValuesCard, ProductInformationCard, ProductDescriptionCard,
  ProductMovementsCard, ProductDetailsActions,
} from "../../../../src/components/products/details/ProductDetailsComponents";
import { palette, styles } from "../../../../src/components/products/details/ProductDetails.styles";

export default function ProductDetailsScreen() {
  const {
    accessToken, user, product, movements, intelligence, categoryName, supplierName,
    loading, error, actionLoading, loadProduct, handleDeactivate, executeRestore,
  } = useProductDetails();

  if (!accessToken || !user || loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={palette.green} />
        <Text style={styles.loadingText}>Carregando produto...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.centered}>
        <View style={styles.errorIcon}><Text style={styles.errorIconText}>!</Text></View>
        <Text style={styles.errorTitle}>Produto indisponível</Text>
        <Text style={styles.errorDescription}>{error || "Não foi possível encontrar este produto."}</Text>
        <TouchableOpacity activeOpacity={0.85} onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Voltar para produtos</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => void loadProduct()} style={{ marginTop: 16 }}>
          <Text style={styles.link}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isAdmin = user.role === "ADMIN";

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <ProductDetailsHeader onBack={() => router.back()} />
        <ProductHero product={product} />
        <ProductStockCard product={product} />
        {intelligence && (
          <ProductIntelligenceCard
            item={intelligence}
            onDetails={() => router.push(`/(tabs)/more/intelligence/${product.id}`)}
          />
        )}
        <ProductValuesCard product={product} />
        <ProductInformationCard product={product} categoryName={categoryName} supplierName={supplierName} />
        {!!product.description?.trim() && <ProductDescriptionCard description={product.description} />}
        <ProductMovementsCard movements={movements} />
        {isAdmin && (
          <ProductDetailsActions
            product={product}
            loading={actionLoading}
            onEdit={() => router.push(`/(tabs)/products/${product.id}/edit`)}
            onDeactivate={handleDeactivate}
            onRestore={() => void executeRestore()}
          />
        )}
      </ScrollView>
    </View>
  );
}
