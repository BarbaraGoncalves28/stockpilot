import { useRouter } from "expo-router";
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
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../auth/AuthContext";
import { login, register } from "../auth/authService";

type Props = { mode: "login" | "register" };

const C = {
  bg: "#050B14",
  panel: "#0D1520",
  panelAlt: "#0A111C",
  input: "#0B131E",
  border: "#1E2A3B",
  green: "#00E599",
  white: "#FFFFFF",
  muted: "#8B9BB4",
  red: "#FF5C78",
};

function Field({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  password = false,
  keyboardType = "default",
  autoCapitalize = "none",
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  password?: boolean;
  keyboardType?: "default" | "email-address";
  autoCapitalize?: "none" | "words";
}) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <View style={s.inputWrap}>
        <Ionicons name={icon} size={19} color={C.muted} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#637188"
          secureTextEntry={password && !visible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          style={s.input}
        />
        {password && (
          <Pressable onPress={() => setVisible((v) => !v)} hitSlop={10}>
            <Ionicons
              name={visible ? "eye-off-outline" : "eye-outline"}
              size={19}
              color={C.muted}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default function AuthScreen({ mode }: Props) {
  const router = useRouter();
  const { signIn } = useAuth();
  const { width } = useWindowDimensions();
  const wide = width >= 850;
  const isLogin = mode === "login";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit() {
    setError("");
    setSuccess("");

    if (!email.trim() || !password || (!isLogin && !name.trim())) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    if (!isLogin && name.trim().length < 2) {
      setError("Informe seu nome completo ou nome de exibição.");
      return;
    }

    if (!isLogin && password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    try {
      setLoading(true);

      if (isLogin) {
        const result = await login(email.trim(), password);
        signIn(result.user, result.access_token, result.refresh_token);
        router.replace("/(tabs)/dashboard");
      } else {
        await register(name.trim(), email.trim(), password);
        setSuccess("Conta criada! Redirecionando para o login...");
        setTimeout(() => router.replace("/"), 1000);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível concluir a operação."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            s.page,
            wide ? s.pageWide : s.pageNarrow,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[s.shell, wide ? s.shellWide : s.shellNarrow]}>
            <View style={[s.brandPanel, !wide && s.brandPanelNarrow]}>
              <View style={s.brandTop}>
                <View style={s.logo}>
                  <Ionicons name="cube-outline" size={25} color={C.bg} />
                </View>
                <Text style={s.brandName}>Stock<Text style={s.green}>Pilot</Text></Text>
              </View>

              <View style={s.brandCopy}>
                <View style={s.eyebrow}>
                  <View style={s.statusDot} />
                  <Text style={s.eyebrowText}>GESTÃO INTELIGENTE DE ESTOQUE</Text>
                </View>
                <Text style={s.headline}>
                  Seu estoque{"\n"}sob <Text style={s.green}>controle.</Text>
                </Text>
                <Text style={s.description}>
                  Mais clareza na operação, mais controle sobre seus produtos
                  e decisões melhores para o seu negócio.
                </Text>
              </View>

              <View style={s.visual}>
                <View style={s.visualGlow} />
                <View style={s.visualFrame}>
                  <View style={s.visualHeader}>
                    <View style={s.miniDots}>
                      <View style={s.miniDot} />
                      <View style={s.miniDot} />
                      <View style={s.miniDot} />
                    </View>
                    <View style={s.liveBadge}>
                      <View style={s.statusDot} />
                      <Text style={s.liveText}>STOCKPILOT</Text>
                    </View>
                  </View>
                  <View style={s.visualContent}>
                    <View style={s.chartIcon}>
                      <Ionicons name="bar-chart-outline" size={32} color={C.green} />
                    </View>
                    <View style={s.chartLines}>
                      <View style={[s.chartLine, { width: "78%" }]} />
                      <View style={[s.chartLine, { width: "55%" }]} />
                      <View style={[s.chartLine, { width: "68%" }]} />
                    </View>
                  </View>
                  <View style={s.visualFooter}>
                    <View>
                      <Text style={s.visualLabel}>CONTROLE</Text>
                      <Text style={s.visualValue}>em tempo real</Text>
                    </View>
                    <Ionicons name="trending-up-outline" size={25} color={C.green} />
                  </View>
                </View>
                <View style={s.floatingIcon}>
                  <Ionicons name="checkmark" size={20} color={C.green} />
                </View>
              </View>

              <View style={s.brandFooter}>
                <View style={s.footerLine} />
                <Text style={s.brandFooterText}>ORGANIZE. ACOMPANHE. EVOLUA.</Text>
              </View>
            </View>

            <View style={[s.formPanel, !wide && s.formPanelNarrow]}>
              <View style={s.formTop}>
                <Text style={s.formEyebrow}>{isLogin ? "BEM-VINDA DE VOLTA" : "COMECE AGORA"}</Text>
                <Text style={s.formTitle}>
                  {isLogin ? "Acesse sua conta" : "Crie sua conta"}
                </Text>
                <Text style={s.formSubtitle}>
                  {isLogin
                    ? "Entre para continuar gerenciando seu estoque."
                    : "Preencha os dados para começar a usar o StockPilot."}
                </Text>
              </View>

              <View style={s.form}>
                {!isLogin && (
                  <Field
                    label="Nome"
                    icon="person-outline"
                    value={name}
                    onChangeText={setName}
                    placeholder="Como podemos te chamar?"
                    autoCapitalize="words"
                  />
                )}

                <Field
                  label="E-mail"
                  icon="mail-outline"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="voce@empresa.com"
                  keyboardType="email-address"
                />

                <Field
                  label="Senha"
                  icon="lock-closed-outline"
                  value={password}
                  onChangeText={setPassword}
                  placeholder={isLogin ? "Digite sua senha" : "Mínimo de 8 caracteres"}
                  password
                />

                {!isLogin && (
                  <Field
                    label="Confirmar senha"
                    icon="shield-checkmark-outline"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Digite a senha novamente"
                    password
                  />
                )}

                {isLogin && (
                  <View style={s.formOptions}>
                    <View style={s.secureInfo}>
                      <Ionicons name="shield-checkmark-outline" size={15} color={C.green} />
                      <Text style={s.secureText}>Acesso seguro</Text>
                    </View>
                  </View>
                )}

                {!!error && (
                  <View style={s.messageError}>
                    <Ionicons name="alert-circle-outline" size={18} color={C.red} />
                    <Text style={s.errorText}>{error}</Text>
                  </View>
                )}

                {!!success && (
                  <View style={s.messageSuccess}>
                    <Ionicons name="checkmark-circle-outline" size={18} color={C.green} />
                    <Text style={s.successText}>{success}</Text>
                  </View>
                )}

                <Pressable
                  onPress={handleSubmit}
                  disabled={loading}
                  style={({ pressed }) => [
                    s.primaryButton,
                    pressed && !loading && s.buttonPressed,
                    loading && s.buttonLoading,
                  ]}
                >
                  {loading ? (
                    <ActivityIndicator color={C.bg} />
                  ) : (
                    <>
                      <Text style={s.primaryButtonText}>
                        {isLogin ? "Entrar na plataforma" : "Criar minha conta"}
                      </Text>
                      <Ionicons name="arrow-forward" size={19} color={C.bg} />
                    </>
                  )}
                </Pressable>

                <View style={s.switchRow}>
                  <Text style={s.switchText}>
                    {isLogin ? "Ainda não tem uma conta?" : "Já possui uma conta?"}
                  </Text>
                  <Pressable
                    onPress={() => router.replace(isLogin ? "/register" : "/")}
                    disabled={loading}
                    hitSlop={8}
                  >
                    <Text style={s.switchLink}>
                      {isLogin ? "Cadastre-se" : "Fazer login"}
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View style={s.formFooter}>
                <Ionicons name="lock-closed-outline" size={13} color="#536178" />
                <Text style={s.formFooterText}>
                  Seus dados são protegidos e vinculados à sua conta.
                </Text>
              </View>
            </View>
          </View>
          <Text style={s.copyright}>STOCKPILOT © 2026 · GESTÃO DE ESTOQUE</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  flex: { flex: 1 },
  page: { flexGrow: 1, justifyContent: "center", padding: 20, backgroundColor: C.bg },
  pageWide: { alignItems: "center", paddingVertical: 28 },
  pageNarrow: { paddingHorizontal: 12, paddingVertical: 12 },
  shell: {
    width: "100%",
    maxWidth: 1180,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 22,
    overflow: "hidden",
  },
  shellWide: { flexDirection: "row", minHeight: 650 },
  shellNarrow: { flexDirection: "column" },
  brandPanel: {
    flex: 1,
    backgroundColor: C.panelAlt,
    paddingHorizontal: 38,
    paddingVertical: 34,
    borderRightWidth: 1,
    borderRightColor: C.border,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  brandPanelNarrow: {
    borderRightWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingHorizontal: 22,
    paddingVertical: 22,
  },
  brandTop: { flexDirection: "row", alignItems: "center" },
  logo: {
    width: 43, height: 43, borderRadius: 12,
    backgroundColor: C.green, alignItems: "center", justifyContent: "center",
    marginRight: 12,
  },
  brandName: { color: C.white, fontSize: 23, fontWeight: "800", letterSpacing: -0.7 },
  green: { color: C.green },
  brandCopy: { marginTop: 42, marginBottom: 25 },
  eyebrow: {
    flexDirection: "row", alignItems: "center", alignSelf: "flex-start",
    borderWidth: 1, borderColor: "#174837", backgroundColor: "#0A211B",
    borderRadius: 30, paddingHorizontal: 11, paddingVertical: 8, marginBottom: 22,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.green, marginRight: 8 },
  eyebrowText: { color: C.green, fontSize: 9, fontWeight: "800", letterSpacing: 1.1 },
  headline: { color: C.white, fontSize: 43, lineHeight: 50, fontWeight: "800", letterSpacing: -1.6 },
  description: { color: C.muted, fontSize: 14, lineHeight: 23, marginTop: 17, maxWidth: 390 },
  visual: { minHeight: 175, justifyContent: "center", marginVertical: 12 },
  visualGlow: {
    position: "absolute", width: 170, height: 130, right: 25, top: 5,
    backgroundColor: "#06382A", opacity: 0.45, borderRadius: 100,
  },
  visualFrame: {
    borderWidth: 1, borderColor: "#243747", backgroundColor: "#0B1721",
    borderRadius: 15, padding: 17,
  },
  visualHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  miniDots: { flexDirection: "row" },
  miniDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#344357", marginRight: 5 },
  liveBadge: { flexDirection: "row", alignItems: "center" },
  liveText: { color: C.muted, fontSize: 9, letterSpacing: 1, fontWeight: "700" },
  visualContent: { flexDirection: "row", alignItems: "center", marginTop: 20, marginBottom: 18 },
  chartIcon: {
    width: 58, height: 58, borderRadius: 13, backgroundColor: "#102A25",
    borderWidth: 1, borderColor: "#1A4A3B", alignItems: "center", justifyContent: "center",
    marginRight: 17,
  },
  chartLines: { flex: 1 },
  chartLine: { height: 7, borderRadius: 4, backgroundColor: "#233548", marginVertical: 4 },
  visualFooter: {
    borderTopWidth: 1, borderTopColor: C.border, paddingTop: 13,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  visualLabel: { color: "#687D91", fontSize: 9, letterSpacing: 1.3, fontWeight: "800" },
  visualValue: { color: C.white, fontSize: 13, fontWeight: "600", marginTop: 3 },
  floatingIcon: {
    position: "absolute", right: -5, top: 20, width: 39, height: 39,
    borderRadius: 12, backgroundColor: "#102A25", borderWidth: 1,
    borderColor: "#24684F", alignItems: "center", justifyContent: "center",
  },
  brandFooter: { flexDirection: "row", alignItems: "center", marginTop: 20 },
  footerLine: { height: 2, width: 25, backgroundColor: C.green, marginRight: 10 },
  brandFooterText: { color: "#62758A", fontSize: 9, letterSpacing: 1.5, fontWeight: "700" },
  formPanel: {
    flex: 1, backgroundColor: C.panel, paddingHorizontal: 42,
    paddingVertical: 42, justifyContent: "center",
  },
  formPanelNarrow: { paddingHorizontal: 22, paddingVertical: 30 },
  formTop: { marginBottom: 28 },
  formEyebrow: { color: C.green, fontSize: 10, fontWeight: "800", letterSpacing: 1.7, marginBottom: 12 },
  formTitle: { color: C.white, fontSize: 29, fontWeight: "800", letterSpacing: -0.7 },
  formSubtitle: { color: C.muted, fontSize: 13, lineHeight: 21, marginTop: 9 },
  form: { width: "100%" },
  field: { marginBottom: 18 },
  label: { color: "#DCE5F1", fontSize: 12, fontWeight: "700", marginBottom: 9 },
  inputWrap: {
    minHeight: 51, borderWidth: 1, borderColor: C.border, borderRadius: 9,
    backgroundColor: C.input, paddingHorizontal: 14, flexDirection: "row",
    alignItems: "center",
  },
  input: { flex: 1, color: C.white, fontSize: 13, paddingVertical: 13, paddingHorizontal: 11, outlineStyle: "none" as never },
  formOptions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: -2, marginBottom: 22 },
  secureInfo: { flexDirection: "row", alignItems: "center" },
  secureText: { color: C.muted, fontSize: 11, marginLeft: 7 },
  messageError: {
    flexDirection: "row", alignItems: "flex-start", borderWidth: 1,
    borderColor: "#5A2936", backgroundColor: "#28151D", padding: 11,
    borderRadius: 8, marginBottom: 15,
  },
  errorText: { flex: 1, color: C.red, fontSize: 12, lineHeight: 18, marginLeft: 8 },
  messageSuccess: {
    flexDirection: "row", alignItems: "flex-start", borderWidth: 1,
    borderColor: "#1A5943", backgroundColor: "#10251E", padding: 11,
    borderRadius: 8, marginBottom: 15,
  },
  successText: { flex: 1, color: C.green, fontSize: 12, lineHeight: 18, marginLeft: 8 },
  primaryButton: {
    minHeight: 51, backgroundColor: C.green, borderRadius: 9,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingHorizontal: 16, marginTop: 3,
  },
  primaryButtonText: { color: C.bg, fontSize: 13, fontWeight: "800", marginRight: 10 },
  buttonPressed: { opacity: 0.82 },
  buttonLoading: { opacity: 0.7 },
  switchRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "center", marginTop: 24 },
  switchText: { color: C.muted, fontSize: 12, marginRight: 5 },
  switchLink: { color: C.green, fontSize: 12, fontWeight: "800" },
  formFooter: {
    borderTopWidth: 1, borderTopColor: C.border, marginTop: 30, paddingTop: 17,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
  },
  formFooterText: { color: "#65758A", fontSize: 10, marginLeft: 7, textAlign: "center" },
  copyright: { color: "#46566B", textAlign: "center", fontSize: 9, letterSpacing: 1.2, marginTop: 18 },
});
