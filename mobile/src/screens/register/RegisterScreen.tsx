import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import RegisterField from "./RegisterField";
import { useRegister } from "./useRegister";
import { C, s } from "../../styles/screens/register.styles";

export default function RegisterScreen() {
  const { width } = useWindowDimensions();
  const compact = width < 600;

  const {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    error,
    handleRegister,
    handleLogin,
  } = useRegister();

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[s.card, compact && s.cardCompact]}>
            <View style={s.brand}>
              <View style={s.brandTop}>
                <Image
                  source={require("../../../assets/img/logo.png")}
                  style={s.logo}
                  resizeMode="contain"
                />
              </View>

              <View style={s.intro}>
                <Text style={s.tagline}>
                  Vamos começar?
                </Text>
                <Text style={[s.benefitText, { marginTop: 5,
                paddingLeft: 10,
                maxWidth: "40%" }]}>
                  Crie sua conta e tenha acesso a todas as funcionalidades do StockPilot.
                </Text>
              </View>

              <View pointerEvents="none" style={s.photoArea}>
                <Image
                  source={require("../../../assets/img/cell-dashboard.jpg")}
                  style={s.statusImage}
                  resizeMode="cover"
                />
              </View>
            </View>

            <View style={s.benefits}>
              <View style={s.benefit}>
                <Ionicons name="layers-outline" size={20} color={C.green} />
                <Text style={s.benefitText}>Gestão completa{"\n"}do seu estoque</Text>
              </View>

              <View style={s.benefit}>
                <Ionicons name="bar-chart-outline" size={20} color={C.green} />
                <Text style={s.benefitText}>Relatórios{"\n"}e insights</Text>
              </View>

              <View style={[s.benefit, s.lastBenefit]}>
                <Ionicons name="globe-outline" size={20} color={C.green} />
                <Text style={s.benefitText}>Acesse de{"\n"}qualquer lugar</Text>
              </View>
            </View>

            <View style={s.formPanel}>
              <Text style={s.title}>Criar conta</Text>
              <Text style={s.subtitle}>
                Preencha os dados abaixo para começar.
              </Text>

              <View style={s.form}>
                <RegisterField
                  icon="person-outline"
                  placeholder="Nome completo"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />

                <RegisterField
                  icon="mail-outline"
                  placeholder="E-mail corporativo"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <RegisterField
                  icon="lock-closed-outline"
                  placeholder="Senha"
                  value={password}
                  onChangeText={setPassword}
                  password
                />

                <RegisterField
                  icon="lock-closed-outline"
                  placeholder="Confirmar senha"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  password
                />

                {!!error && <Text style={s.error}>{error}</Text>}

                <Pressable
                  style={({ pressed }) => [
                    s.submit,
                    pressed && s.submitPressed,
                    loading && { opacity: 0.65 },
                  ]}
                  onPress={handleRegister}
                  disabled={loading}
                >
                  <Text style={s.submitText}>
                    {loading ? "Criando conta..." : "Criar conta"}
                  </Text>
                  {!loading && (
                    <Ionicons name="arrow-forward" size={18} color={C.bg} />
                  )}
                </Pressable>
              </View>

              <View style={[s.mobileFooter, { justifyContent: "center" }]}>
                <Text style={s.footerPhrase}>Já tem uma conta?</Text>
                <Pressable onPress={handleLogin} disabled={loading} hitSlop={8}>
                  <Text style={[s.forgot, { marginLeft: 5 }]}>Entrar</Text>
                </Pressable>
              </View>

              <View style={[s.brandFooter, { paddingTop: 22 }]}>
                <Image
                  source={require("../../../assets/img/logo.png")}
                  style={s.footerLogo}
                  resizeMode="contain"
                />
                <View style={s.footerDivider} />
                <Text style={s.footerPhrase}>Seu estoque sob controle.</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
