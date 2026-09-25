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
import { router } from "expo-router";
import {
  useState,
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

  const [error, setError] = useState("");
  const [loading, setLoading] =
    useState(false);

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
      !sku.trim() ||
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

    let parsedSupplierId:
      | number
      | undefined;

    if (supplierId.trim()) {
      const value = Number(supplierId);

      if (
        !Number.isInteger(value) ||
        value <= 0
      ) {
        setError(
          "Informe um ID de fornecedor válido.",
        );
        return;
      }

      parsedSupplierId = value;
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
          sku: sku.trim(),
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

        <View style={styles.card}>
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
            label="SKU *"
            value={sku}
            onChangeText={setSku}
            placeholder="Ex.: TEC-RGB-001"
            autoCapitalize="characters"
          />

          <FormInput
            label="Descrição"
            value={description}
            onChangeText={setDescription}
            placeholder="Descreva o produto"
            multiline
          />

          <FormInput
            label="Categoria ID *"
            value={categoryId}
            onChangeText={setCategoryId}
            placeholder="Ex.: 2"
            keyboardType="numeric"
          />

          <FormInput
            label="Fornecedor ID"
            value={supplierId}
            onChangeText={setSupplierId}
            placeholder="Ex.: 2"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
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

          <FormInput
            label="Unidade *"
            value={unit}
            onChangeText={setUnit}
            placeholder="Ex.: UN"
            autoCapitalize="characters"
          />
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
    paddingTop: spacing[5],
    paddingBottom: spacing[8],
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
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
    fontSize: 24,
    fontWeight: "800",
    marginTop: spacing[1],
  },

  subtitle: {
    color: colors.text.secondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: spacing[3],
    marginBottom: spacing[5],
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
    fontSize: 16,
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
    marginBottom: spacing[4],
  },

  label: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: spacing[2],
  },

  input: {
    height: 48,
    paddingHorizontal: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: radius.md,
    backgroundColor: colors.surface.light,
    color: colors.text.primary,
    fontSize: 13,
  },

  multilineInput: {
    height: 96,
    paddingTop: spacing[3],
  },

  submitButton: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: colors.brand[500],
    ...shadows.soft,
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
    fontWeight: "600",
  },

  bottomSpace: {
    height: spacing[5],
  },
});
