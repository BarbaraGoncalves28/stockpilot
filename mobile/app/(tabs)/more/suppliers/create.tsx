import { useState } from "react";
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
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../../../../src/auth/AuthContext";
import { createSupplier } from "../../../../src/modules/suppliers/supplierService";
import { colors } from "../../../../src/theme/colors";
import { radius, shadows, spacing } from "../../../../src/theme/spacing";

type FormInputProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "email-address" | "phone-pad" | "numeric";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  multiline?: boolean;
};

function FormInput({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = "default",
  autoCapitalize = "sentences",
  multiline = false,
}: FormInputProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.muted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        style={[
          styles.input,
          multiline ? styles.multilineInput : undefined,
        ]}
      />
    </View>
  );
}

export default function CreateSupplierScreen() {
  const router = useRouter();
  const { accessToken, user } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [document, setDocument] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.role === "ADMIN";

  async function handleCreate() {
    if (!accessToken) {
      return;
    }

    const normalizedName = name.trim();

    if (!normalizedName) {
      setError("Informe o nome do fornecedor.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await createSupplier(accessToken, {
        name: normalizedName,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        document: document.trim() || undefined,
        address: address.trim() || undefined,
      });

      router.replace("/(tabs)/more/suppliers");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível cadastrar o fornecedor.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <View style={styles.errorIcon}>
            <Ionicons
              name="lock-closed-outline"
              size={28}
              color={colors.danger}
            />
          </View>

          <Text style={styles.errorTitle}>
            Acesso restrito
          </Text>

          <Text style={styles.errorMessage}>
            Apenas administradores podem cadastrar fornecedores.
          </Text>

          <Pressable
            style={styles.backButtonLarge}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>
              Voltar
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons
                name="arrow-back"
                size={21}
                color={colors.text.primary}
              />
            </Pressable>

            <View style={styles.headerText}>
              <Text style={styles.eyebrow}>
                NOVO FORNECEDOR
              </Text>

              <Text style={styles.title}>
                Cadastrar fornecedor
              </Text>
            </View>
          </View>

          <View style={styles.introCard}>
            <View style={styles.introIcon}>
              <Ionicons
                name="business-outline"
                size={24}
                color={colors.brand[500]}
              />
            </View>

            <View style={styles.introText}>
              <Text style={styles.introTitle}>
                Dados do fornecedor
              </Text>

              <Text style={styles.introDescription}>
                Cadastre as informações que serão usadas
                para identificar e gerenciar este fornecedor.
              </Text>
            </View>
          </View>

          <View style={styles.formCard}>
            <FormInput
              label="Nome *"
              placeholder="Ex.: Tech Distribuidora"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

            <FormInput
              label="E-mail"
              placeholder="contato@empresa.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <FormInput
              label="Telefone"
              placeholder="(62) 99999-9999"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <FormInput
              label="Documento"
              placeholder="CNPJ ou CPF"
              value={document}
              onChangeText={setDocument}
              keyboardType="numeric"
            />

            <FormInput
              label="Endereço"
              placeholder="Rua, número, bairro, cidade..."
              value={address}
              onChangeText={setAddress}
              multiline
            />

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons
                  name="alert-circle-outline"
                  size={18}
                  color={colors.danger}
                />

                <Text style={styles.errorBoxText}>
                  {error}
                </Text>
              </View>
            ) : null}

            <Pressable
              style={[
                styles.submitButton,
                loading ? styles.submitButtonDisabled : undefined,
              ]}
              onPress={handleCreate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator
                  color={colors.text.inverse}
                />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color={colors.text.inverse}
                  />

                  <Text style={styles.submitButtonText}>
                    Cadastrar fornecedor
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.light,
  },

  flex: {
    flex: 1,
  },

  content: {
    padding: spacing[5],
    paddingBottom: spacing[12],
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing[6],
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

  headerText: {
    flex: 1,
    marginLeft: spacing[3],
  },

  eyebrow: {
    marginBottom: 3,
    color: colors.brand[500],
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },

  title: {
    color: colors.text.primary,
    fontSize: 22,
    fontWeight: "800",
  },

  introCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing[4],
    marginBottom: spacing[5],
    backgroundColor: colors.brand[50],
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.brand[100],
  },

  introIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.lg,
    backgroundColor: colors.surface.light,
  },

  introText: {
    flex: 1,
    marginLeft: spacing[3],
  },

  introTitle: {
    marginBottom: 4,
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: "800",
  },

  introDescription: {
    color: colors.text.secondary,
    fontSize: 12,
    lineHeight: 18,
  },

  formCard: {
    padding: spacing[5],
    backgroundColor: colors.surface.light,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.soft,
  },

  field: {
    marginBottom: spacing[4],
  },

  label: {
    marginBottom: spacing[2],
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: "700",
  },

  input: {
    minHeight: 48,
    paddingHorizontal: spacing[3],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.neutral[50],
    color: colors.text.primary,
    fontSize: 14,
  },

  multilineInput: {
    minHeight: 96,
    paddingTop: spacing[3],
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: spacing[3],
    marginBottom: spacing[4],
    borderRadius: radius.md,
    backgroundColor: colors.coral[50],
    borderWidth: 1,
    borderColor: colors.coral[100],
  },

  errorBoxText: {
    flex: 1,
    marginLeft: spacing[2],
    color: colors.danger,
    fontSize: 13,
    lineHeight: 19,
  },

  submitButton: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
    borderRadius: radius.md,
    backgroundColor: colors.brand[500],
    ...shadows.floating,
  },

  submitButtonDisabled: {
    opacity: 0.65,
  },

  submitButtonText: {
    color: colors.text.inverse,
    fontSize: 14,
    fontWeight: "800",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing[6],
  },

  errorIcon: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing[4],
    borderRadius: radius.full,
    backgroundColor: colors.coral[50],
  },

  errorTitle: {
    marginBottom: spacing[2],
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },

  errorMessage: {
    maxWidth: 320,
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },

  backButtonLarge: {
    marginTop: spacing[5],
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    borderRadius: radius.md,
    backgroundColor: colors.brand[500],
  },

  backButtonText: {
    color: colors.text.inverse,
    fontSize: 14,
    fontWeight: "700",
  },
});
