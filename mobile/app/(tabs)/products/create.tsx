import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type TextInputProps,
} from "react-native";
import { router } from "expo-router";
import {
  useState, useEffect
} from "react";

import { useAuth } from "../../../src/auth/AuthContext";
import {
  createProduct,
} from "../../../src/modules/products/productService";
import { colors } from "../../../src/theme/colors";
import {
  radius,
  shadows,
  spacing,
} from "../../../src/theme/spacing";
import { getCategories } from "../../../src/modules/categories/categoryService";
import type { Category } from "../../../src/modules/categories/category.types";
import { getSuppliers } from "../../../src/modules/suppliers/supplierService";
import type { Supplier } from "../../../src/modules/suppliers/supplier.types";

type FormInputProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "default" | "numeric" | "decimal-pad";
  multiline?: boolean;
  autoCapitalize?: TextInputProps["autoCapitalize"];
};

function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  multiline = false,
}: FormInputProps) {
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
        textAlignVertical={
          multiline ? "top" : "center"
        }
        style={[
          styles.input,
          multiline
            ? styles.multilineInput
            : undefined,
        ]}
      />
    </View>
  );
}

export default function CreateProductScreen() {
  const {
    accessToken,
    user,
  } = useAuth();

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
  const [currentStock, setCurrentStock] =
    useState("0");
  const [minStock, setMinStock] =
    useState("");
  const [maxStock, setMaxStock] =
    useState("");
  const [unit, setUnit] = useState("UN");
  const [unitDropdownOpen, setUnitDropdownOpen] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] =
    useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
const [categoriesLoading, setCategoriesLoading] = useState(true);
const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
const [supplierDropdownOpen, setSupplierDropdownOpen] = useState(false);
const [suppliersLoading, setSuppliersLoading] = useState(true);

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
        isActive: true,
      });

      const allSuppliers = [...firstPage.items];

      for (let page = 2; page <= firstPage.total_pages; page++) {
        const response = await getSuppliers(accessToken!, {
          page,
          pageSize: 20,
          isActive: true,
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
  if(!accessToken) return;

  let isMounted = true;

  async function loadCategories() {
    try {
      setCategoriesLoading(true);

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

      if(isMounted) {
        setCategories(allCategories);
      }
    } catch (err) {
      if (isMounted) {
        setError(
          err instanceof Error
           ? err.message
           : "Não foi possível carregar as categorias."
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

  if (!accessToken || !user) {
    router.replace("/");
    return null;
  }

  if (user.role !== "ADMIN") {
    router.replace("/(tabs)/products");
    return null;
  }

  async function handleSubmit() {
    if (
      !name.trim() ||
      !categoryId.trim() ||
      !costPrice.trim() ||
      !salePrice.trim() ||
      !minStock.trim() ||
      !unit.trim()
    ) {
      setError(
        "Preencha todos os campos obrigatórios.",
      );
      return;
    }

    const parsedCategoryId =
      Number(categoryId);

    if (
      !Number.isInteger(parsedCategoryId) ||
      parsedCategoryId <= 0
    ) {
      setError(
        "Informe um ID de categoria válido.",
      );
      return;
    }

    const parsedSupplierId = Number(supplierId);

    if (
      !supplierId.trim() ||
      !Number.isInteger(parsedSupplierId) ||
      parsedSupplierId <= 0
    ) {
      setError("Selecione um fornecedor válido.");
      return;
    }

    if (
      Number.isNaN(Number(costPrice)) ||
      Number(costPrice) < 0
    ) {
      setError(
        "Informe um preço de custo válido.",
      );
      return;
    }

    if (
      Number.isNaN(Number(salePrice)) ||
      Number(salePrice) < 0
    ) {
      setError(
        "Informe um preço de venda válido.",
      );
      return;
    }

    if (
      Number.isNaN(Number(currentStock)) ||
      Number(currentStock) < 0
    ) {
      setError(
        "Informe um estoque inicial válido.",
      );
      return;
    }

    if (
      Number.isNaN(Number(minStock)) ||
      Number(minStock) < 0
    ) {
      setError(
        "Informe um estoque mínimo válido.",
      );
      return;
    }

    if (
      maxStock.trim() &&
      (
        Number.isNaN(Number(maxStock)) ||
        Number(maxStock) < 0
      )
    ) {
      setError(
        "Informe um estoque máximo válido.",
      );
      return;
    }

    try {
      setError("");
      setLoading(true);

      if (!accessToken) {
  setError("Sessão expirada. Faça login novamente.");
  return;
}

      await createProduct(
        accessToken,
        {
          name: name.trim(),
          ...(sku.trim() ? { sku: sku.trim().toUpperCase() } : {}),
          description:
            description.trim() || undefined,
          category_id: parsedCategoryId,
          supplier_id: parsedSupplierId,
          cost_price: costPrice.trim(),
          sale_price: salePrice.trim(),
          current_stock:
            currentStock.trim() || "0",
          min_stock: minStock.trim(),
          max_stock:
            maxStock.trim() || undefined,
          unit: unit.trim().toUpperCase(),
        },
      );

      router.replace("/(tabs)/products");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível cadastrar o produto.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>
              ‹
            </Text>
          </TouchableOpacity>

          <View style={styles.topBarText}>
            <Text style={styles.eyebrow}>
              ESTOQUE
            </Text>

            <Text style={styles.title}>
              Novo produto
            </Text>
          </View>
        </View>

        <Text style={styles.subtitle}>
          Cadastre um produto para começar a
          controlar seu estoque.
        </Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              {error}
            </Text>
          </View>
        ) : null}

        <View style={[styles.card, categoryDropdownOpen || supplierDropdownOpen ? { zIndex: 10000, elevation: 10000 } : undefined]}>
          <Text style={styles.sectionTitle}>
            Informações básicas
          </Text>

          <FormInput
            label="Nome *"
            value={name}
            onChangeText={setName}
            placeholder="Ex.: Teclado Mecânico RGB"
          />

          <FormInput
            label="Código do produto (SKU)"
            value={sku}
            onChangeText={setSku}
            placeholder="Informe o código da etiqueta (opcional)"
          />
          <Text style={styles.helper}>
            Informe o SKU da etiqueta do fornecedor ou deixe em branco para gerar automaticamente.
          </Text>

<FormInput
            label="Descrição"
            value={description}
            onChangeText={setDescription}
            placeholder="Descreva o produto"
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
            (category) => String(category.id) === categoryId,
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
        categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            activeOpacity={0.7}
            style={styles.categoryOption}
            onPress={() => {
              setCategoryId(String(category.id));
              setCategoryDropdownOpen(false);
              setError("");
            }}
          >
            <View style={styles.categoryOptionContent}>
              <Text style={styles.categoryOptionText}>
                {category.name}
              </Text>

              {category.description ? (
                <Text style={styles.categoryOptionDescription}>
                  {category.description}
                </Text>
              ) : null}
            </View>

            {String(category.id) === categoryId ? (
              <Text style={styles.categoryCheck}>✓</Text>
            ) : null}
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  )}
</View>

<View style={[styles.field, supplierDropdownOpen ? { zIndex: 9999, elevation: 9999 } : undefined]}>
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
          Nenhum fornecedor ativo encontrado.
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

        

        <View style={styles.card}><Text style={styles.sectionTitle}>
    Valores
  </Text>

          <FormInput
            label="Preço de custo *"
            value={costPrice}
            onChangeText={setCostPrice}
            placeholder="Ex.: 180.00"
            keyboardType="decimal-pad"
          />

          <FormInput
            label="Preço de venda *"
            value={salePrice}
            onChangeText={setSalePrice}
            placeholder="Ex.: 299.90"
            keyboardType="decimal-pad"
          />

          <View style={styles.field}>
  <Text style={styles.label}>Unidade de medida *</Text>

  <TouchableOpacity
    activeOpacity={0.7}
    onPress={() => setUnitDropdownOpen((open) => !open)}
    style={styles.categorySelect}
  >
    <Text style={styles.categorySelectText}>
      {{
        UN: "Unidade (UN)",
        KG: "Quilograma (KG)",
        G: "Grama (G)",
        L: "Litro (L)",
        M: "Metro (M)",
        CX: "Caixa (CX)",
        PCT: "Pacote (PCT)",
        PAR: "Par (PAR)",
      }[unit] ?? "Selecione uma unidade"}
    </Text>
    <Text style={styles.categoryCheck}>
      {unitDropdownOpen ? "▲" : "▼"}
    </Text>
  </TouchableOpacity>

  {unitDropdownOpen ? (
    <View style={styles.dropdownList}>
      {[
        { value: "UN", label: "Unidade (UN)" },
        { value: "KG", label: "Quilograma (KG)" },
        { value: "G", label: "Grama (G)" },
        { value: "L", label: "Litro (L)" },
        { value: "M", label: "Metro (M)" },
        { value: "CX", label: "Caixa (CX)" },
        { value: "PCT", label: "Pacote (PCT)" },
        { value: "PAR", label: "Par (PAR)" },
      ].map((option) => (
        <TouchableOpacity
          key={option.value}
          activeOpacity={0.7}
          style={styles.categoryOption}
          onPress={() => {
            setUnit(option.value);
            setUnitDropdownOpen(false);
            setError("");
          }}
        >
          <Text style={styles.categoryOptionText}>
            {option.label}
          </Text>
          {unit === option.value ? (
            <Text style={styles.categoryCheck}>✓</Text>
          ) : null}
        </TouchableOpacity>
      ))}
    </View>
  ) : null}

  <Text style={styles.helper}>
    Escolha como o produto será contado ou medido no estoque.
  </Text>
</View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Controle de estoque
          </Text>

          <Text style={styles.helper}>
            O estoque inicial será usado como o
            estoque atual do produto.
          </Text>

          <FormInput
            label="Estoque inicial"
            value={currentStock}
            onChangeText={setCurrentStock}
            placeholder="0"
            keyboardType="decimal-pad"
          />

          <FormInput
            label="Estoque mínimo *"
            value={minStock}
            onChangeText={setMinStock}
            placeholder="Ex.: 5"
            keyboardType="decimal-pad"
          />

          <FormInput
            label="Estoque máximo"
            value={maxStock}
            onChangeText={setMaxStock}
            placeholder="Ex.: 30"
            keyboardType="decimal-pad"
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          disabled={loading}
          onPress={handleSubmit}
          style={[
            styles.submitButton,
            loading
              ? styles.submitButtonDisabled
              : undefined,
          ]}
        >
          {loading ? (
            <ActivityIndicator
              color={colors.text.inverse}
            />
          ) : (
            <Text style={styles.submitText}>
              Cadastrar produto
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          disabled={loading}
          onPress={() => router.back()}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelText}>
            Cancelar
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background.light,
  },

  content: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[7],
    paddingBottom: spacing[10],
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing[2],
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: colors.surface.light,
    borderWidth: 1,
    borderColor: colors.border.light,
  },

  backButtonText: {
    color: colors.text.primary,
    fontSize: 30,
    fontWeight: "300",
    lineHeight: 32,
  },

  topBarText: {
    marginLeft: spacing[3],
  },

  eyebrow: {
    color: colors.brand[600],
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.3,
  },

  title: {
    color: colors.text.primary,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginTop: spacing[1],
  },

  subtitle: {
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing[2],
    marginBottom: spacing[6],
  },

  errorBox: {
    padding: spacing[3],
    marginBottom: spacing[4],
    borderRadius: radius.md,
    backgroundColor: colors.coral[50],
    borderWidth: 1,
    borderColor: colors.coral[100],
  },

  errorText: {
    color: colors.coral[700],
    fontSize: 12,
    lineHeight: 18,
  },

  card: {
    padding: spacing[5],
    marginBottom: spacing[4],
    borderRadius: radius.xl,
    backgroundColor: colors.surface.light,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.soft,
  },

  sectionTitle: {
    color: colors.text.primary,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: spacing[4],
  },

  helper: {
    color: colors.text.secondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: -spacing[2],
    marginBottom: spacing[4],
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
  borderWidth: 1,
  borderColor: colors.border.light,
  borderRadius: radius.lg,
  backgroundColor: colors.neutral[50],
  color: colors.text.primary,
  fontSize: 14,
},

  multilineInput: {
    height: 96,
    paddingTop: spacing[3],
  },

  submitButton: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
    backgroundColor: colors.brand[500],
    ...shadows.floating,
  },

  submitButtonDisabled: {
    opacity: 0.7,
  },

  submitText: {
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

  cancelText: {
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

categoryPlaceholder: {
  color: colors.text.muted,
},

categoryArrow: {
  color: colors.text.secondary,
  fontSize: 22,
  marginLeft: spacing[2],
},

modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.45)",
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
  color: colors.text.primary,
  fontSize: 18,
  fontWeight: "700",
  marginBottom: spacing[4],
},

categoryOption: {
    paddingHorizontal: spacing[4],
  minHeight: 54,
  paddingVertical: spacing[3],
  borderBottomWidth: 1,
  borderBottomColor: colors.border.light,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
},

categoryOptionContent: {
  flex: 1,
  paddingRight: spacing[3],
},

categoryOptionText: {
  color: colors.text.primary,
  fontSize: 14,
  fontWeight: "600",
},

categoryOptionDescription: {
  color: colors.text.secondary,
  fontSize: 12,
  marginTop: spacing[1],
},

categoryCheck: {
  color: colors.brand[600],
  fontSize: 18,
  fontWeight: "700",
},

categoryEmpty: {
  color: colors.text.secondary,
  fontSize: 14,
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
  fontSize: 14,
  fontWeight: "700",
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















