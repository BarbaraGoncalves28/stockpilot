import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type TextInputProps,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useAuth } from "../../../../src/auth/AuthContext";
import {
  getProduct,
  updateProduct,
} from "../../../../src/modules/products/productService";
import type { Product } from "../../../../src/modules/products/product.types";
import { colors } from "../../../../src/theme/colors";
import {
  radius,
  shadows,
  spacing,
} from "../../../../src/theme/spacing";

function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  multiline = false,
  autoCapitalize = "sentences",
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "decimal-pad";
  multiline?: boolean;
  autoCapitalize?: TextInputProps["autoCapitalize"];
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.muted}
        keyboardType={keyboardType}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
        textAlignVertical={
          multiline ? "top" : "center"
        }
        style={[
          styles.input,
          multiline && styles.textArea,
        ]}
      />
    </View>
  );
}

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const {
    accessToken,
    user,
  } = useAuth();

  const [product, setProduct] =
    useState<Product | null>(null);

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] =
    useState("");
  const [categoryId, setCategoryId] =
    useState("");
  const [supplierId, setSupplierId] =
    useState("");
  const [costPrice, setCostPrice] =
    useState("");
  const [salePrice, setSalePrice] =
    useState("");
  const [minStock, setMinStock] =
    useState("");
  const [maxStock, setMaxStock] =
    useState("");
  const [unit, setUnit] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadProduct = useCallback(
    async () => {
      if (!accessToken) {
        router.replace("/");
        return;
      }

      if (user?.role !== "ADMIN") {
        router.replace("/(tabs)/products");
        return;
      }

      if (!id) {
        setError(
          "Produto não identificado.",
        );
        setLoading(false);
        return;
      }

      try {
        setError("");
        setLoading(true);

        const response = await getProduct(
          accessToken,
          Number(id),
        );

        setProduct(response);

        setName(response.name);
        setSku(response.sku);
        setDescription(
          response.description ?? "",
        );
        setCategoryId(
          String(response.category_id),
        );
        setSupplierId(
          response.supplier_id !== null
            ? String(response.supplier_id)
            : "",
        );
        setCostPrice(
          response.cost_price,
        );
        setSalePrice(
          response.sale_price,
        );
        setMinStock(
          response.min_stock,
        );
        setMaxStock(
          response.max_stock ?? "",
        );
        setUnit(response.unit);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar o produto.",
        );
      } finally {
        setLoading(false);
      }
    },
    [accessToken, id, user?.role],
  );

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  async function handleSave() {
    if (!accessToken || !product) {
      return;
    }

    const trimmedName =
      name.trim();

    const trimmedSku =
      sku.trim();

    const trimmedCategoryId =
      categoryId.trim();

    const trimmedCostPrice =
      costPrice.trim();

    const trimmedSalePrice =
      salePrice.trim();

    const trimmedMinStock =
      minStock.trim();

    const trimmedUnit =
      unit.trim();

    if (!trimmedName) {
      setError(
        "Informe o nome do produto.",
      );
      return;
    }

    if (!trimmedSku) {
      setError(
        "Informe o SKU do produto.",
      );
      return;
    }

    if (!trimmedCategoryId) {
      setError(
        "Informe a categoria do produto.",
      );
      return;
    }

    if (!trimmedCostPrice) {
      setError(
        "Informe o preço de custo.",
      );
      return;
    }

    if (!trimmedSalePrice) {
      setError(
        "Informe o preço de venda.",
      );
      return;
    }

    if (!trimmedMinStock) {
      setError(
        "Informe o estoque mínimo.",
      );
      return;
    }

    if (!trimmedUnit) {
      setError(
        "Informe a unidade.",
      );
      return;
    }

    const parsedCategoryId =
      Number(trimmedCategoryId);

    if (
      !Number.isInteger(
        parsedCategoryId,
      ) ||
      parsedCategoryId <= 0
    ) {
      setError(
        "A categoria precisa ser um ID válido.",
      );
      return;
    }

    if (
      supplierId.trim() &&
      (!Number.isInteger(
        Number(supplierId.trim()),
      ) ||
        Number(supplierId.trim()) <= 0)
    ) {
      setError(
        "O fornecedor precisa ser um ID válido.",
      );
      return;
    }

    if (
      Number.isNaN(
        Number(
          trimmedCostPrice.replace(
            ",",
            ".",
          ),
        ),
      )
    ) {
      setError(
        "O preço de custo precisa ser válido.",
      );
      return;
    }

    if (
      Number.isNaN(
        Number(
          trimmedSalePrice.replace(
            ",",
            ".",
          ),
        ),
      )
    ) {
      setError(
        "O preço de venda precisa ser válido.",
      );
      return;
    }

    if (
      Number.isNaN(
        Number(
          trimmedMinStock.replace(
            ",",
            ".",
          ),
        ),
      )
    ) {
      setError(
        "O estoque mínimo precisa ser válido.",
      );
      return;
    }

    if (
      maxStock.trim() &&
      Number.isNaN(
        Number(
          maxStock
            .trim()
            .replace(",", "."),
        ),
      )
    ) {
      setError(
        "O estoque máximo precisa ser válido.",
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      await updateProduct(
        accessToken,
        product.id,
        {
          name: trimmedName,
          sku: trimmedSku,
          description:
            description.trim() || null,
          category_id:
            parsedCategoryId,
          supplier_id:
            supplierId.trim()
              ? Number(
                  supplierId.trim(),
                )
              : null,
          cost_price:
            trimmedCostPrice.replace(
              ",",
              ".",
            ),
          sale_price:
            trimmedSalePrice.replace(
              ",",
              ".",
            ),
          min_stock:
            trimmedMinStock.replace(
              ",",
              ".",
            ),
          max_stock:
            maxStock.trim()
              ? maxStock
                  .trim()
                  .replace(",", ".")
              : null,
          unit: trimmedUnit,
        },
      );

      router.replace(
        `/products/${product.id}`,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível salvar as alterações.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (!accessToken || !user) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator
          size="large"
          color={colors.brand[500]}
        />
      </View>
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>
          Acesso restrito
        </Text>

        <Text style={styles.errorDescription}>
          Apenas administradores podem editar
          produtos.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator
          size="large"
          color={colors.brand[500]}
        />

        <Text style={styles.loadingText}>
          Carregando produto...
        </Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>
          Produto indisponível
        </Text>

        <Text style={styles.errorDescription}>
          {error ||
            "Não foi possível encontrar este produto."}
        </Text>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>
            Voltar
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.keyboard}
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
          <View style={styles.topBar}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.back()}
              style={styles.backIcon}
            >
              <Text style={styles.backIconText}>
                ‹
              </Text>
            </TouchableOpacity>

            <Text style={styles.topBarTitle}>
              Editar produto
            </Text>

            <View
              style={styles.topBarSpacer}
            />
          </View>

          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Text style={styles.headerIconText}>
                {product.name
                  .trim()
                  .slice(0, 1)
                  .toUpperCase()}
              </Text>
            </View>

            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>
                Atualizar produto
              </Text>

              <Text style={styles.headerDescription}>
                Altere os dados cadastrais
                deste produto.
              </Text>
            </View>
          </View>

          {error ? (
            <View style={styles.errorBanner}>
              <View
                style={styles.errorBannerIcon}
              >
                <Text
                  style={
                    styles.errorBannerIconText
                  }
                >
                  !
                </Text>
              </View>

              <Text
                style={styles.errorBannerText}
              >
                {error}
              </Text>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Informações básicas
            </Text>

            <View style={styles.card}>
              <FormInput
                label="Nome"
                value={name}
                onChangeText={setName}
                placeholder="Nome do produto"
              />

              <FormInput
                label="SKU"
                value={sku}
                onChangeText={setSku}
                placeholder="Ex.: TEC-RGB-001"
                autoCapitalize="characters"
              />

              <FormInput
                label="Descrição"
                value={description}
                onChangeText={setDescription}
                placeholder="Descrição do produto"
                multiline
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Classificação
            </Text>

            <View style={styles.card}>
              <FormInput
                label="ID da categoria"
                value={categoryId}
                onChangeText={setCategoryId}
                placeholder="Ex.: 1"
                keyboardType="numeric"
              />

              <FormInput
                label="ID do fornecedor"
                value={supplierId}
                onChangeText={setSupplierId}
                placeholder="Opcional"
                keyboardType="numeric"
              />

              <FormInput
                label="Unidade"
                value={unit}
                onChangeText={setUnit}
                placeholder="Ex.: UN"
                autoCapitalize="characters"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Valores
            </Text>

            <View style={styles.card}>
              <FormInput
                label="Preço de custo"
                value={costPrice}
                onChangeText={setCostPrice}
                placeholder="0,00"
                keyboardType="decimal-pad"
              />

              <FormInput
                label="Preço de venda"
                value={salePrice}
                onChangeText={setSalePrice}
                placeholder="0,00"
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Controle de estoque
            </Text>

            <View style={styles.card}>
              <View style={styles.infoBox}>
                <Text style={styles.infoBoxTitle}>
                  Estoque atual
                </Text>

                <Text style={styles.infoBoxValue}>
                  {Number(
                    product.current_stock,
                  ).toLocaleString(
                    "pt-BR",
                    {
                      maximumFractionDigits: 3,
                    },
                  )}{" "}
                  {product.unit}
                </Text>

                <Text
                  style={
                    styles.infoBoxDescription
                  }
                >
                  O estoque atual é alterado
                  através de movimentações.
                </Text>
              </View>

              <FormInput
                label="Estoque mínimo"
                value={minStock}
                onChangeText={setMinStock}
                placeholder="0"
                keyboardType="decimal-pad"
              />

              <FormInput
                label="Estoque máximo"
                value={maxStock}
                onChangeText={setMaxStock}
                placeholder="Opcional"
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            disabled={saving}
            onPress={handleSave}
            style={[
              styles.saveButton,
              saving &&
                styles.saveButtonDisabled,
            ]}
          >
            {saving ? (
              <ActivityIndicator
                size="small"
                color={colors.text.inverse}
              />
            ) : (
              <Text
                style={
                  styles.saveButtonText
                }
              >
                Salvar alterações
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            disabled={saving}
            onPress={() => router.back()}
            style={styles.cancelButton}
          >
            <Text
              style={styles.cancelButtonText}
            >
              Cancelar
            </Text>
          </TouchableOpacity>

          <View style={styles.bottomSpace} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor:
      colors.background.light,
  },

  keyboard: {
    flex: 1,
  },

  content: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
    paddingBottom: spacing[8],
  },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      colors.background.light,
    paddingHorizontal: spacing[6],
  },

  loadingText: {
    color: colors.text.secondary,
    fontSize: 14,
    marginTop: spacing[3],
  },

  errorTitle: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },

  errorDescription: {
    maxWidth: 300,
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: spacing[2],
  },

  backButton: {
    marginTop: spacing[5],
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    borderRadius: radius.md,
    backgroundColor:
      colors.brand[500],
  },

  backButtonText: {
    color: colors.text.inverse,
    fontSize: 13,
    fontWeight: "700",
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing[6],
  },

  backIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor:
      colors.surface.light,
    borderWidth: 1,
    borderColor:
      colors.border.light,
  },

  backIconText: {
    color: colors.text.primary,
    fontSize: 30,
    fontWeight: "300",
    lineHeight: 32,
  },

  topBarTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "700",
  },

  topBarSpacer: {
    width: 42,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing[5],
  },

  headerIcon: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.xl,
    backgroundColor:
      colors.brand[50],
  },

  headerIconText: {
    color: colors.brand[600],
    fontSize: 23,
    fontWeight: "800",
  },

  headerInfo: {
    flex: 1,
    marginLeft: spacing[4],
  },

  headerTitle: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: "800",
  },

  headerDescription: {
    color: colors.text.secondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing[1],
  },

  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing[4],
    borderRadius: radius.md,
    backgroundColor:
      colors.coral[50],
    borderWidth: 1,
    borderColor:
      colors.coral[100],
    marginBottom: spacing[2],
  },

  errorBannerIcon: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
    backgroundColor:
      colors.coral[100],
  },

  errorBannerIconText: {
    color: colors.coral[600],
    fontSize: 14,
    fontWeight: "800",
  },

  errorBannerText: {
    flex: 1,
    color: colors.coral[700],
    fontSize: 12,
    lineHeight: 18,
    marginLeft: spacing[3],
  },

  section: {
    marginTop: spacing[6],
  },

  sectionTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: spacing[3],
  },

  card: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    borderRadius: radius.xl,
    backgroundColor:
      colors.surface.light,
    borderWidth: 1,
    borderColor:
      colors.border.light,
    ...shadows.soft,
  },

  field: {
    marginBottom: spacing[4],
  },

  label: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: spacing[2],
  },

  input: {
    minHeight: 48,
    paddingHorizontal: spacing[4],
    borderRadius: radius.md,
    backgroundColor:
      colors.neutral[50],
    borderWidth: 1,
    borderColor:
      colors.border.light,
    color: colors.text.primary,
    fontSize: 14,
  },

  textArea: {
    minHeight: 100,
    paddingTop: spacing[3],
  },

  infoBox: {
    padding: spacing[4],
    borderRadius: radius.md,
    backgroundColor:
      colors.brand[50],
    marginBottom: spacing[5],
  },

  infoBoxTitle: {
    color: colors.brand[700],
    fontSize: 11,
    fontWeight: "700",
  },

  infoBoxValue: {
    color: colors.brand[700],
    fontSize: 20,
    fontWeight: "800",
    marginTop: spacing[1],
  },

  infoBoxDescription: {
    color: colors.brand[700],
    fontSize: 11,
    lineHeight: 17,
    marginTop: spacing[1],
  },

  saveButton: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor:
      colors.brand[500],
    marginTop: spacing[7],
    ...shadows.soft,
  },

  saveButtonDisabled: {
    opacity: 0.7,
  },

  saveButtonText: {
    color: colors.text.inverse,
    fontSize: 14,
    fontWeight: "700",
  },

  cancelButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing[2],
  },

  cancelButtonText: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: "700",
  },

  bottomSpace: {
    height: spacing[5],
  },
});
