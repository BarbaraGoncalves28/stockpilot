import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
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
import { getCategories } from "../../../../src/modules/categories/categoryService";
import type { Category } from "../../../../src/modules/categories/category.types";
import { getSuppliers } from "../../../../src/modules/suppliers/supplierService";
import type { Supplier } from "../../../../src/modules/suppliers/supplier.types";

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
  const [unitDropdownOpen, setUnitDropdownOpen] = useState(false);


  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");
    
const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
const [categoriesLoading, setCategoriesLoading] = useState(true);
const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
const [supplierDropdownOpen, setSupplierDropdownOpen] = useState(false);
const [suppliersLoading, setSuppliersLoading] = useState(true);
const [supplierModalVisible, setSupplierModalVisible] = useState(false);

useEffect(() => {
  if (!accessToken) {
    setSuppliersLoading(false);
    return;
  }

  let isMounted = true;

  async function loadSuppliers() {
    try {
      setSuppliersLoading(true);

      const firstPage = await getSuppliers(accessToken!, {
        page: 1,
        pageSize: 20,
      });

      const allSuppliers = [...firstPage.items];

      for (let page = 2; page <= firstPage.total_pages; page++) {
        const response = await getSuppliers(accessToken!, {
          page,
          pageSize: 20,
        });

        allSuppliers.push(...response.items);
      }

      if (isMounted) {
        setSuppliers(allSuppliers);
      }
    } catch (err) {
      if (isMounted) {
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar os fornecedores.",
        );
      }
    } finally {
      if (isMounted) {
        setSuppliersLoading(false);
      }
    }
  }

  void loadSuppliers();

  return () => {
    isMounted = false;
  };
}, [accessToken]);

useEffect(() => {
  if (!accessToken) return;

  let isMounted = true;

  async function loadCategories() {
    try {
      const firstPage = await getCategories(accessToken!, {
        page: 1,
        pageSize: 20,
        isActive: true,
      });

      const allCategories = [...firstPage.items];

      for (let page = 2; page <= firstPage.total_pages; page++) {
        const response = await getCategories(accessToken!, {
          page,
          pageSize: 20,
          isActive: true,
        });

        allCategories.push(...response.items);
      }

      if (isMounted) {
        setCategories(allCategories);
      }
    } catch (err) {
      if (isMounted) {
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar as categorias.",
        );
      }
    } finally {
      if (isMounted) {
        setCategoriesLoading(false);
      }
    }
  }

  void loadCategories();

  return () => {
    isMounted = false;
  };
}, [accessToken]);


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

    const parsedSupplierId = Number(supplierId.trim());

    if (
      !supplierId.trim() ||
      !Number.isInteger(parsedSupplierId) ||
      parsedSupplierId <= 0
    ) {
      setError("Selecione um fornecedor válido.");
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
          ...(sku.trim() ? { sku: sku.trim().toUpperCase() } : {}),
          description:
            description.trim() || null,
          category_id:
            parsedCategoryId,
          supplier_id: parsedSupplierId,
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
        `/(tabs)products/${product.id}`,
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
                label="Código do produto (SKU)"
                value={sku}
                onChangeText={setSku}
                placeholder="Código do produto"
              />
              <Text style={styles.label}>
                Você pode alterar o SKU. Se deixar em branco, o código atual será preservado.
              </Text>

<FormInput
                label="Descrição"
                value={description}
                onChangeText={setDescription}
                placeholder="Descrição do produto"
                multiline
              />
<View style={[styles.field, categoryDropdownOpen ? { zIndex: 9999, elevation: 9999 } : undefined]}>
  <Text style={styles.label}>Categoria *</Text>

  <TouchableOpacity
    activeOpacity={0.7}
    disabled={categoriesLoading}
    onPress={() => {
      setCategoryDropdownOpen((open) => !open);
      setSupplierDropdownOpen(false);
    }}
    style={styles.categorySelect}
  >
    <Text
      style={[
        styles.categorySelectText,
        !categoryId && styles.categoryPlaceholder,
      ]}
    >
      {categoriesLoading
        ? "Carregando categorias..."
        : categories.find(
            (item) => String(item.id) === categoryId,
          )?.name ?? "Selecione uma categoria"}
    </Text>

    {categoriesLoading ? (
      <ActivityIndicator size="small" color={colors.brand[600]} />
    ) : (
      <Text style={styles.categoryArrow}>
        {categoryDropdownOpen ? "⌃" : "⌄"}
      </Text>
    )}
  </TouchableOpacity>

  {categoryDropdownOpen && !categoriesLoading && (
    <ScrollView
      style={[styles.dropdownList, { backgroundColor: "#FFFFFF", zIndex: 10000, elevation: 10000 }]}
      nestedScrollEnabled
      keyboardShouldPersistTaps="handled"
    >
      {categories.length === 0 ? (
        <Text style={styles.categoryEmpty}>
          Nenhuma categoria ativa encontrada.
        </Text>
      ) : (
        categories.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.7}
            style={styles.categoryOption}
            onPress={() => {
              setCategoryId(String(item.id));
              setCategoryDropdownOpen(false);
              setError("");
            }}
          >
            <Text style={styles.categoryOptionText}>
              {item.name}
            </Text>

            {String(item.id) === categoryId ? (
              <Text style={styles.categoryCheck}>✓</Text>
            ) : null}
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  )}
</View>

<View style={[styles.field, supplierDropdownOpen ? { zIndex: 9999, elevation: 9999, marginBottom: 240 } : undefined]}>
  <Text style={styles.label}>Fornecedor *</Text>

  <TouchableOpacity
    activeOpacity={0.7}
    disabled={suppliersLoading}
    onPress={() => {
      setSupplierDropdownOpen((open) => !open);
      setCategoryDropdownOpen(false);
    }}
    style={styles.categorySelect}
  >
    <Text
      style={[
        styles.categorySelectText,
        !supplierId && styles.categoryPlaceholder,
      ]}
    >
      {suppliersLoading
        ? "Carregando fornecedores..."
        : suppliers.find(
            (supplier) => String(supplier.id) === supplierId,
          )?.name ?? "Selecione um fornecedor"}
    </Text>

    {suppliersLoading ? (
      <ActivityIndicator size="small" color={colors.brand[600]} />
    ) : (
      <Text style={styles.categoryArrow}>
        {supplierDropdownOpen ? "⌃" : "⌄"}
      </Text>
    )}
  </TouchableOpacity>

  {supplierDropdownOpen && !suppliersLoading && (
    <ScrollView
      style={[styles.dropdownList, { backgroundColor: "#FFFFFF", zIndex: 10000, elevation: 10000 }]}
      contentContainerStyle={{ zIndex: undefined, backgroundColor: "#FFFFFF" }}
            nestedScrollEnabled
      keyboardShouldPersistTaps="handled"
    >


      {suppliers.length === 0 ? (
        <Text style={styles.categoryEmpty}>
          Nenhum fornecedor encontrado.
        </Text>
      ) : (
        suppliers.map((supplier) => (
          <TouchableOpacity
            key={supplier.id}
            activeOpacity={0.7}
            style={styles.categoryOption}
            onPress={() => {
              setSupplierId(String(supplier.id));
              setSupplierDropdownOpen(false);
              setError("");
            }}
          >
            <Text style={styles.categoryOptionText}>
              {supplier.name}
              {!supplier.is_active ? " (Inativo)" : ""}
            </Text>

            {String(supplier.id) === supplierId ? (
              <Text style={styles.categoryCheck}>✓</Text>
            ) : null}
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  )}
</View>

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
              <View style={styles.field}>
                <Text style={styles.label}>Unidade de medida *</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.categorySelect}
                  onPress={() => setUnitDropdownOpen((open) => !open)}
                >
                  <Text style={styles.categorySelectText}>
                    {({
                      UN: "Unidade",
                      KG: "Quilograma",
                      G: "Grama",
                      L: "Litro",
                      M: "Metro",
                      CX: "Caixa",
                      PCT: "Pacote",
                      PAR: "Par",
                    } as Record<string, string>)[unit] ?? "Selecione uma unidade"}
                  </Text>
                  <Text style={styles.categoryArrow}>
                    {unitDropdownOpen ? "⌃" : "⌄"}
                  </Text>
                </TouchableOpacity>

                {unitDropdownOpen ? (
                  <View style={styles.dropdownList}>
                    {([
                      ["UN", "Unidade"],
                      ["KG", "Quilograma"],
                      ["G", "Grama"],
                      ["L", "Litro"],
                      ["M", "Metro"],
                      ["CX", "Caixa"],
                      ["PCT", "Pacote"],
                      ["PAR", "Par"],
                    ] as const).map(([value, label]) => (
                      <TouchableOpacity
                        key={value}
                        activeOpacity={0.7}
                        style={styles.categoryOption}
                        onPress={() => {
                          setUnit(value);
                          setUnitDropdownOpen(false);
                          setError("");
                        }}
                      >
                        <Text style={styles.categoryOptionText}>{label}</Text>
                        {unit === value ? (
                          <Text style={styles.categoryCheck}>✓</Text>
                        ) : null}
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : null}

                <Text style={styles.label}>
                  Escolha como o produto será contado ou medido no estoque.
                </Text>
              </View>
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
    paddingTop: spacing[7],
    paddingBottom: spacing[10],
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
    marginBottom: spacing[7],
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
    fontSize: 17,
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
    width: 68,
    height: 68,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.xl,
    backgroundColor:
      colors.brand[50],
  },

  headerIconText: {
    color: colors.brand[600],
    fontSize: 27,
    fontWeight: "800",
  },

  headerInfo: {
    flex: 1,
    marginLeft: spacing[4],
  },

  headerTitle: {
    color: colors.text.primary,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
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
    padding: spacing[5],
    borderRadius: radius.xl,
    backgroundColor:
      colors.surface.light,
    borderWidth: 1,
    borderColor:
      colors.border.light,
    ...shadows.soft,
  },

  field: {
    position: "relative",
    marginBottom: spacing[4],
  },

  label: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: spacing[2],
  },

  input: {
    minHeight: 50,
    paddingHorizontal: spacing[4],
    borderRadius: radius.lg,
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
    borderRadius: radius.lg,
    backgroundColor:
      colors.brand[500],
    marginTop: spacing[7],
    ...shadows.floating,
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


categorySelect: {
  minHeight: 50,
  paddingHorizontal: spacing[4],
  borderWidth: 1,
  borderColor: colors.border.light,
  borderRadius: radius.lg,
  backgroundColor: colors.neutral[50],
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
},
categorySelectText: {
  flex: 1,
  color: colors.text.primary,
  fontSize: 14,
},
categoryArrow: {
  fontSize: 22,
  color: colors.text.secondary,
},
modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.45)",
  justifyContent: "center",
  padding: spacing[5],
},
categoryModal: {
  maxHeight: "75%",
  padding: spacing[5],
  borderRadius: radius.xl,
  backgroundColor: colors.surface.light,
},
modalTitle: {
  fontSize: 18,
  fontWeight: "700",
  color: colors.text.primary,
  marginBottom: spacing[4],
},
categoryOption: {
    paddingHorizontal: spacing[4],
  minHeight: 50,
  paddingVertical: spacing[3],
  borderBottomWidth: 1,
  borderBottomColor: colors.border.light,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
},
categoryOptionText: {
  color: colors.text.primary,
  fontSize: 14,
},
categoryCheck: {
  color: colors.brand[600],
  fontSize: 18,
  fontWeight: "700",
},
categoryEmpty: {
  color: colors.text.secondary,
  paddingVertical: spacing[4],
},
modalCloseButton: {
  minHeight: 46,
  alignItems: "center",
  justifyContent: "center",
  marginTop: spacing[3],
},
modalCloseText: {
  color: colors.brand[600],
  fontWeight: "700",
},

categoryPlaceholder: {
  color: "#94A3B8",
},

dropdownList: {
    position: "absolute",
    top: 72,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 12,
    maxHeight: 220,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: radius.lg,
    backgroundColor:  "#FFFFFF",
    overflow: "hidden",
  },

});













