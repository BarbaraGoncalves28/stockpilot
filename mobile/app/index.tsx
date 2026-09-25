import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../src/auth/AuthContext";
import { login } from "../src/auth/authService";
import { AppTextInput } from "../src/components/AppTextInput";
import { colors } from "../src/theme/colors";
import { radius, shadows, spacing } from "../src/theme/spacing";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { signIn } = useAuth();

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError("Preencha seu e-mail e sua senha.");
      return;
    }

    try {
      setError("");
      setLoading(true);

      const result = await login(
        email.trim(),
        password,
      );

      signIn(
        result.user,
        result.access_token,
        result.refresh_token,
      );

      router.replace("/(tabs)/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível entrar.",
      );
    } finally {
      setLoading(false);
    }
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
            <View style={styles.logo}>
              <Text style={styles.logoText}>S</Text>
            </View>

            <Text style={styles.title}>
              Bem-vinda ao StockPilot
            </Text>

            <Text style={styles.subtitle}>
              Gestão inteligente de estoque para o seu negócio.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Entrar na sua conta
            </Text>

            <Text style={styles.cardSubtitle}>
              Acesse seu estoque e acompanhe sua operação.
            </Text>

            <View style={styles.form}>
              <AppTextInput
                label="E-mail"
                value={email}
                onChangeText={setEmail}
                placeholder="seu@email.com"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                editable={!loading}
              />

              <AppTextInput
                label="Senha"
                value={password}
                onChangeText={setPassword}
                placeholder="Digite sua senha"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />

              {error ? (
                <Text style={styles.error}>
                  {error}
                </Text>
              ) : null}

              <Pressable
                onPress={handleLogin}
                disabled={loading}
                style={({ pressed }) => [
                  styles.button,
                  loading && styles.buttonDisabled,
                  pressed &&
                    !loading &&
                    styles.buttonPressed,
                ]}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Entrando..." : "Entrar"}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {}}
                disabled={loading}
                style={styles.forgotButton}
              >
                <Text style={styles.forgotText}>
                  Esqueci minha senha
                </Text>
              </Pressable>
            </View>
          </View>

          <Text style={styles.footer}>
            StockPilot · Gestão inteligente de estoque
          </Text>
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
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[8],
  },

  header: {
    alignItems: "center",
    marginBottom: spacing[6],
  },

  logo: {
    width: 58,
    height: 58,
    borderRadius: radius.lg,
    backgroundColor: colors.brand[500],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing[4],
    ...shadows.floating,
  },

  logoText: {
    color: colors.text.inverse,
    fontSize: 28,
    fontWeight: "800",
  },

  title: {
    color: colors.text.primary,
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
  },

  subtitle: {
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: spacing[2],
    maxWidth: 310,
  },

  card: {
    backgroundColor: colors.surface.light,
    borderRadius: radius.xl,
    padding: spacing[5],
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.medium,
  },

  cardTitle: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: "700",
  },

  cardSubtitle: {
    color: colors.text.secondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing[1],
    marginBottom: spacing[5],
  },

  form: {
    width: "100%",
  },

  error: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 19,
    marginTop: -spacing[2],
    marginBottom: spacing[2],
  },

  button: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.brand[500],
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing[2],
    ...shadows.soft,
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  buttonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },

  buttonText: {
    color: colors.text.inverse,
    fontSize: 15,
    fontWeight: "700",
  },

  forgotButton: {
    alignItems: "center",
    marginTop: spacing[4],
  },

  forgotText: {
    color: colors.brand[600],
    fontSize: 13,
    fontWeight: "600",
  },

  footer: {
    color: colors.text.muted,
    fontSize: 11,
    textAlign: "center",
    marginTop: spacing[6],
  },
});