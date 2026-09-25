import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";

import { useAuth } from "../../src/auth/AuthContext";
import {
  getProducts,
} from "../../src/modules/products/productService";
import type {
  Product,
} from "../../src/modules/products/product.types";
import {
  createStockMovement,
} from "../../src/modules/stock-movements/stockMovementService";
import type {
  StockMovementType,
} from "../../src/modules/stock-movements/stockMovement.types";
import { colors } from "../../src/theme/colors";
import {
  radius,
  shadows,
  spacing,
} from "../../src/theme/spacing";

type MovementOption = {
  type: StockMovementType;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

export default function MovementCreateScreen() {
  const router = useRouter();
  const {
    accessToken,
    user,
  } = useAuth();

  const isAdmin = user?.role === "ADMIN";

  const movementOptions = useMemo<
    MovementOption[]
  >(
    () => [
      {
        type: "IN",
        title: "Entrada",
        description:
          "Adicionar unidades ao estoque.",
        icon: "arrow-down",
        color: colors.teal[600],
      },
      {
        type: "OUT",
        title: "Saída",
        description:
          "Remover unidades do estoque.",
        icon: "arrow-up",
        color: colors.coral[600],
      },
      ...(isAdmin
        ? [
            {
              type: "ADJUSTMENT" as const,
              title: "Ajuste",
              description:
                "Definir o estoque atual.",
              icon: "sync-outline" as const,
              color: colors.amber[600],
            },
          ]
        : []),
    ],
    [isAdmin],
  );

  const [
    movementType,
    setMovementType,
  ] = useState<StockMovementType>("IN");

  const [
    products,
    setProducts,
  ] = useState<Product[]>([]);

  const [
    selectedProduct,
    setSelectedProduct,
  ] = useState<Product | null>(null);

  const [
    productSearch,
    setProductSearch,
  ] = useState("");

  const [
    quantity,
    setQuantity,
  ] = useState("");

  const [
    reason,
    setReason,
  ] = useState("");

  const [
    notes,
    setNotes,
  ] = useState("");

  const [
    loadingProducts,
    setLoadingProducts,
  ] = useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [
    productError,
    setProductError,
  ] = useState<string | null>(null);

  const [
    quantityError,
    setQuantityError,
  ] = useState<string | null>(null);

  const loadProducts = useCallback(
    async (search = "") => {
      if (!accessToken) {
        return;
      }

      try {
        setLoadingProducts(true);

        const response = await getProducts(
          accessToken,
          {
            page: 1,
            pageSize: 100,
            search:
              search.trim().length > 0
                ? search.trim()
                : undefined,
            isActive: true,
          },
        );

        setProducts(response.items);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Não foi possível carregar os produtos.",
        );
      } finally {
        setLoadingProducts(false);
      }
    },
    [accessToken],
  );

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadProducts(productSearch);
    }, 350);

    return () => clearTimeout(timeout);
  }, [
    productSearch,
    loadProducts,
  ]);

  function handleMovementTypeChange(
    type: StockMovementType,
  ) {
    setMovementType(type);
    setQuantity("");
    setQuantityError(null);
  }

  function handleSelectProduct(
    product: Product,
  ) {
    setSelectedProduct(product);
    setProductSearch("");
    setProductError(null);
    setQuantityError(null);
  }

  function validate() {
    let valid = true;

    setError(null);
    setProductError(null);
    setQuantityError(null);

    if (!selectedProduct) {
      setProductError(
        "Selecione um produto.",
      );
      valid = false;
    }

    const numericQuantity =
      Number(
        quantity.replace(",", "."),
      );

    if (
      !quantity.trim() ||
      !Number.isFinite(numericQuantity) ||
      numericQuantity <= 0
    ) {
      setQuantityError(
        movementType === "ADJUSTMENT"
          ? "Informe um novo estoque maior ou igual a zero."
          : "Informe uma quantidade maior que zero.",
      );
      valid = false;
    }

    if (
      selectedProduct &&
      movementType === "OUT" &&
      Number.isFinite(numericQuantity)
    ) {
      const currentStock = Number(
        selectedProduct.current_stock,
      );

      if (
        numericQuantity > currentStock
      ) {
        setQuantityError(
          `Estoque disponível: ${currentStock}.`,
        );
        valid = false;
      }
    }

    return valid;
  }

  async function handleSubmit() {
    if (!accessToken || submitting) {
      return;
    }

    if (!validate()) {
      return;
    }

    if (!selectedProduct) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const normalizedQuantity =
        quantity
          .trim()
          .replace(",", ".");

      await createStockMovement(
        accessToken,
        {
          product_id:
            selectedProduct.id,
          movement_type: movementType,
          quantity:
            normalizedQuantity,
          reason:
            reason.trim() || undefined,
          notes:
            notes.trim() || undefined,
        },
      );

      router.replace(
        "/(tabs)/movements",
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível registrar a movimentação.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const displayedProducts =
    products;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.content
        }
      >
        <View style={styles.header}>
          <Pressable
            onPress={() =>
              router.back()
            }
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={colors.text.primary}
            />
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>
              ESTOQUE
            </Text>

            <Text style={styles.title}>
              Nova movimentação
            </Text>

            <Text style={styles.description}>
              Registre uma entrada, saída ou
              ajuste de estoque.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Tipo de movimentação
          </Text>

          <View style={styles.typeList}>
            {movementOptions.map(
              (option) => {
                const selected =
                  movementType ===
                  option.type;

                return (
                  <Pressable
                    key={option.type}
                    onPress={() =>
                      handleMovementTypeChange(
                        option.type,
                      )
                    }
                    style={[
                      styles.typeCard,
                      selected
                        ? {
                            borderColor:
                              option.color,
                            backgroundColor:
                              `${option.color}0A`,
                          }
                        : undefined,
                    ]}
                  >
                    <View
                      style={[
                        styles.typeIcon,
                        {
                          backgroundColor:
                            `${option.color}14`,
                        },
                      ]}
                    >
                      <Ionicons
                        name={option.icon}
                        size={20}
                        color={
                          option.color
                        }
                      />
                    </View>

                    <View
                      style={
                        styles.typeContent
                      }
                    >
                      <Text
                        style={
                          styles.typeTitle
                        }
                      >
                        {option.title}
                      </Text>

                      <Text
                        style={
                          styles.typeDescription
                        }
                      >
                        {
                          option.description
                        }
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.radio,
                        selected
                          ? {
                              borderColor:
                                option.color,
                            }
                          : undefined,
                      ]}
                    >
                      {selected ? (
                        <View
                          style={[
                            styles.radioSelected,
                            {
                              backgroundColor:
                                option.color,
                            },
                          ]}
                        />
                      ) : null}
                    </View>
                  </Pressable>
                );
              },
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Produto
          </Text>

          {selectedProduct ? (
            <View
              style={
                styles.selectedProduct
              }
            >
              <View
                style={
                  styles.selectedProductIcon
                }
              >
                <Ionicons
                  name="cube-outline"
                  size={21}
                  color={
                    colors.brand[600]
                  }
                />
              </View>

              <View
                style={
                  styles.selectedProductContent
                }
              >
                <Text
                  style={
                    styles.selectedProductName
                  }
                  numberOfLines={1}
                >
                  {selectedProduct.name}
                </Text>

                <Text
                  style={
                    styles.selectedProductSku
                  }
                >
                  {selectedProduct.sku}
                  {" • "}
                  Estoque atual:{" "}
                  {
                    selectedProduct.current_stock
                  }
                </Text>
              </View>

              <Pressable
                onPress={() => {
                  setSelectedProduct(
                    null,
                  );
                  setProductSearch("");
                }}
                hitSlop={8}
              >
                <Ionicons
                  name="close-circle"
                  size={22}
                  color={
                    colors.text.muted
                  }
                />
              </Pressable>
            </View>
          ) : (
            <>
              <View
                style={[
                  styles.searchContainer,
                  productError
                    ? styles.inputError
                    : undefined,
                ]}
              >
                <Ionicons
                  name="search-outline"
                  size={19}
                  color={
                    colors.text.muted
                  }
                />

                <TextInput
                  value={productSearch}
                  onChangeText={
                    setProductSearch
                  }
                  placeholder="Buscar produto por nome ou SKU"
                  placeholderTextColor={
                    colors.text.muted
                  }
                  style={
                    styles.searchInput
                  }
                  autoCapitalize="none"
                />
              </View>

              {loadingProducts ? (
                <View
                  style={
                    styles.productsLoading
                  }
                >
                  <ActivityIndicator
                    size="small"
                    color={
                      colors.brand[500]
                    }
                  />
                  <Text
                    style={
                      styles.loadingText
                    }
                  >
                    Carregando produtos...
                  </Text>
                </View>
              ) : displayedProducts.length >
                0 ? (
                <View
                  style={
                    styles.productList
                  }
                >
                  {displayedProducts
                    .slice(0, 8)
                    .map(
                      (product) => (
                        <Pressable
                          key={
                            product.id
                          }
                          onPress={() =>
                            handleSelectProduct(
                              product,
                            )
                          }
                          style={
                            styles.productOption
                          }
                        >
                          <View
                            style={
                              styles.productOptionIcon
                            }
                          >
                            <Ionicons
                              name="cube-outline"
                              size={18}
                              color={
                                colors.brand[500]
                              }
                            />
                          </View>

                          <View
                            style={
                              styles.productOptionContent
                            }
                          >
                            <Text
                              style={
                                styles.productOptionName
                              }
                              numberOfLines={
                                1
                              }
                            >
                              {
                                product.name
                              }
                            </Text>

                            <Text
                              style={
                                styles.productOptionMeta
                              }
                            >
                              {
                                product.sku
                              }
                              {" • "}
                              Estoque:{" "}
                              {
                                product.current_stock
                              }
                            </Text>
                          </View>

                          <Ionicons
                            name="chevron-forward"
                            size={17}
                            color={
                              colors.text.muted
                            }
                          />
                        </Pressable>
                      ),
                    )}
                </View>
              ) : (
                <View
                  style={
                    styles.noProducts
                  }
                >
                  <Text
                    style={
                      styles.noProductsText
                    }
                  >
                    Nenhum produto encontrado.
                  </Text>
                </View>
              )}
            </>
          )}

          {productError ? (
            <Text style={styles.fieldError}>
              {productError}
            </Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {movementType ===
            "ADJUSTMENT"
              ? "Novo estoque"
              : "Quantidade"}
          </Text>

          <View
            style={[
              styles.quantityContainer,
              quantityError
                ? styles.quantityContainerError
                : undefined,
            ]}
          >
            <TextInput
              value={quantity}
              onChangeText={(value) => {
                setQuantity(value);
                setQuantityError(null);
              }}
              placeholder={
                movementType ===
                "ADJUSTMENT"
                  ? "0"
                  : "0,000"
              }
              placeholderTextColor={
                colors.text.muted
              }
              keyboardType="decimal-pad"
              style={styles.quantityInput}
            />

            <Text style={styles.unitText}>
              {selectedProduct?.unit ??
                "UN"}
            </Text>
          </View>

          {quantityError ? (
            <Text
              style={styles.fieldError}
            >
              {quantityError}
            </Text>
          ) : null}

          {movementType ===
          "ADJUSTMENT" ? (
            <Text
              style={
                styles.helperText
              }
            >
              O ajuste define exatamente
              qual será o novo estoque do
              produto.
            </Text>
          ) : selectedProduct ? (
            <Text
              style={
                styles.helperText
              }
            >
              Estoque atual:{" "}
              {
                selectedProduct.current_stock
              }{" "}
              {selectedProduct.unit}
            </Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Informações adicionais
          </Text>

          <Text style={styles.inputLabel}>
            Motivo
          </Text>

          <TextInput
            value={reason}
            onChangeText={setReason}
            placeholder="Ex.: Reposição de fornecedor"
            placeholderTextColor={
              colors.text.muted
            }
            style={styles.textInput}
            maxLength={255}
          />

          <Text style={styles.inputLabel}>
            Observações
          </Text>

          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Adicione alguma observação..."
            placeholderTextColor={
              colors.text.muted
            }
            style={[
              styles.textInput,
              styles.notesInput,
            ]}
            multiline
            textAlignVertical="top"
            maxLength={500}
          />
        </View>

        {error ? (
          <View
            style={styles.errorCard}
          >
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={colors.danger}
            />

            <Text
              style={styles.errorCardText}
            >
              {error}
            </Text>
          </View>
        ) : null}

        <Pressable
          onPress={handleSubmit}
          disabled={submitting}
          style={({ pressed }) => [
            styles.submitButton,
            pressed &&
            !submitting
              ? styles.submitButtonPressed
              : undefined,
            submitting
              ? styles.submitButtonDisabled
              : undefined,
          ]}
        >
          {submitting ? (
            <ActivityIndicator
              color={
                colors.text.inverse
              }
            />
          ) : (
            <>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={
                  colors.text.inverse
                }
              />

              <Text
                style={
                  styles.submitButtonText
                }
              >
                Registrar movimentação
              </Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      colors.background.light,
  },

  content: {
    paddingHorizontal:
      spacing[5],
    paddingTop: spacing[5],
    paddingBottom: spacing[12],
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing[7],
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor:
      colors.surface.light,
    borderWidth: 1,
    borderColor:
      colors.border.light,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing[3],
  },

  headerText: {
    flex: 1,
  },

  eyebrow: {
    color: colors.teal[600],
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
  },

  title: {
    color: colors.text.primary,
    fontSize: 27,
    fontWeight: "800",
    marginTop: spacing[1],
  },

  description: {
    color: colors.text.secondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing[1],
  },

  section: {
    marginBottom: spacing[6],
  },

  sectionTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: spacing[3],
  },

  typeList: {
    gap: spacing[2],
  },

  typeCard: {
    backgroundColor:
      colors.surface.light,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor:
      colors.border.light,
    padding: spacing[4],
    flexDirection: "row",
    alignItems: "center",
  },

  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing[3],
  },

  typeContent: {
    flex: 1,
  },

  typeTitle: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: "700",
  },

  typeDescription: {
    color: colors.text.secondary,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 2,
  },

  radio: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor:
      colors.neutral[300],
    alignItems: "center",
    justifyContent: "center",
  },

  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
  },

  selectedProduct: {
    backgroundColor:
      colors.surface.light,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor:
      colors.brand[200],
    padding: spacing[4],
    flexDirection: "row",
    alignItems: "center",
    ...shadows.soft,
  },

  selectedProductIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor:
      colors.brand[50],
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing[3],
  },

  selectedProductContent: {
    flex: 1,
    paddingRight: spacing[2],
  },

  selectedProductName: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: "700",
  },

  selectedProductSku: {
    color: colors.text.secondary,
    fontSize: 11,
    marginTop: 3,
  },

  searchContainer: {
    minHeight: 52,
    backgroundColor:
      colors.surface.light,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor:
      colors.border.light,
    paddingHorizontal:
      spacing[4],
    flexDirection: "row",
    alignItems: "center",
  },

  inputError: {
    borderColor:
      colors.danger,
  },

  searchInput: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 13,
    marginLeft: spacing[2],
  },

  productsLoading: {
    minHeight: 72,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing[2],
  },

  loadingText: {
    color: colors.text.secondary,
    fontSize: 12,
  },

  productList: {
    marginTop: spacing[2],
    backgroundColor:
      colors.surface.light,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor:
      colors.border.light,
    overflow: "hidden",
  },

  productOption: {
    minHeight: 64,
    paddingHorizontal:
      spacing[3],
    paddingVertical: spacing[2],
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor:
      colors.border.light,
  },

  productOptionIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor:
      colors.brand[50],
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing[3],
  },

  productOptionContent: {
    flex: 1,
    paddingRight: spacing[2],
  },

  productOptionName: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: "700",
  },

  productOptionMeta: {
    color: colors.text.secondary,
    fontSize: 10,
    marginTop: 3,
  },

  noProducts: {
    paddingVertical: spacing[5],
    alignItems: "center",
  },

  noProductsText: {
    color: colors.text.muted,
    fontSize: 12,
  },

  fieldError: {
    color: colors.danger,
    fontSize: 11,
    marginTop: spacing[1],
  },

  quantityContainer: {
    height: 58,
    backgroundColor:
      colors.surface.light,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor:
      colors.border.light,
    paddingHorizontal:
      spacing[4],
    flexDirection: "row",
    alignItems: "center",
  },

  quantityContainerError: {
    borderColor:
      colors.danger,
  },

  quantityInput: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: "700",
  },

  unitText: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: "700",
  },

  helperText: {
    color: colors.text.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: spacing[1],
  },

  inputLabel: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: spacing[1],
  },

  textInput: {
    minHeight: 50,
    backgroundColor:
      colors.surface.light,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor:
      colors.border.light,
    paddingHorizontal:
      spacing[4],
    color: colors.text.primary,
    fontSize: 13,
    marginBottom: spacing[4],
  },

  notesInput: {
    minHeight: 110,
    paddingTop: spacing[3],
  },

  errorCard: {
    backgroundColor:
      colors.coral[50],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor:
      colors.coral[100],
    padding: spacing[3],
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing[2],
    marginBottom: spacing[4],
  },

  errorCardText: {
    flex: 1,
    color: colors.coral[700],
    fontSize: 12,
    lineHeight: 18,
  },

  submitButton: {
    minHeight: 54,
    borderRadius: radius.lg,
    backgroundColor:
      colors.brand[500],
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing[2],
    ...shadows.floating,
  },

  submitButtonPressed: {
    opacity: 0.85,
  },

  submitButtonDisabled: {
    opacity: 0.6,
  },

  submitButtonText: {
    color: colors.text.inverse,
    fontSize: 14,
    fontWeight: "800",
  },
});