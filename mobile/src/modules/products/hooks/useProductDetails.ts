import { useCallback, useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../../auth/AuthContext";
import { deleteProduct, getProduct, restoreProduct } from "../productService";
import type { Product } from "../product.types";
import { getProductMovements } from "../../stock-movements/stockMovementService";
import type { StockMovement } from "../../stock-movements/stockMovement.types";
import { getProductStockIntelligence } from "../../stock-intelligence/stockIntelligenceService";
import type { StockIntelligenceItem } from "../../stock-intelligence/stockIntelligence.types";
import { getCategory } from "../../categories/categoryService";
import { getSupplier } from "../../suppliers/supplierService";

export function useProductDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { accessToken, user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [intelligence, setIntelligence] = useState<StockIntelligenceItem | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const loadProduct = useCallback(async () => {
    if (!accessToken) {
      router.replace("/");
      return;
    }
    if (!id || !Number.isFinite(Number(id))) {
      setError("Produto não identificado.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const productId = Number(id);
      const [loadedProduct, loadedMovements, loadedIntelligence] = await Promise.all([
        getProduct(accessToken, productId),
        getProductMovements(accessToken, productId),
        getProductStockIntelligence(accessToken, productId, 30),
      ]);

      setProduct(loadedProduct);
      setMovements(loadedMovements.slice(0, 5));
      setIntelligence(loadedIntelligence);
      setCategoryName("");
      setSupplierName("");

      const [categoryResult, supplierResult] = await Promise.allSettled([
        getCategory(accessToken, loadedProduct.category_id),
        loadedProduct.supplier_id !== null
          ? getSupplier(accessToken, loadedProduct.supplier_id)
          : Promise.resolve(null),
      ]);

      if (categoryResult.status === "fulfilled") {
        setCategoryName(categoryResult.value.name);
      }
      if (supplierResult.status === "fulfilled" && supplierResult.value) {
        setSupplierName(supplierResult.value.name);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar o produto.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, id]);

  useEffect(() => {
    void loadProduct();
  }, [loadProduct]);

  const executeDeactivate = async () => {
    if (!accessToken || !product || actionLoading) return;

    try {
      setActionLoading(true);
      await deleteProduct(accessToken, product.id);

      if (Platform.OS === "web") {
        window.alert("Produto desativado com sucesso.");
        router.replace("/(tabs)/products");
      } else {
        Alert.alert("Produto desativado", "O produto foi desativado com sucesso.", [
          { text: "OK", onPress: () => router.replace("/(tabs)/products") },
        ]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível desativar o produto.";
      if (Platform.OS === "web") {
        window.alert(`Não foi possível desativar o produto.\n\n${message}`);
      } else {
        Alert.alert("Não foi possível desativar o produto", message);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const executeRestore = async () => {
    if (!accessToken || !product || actionLoading) return;

    try {
      setActionLoading(true);
      setError("");
      await restoreProduct(accessToken, product.id);
      await loadProduct();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível restaurar o produto.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivate = () => {
    if (!accessToken || !product || actionLoading) return;

    const message =
      `Tem certeza de que deseja desativar o produto "${product.name}"? ` +
      "O registro e o histórico de movimentações serão preservados.";

    if (Platform.OS === "web") {
      if (window.confirm(message)) void executeDeactivate();
      return;
    }

    Alert.alert("Desativar produto", message, [
      { text: "Cancelar", style: "cancel" },
      { text: "Desativar", style: "destructive", onPress: () => void executeDeactivate() },
    ]);
  };

  return {
    accessToken, user, product, movements, intelligence, categoryName, supplierName,
    loading, error, actionLoading, loadProduct, handleDeactivate, executeRestore,
  };
}
