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
import LoginField from "./LoginField";
import { useLogin } from "./useLogin";
import { C, s } from "../../styles/screens/login.styles";

export default function LoginScreen() {
  const { width } = useWindowDimensions();
  const compact = width < 600;

  const {
    email,
    setEmail,
    password,
    setPassword,
    remember,
    setRemember,
    loading,
    error,
    handleLogin,
    handleRegister,
  } = useLogin();

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
                  Controle seu estoque,{"\n"}impulsione o seu negócio.
                </Text>
              </View>

              <View pointerEvents="none" style={s.photoArea}>
                <Image
                  source={require("../../../assets/img/widget-status.jpg")}
                  style={s.statusImage}
                  resizeMode="cover"
                />
              </View>
            </View>

            <View style={s.benefits}>
              <View style={s.benefit}>
                <Ionicons name="wallet-outline" size={23} color={C.green} />
                <Text style={s.benefitText}>Mais{"\n"}organização</Text>
              </View>

              <View style={s.benefit}>
                <Ionicons name="trending-down-outline" size={23} color={C.green} />
                <Text style={s.benefitText}>Menos{"\n"}perdas</Text>
              </View>

              <View style={[s.benefit, s.lastBenefit]}>
                <Ionicons name="analytics-outline" size={23} color={C.green} />
                <Text style={s.benefitText}>Decisões{"\n"}mais inteligentes</Text>
              </View>
            </View>

            <View style={s.formPanel}>
              <Text style={s.title}>Entrar</Text>
              <Text style={s.subtitle}>
                Acesse sua conta e continue gerenciando{"\n"}seu estoque com facilidade.
              </Text>

              <View style={s.form}>
                <LoginField
                  icon="mail-outline"
                  placeholder="E-mail"
                  value={email}
                  onChangeText={setEmail}
                />

                <LoginField
                  icon="lock-closed-outline"
                  placeholder="Senha"
                  value={password}
                  onChangeText={setPassword}
                  password
                />

                <View style={s.options}>
                  <Pressable
                    style={s.remember}
                    onPress={() => setRemember((v) => !v)}
                  >
                    <View style={[s.checkbox, remember && s.checkboxActive]}>
                      {remember && (
                        <Ionicons name="checkmark" size={14} color={C.bg} />
                      )}
                    </View>
                    <Text style={s.optionText}>Lembrar de mim</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {}}
                    hitSlop={8}
                    style={({ pressed }) => pressed && s.forgotPressed}
                  >
                    <Text style={s.forgot}>Esqueceu a senha?</Text>
                  </Pressable>
                </View>

                {!!error && <Text style={s.error}>{error}</Text>}

                <Pressable
                  style={({ pressed }) => [
                    s.submit,
                    pressed && s.submitPressed,
                    loading && { opacity: 0.65 },
                  ]}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  <Text style={s.submitText}>
                    {loading ? "Entrando..." : "Entrar"}
                  </Text>
                  {!loading && (
                    <Ionicons name="arrow-forward" size={21} color={C.bg} />
                  )}
                </Pressable>

                <View style={s.separator}>
                  <View style={s.separatorLine} />
                  <Text style={s.separatorText}>ou</Text>
                  <View style={s.separatorLine} />
                </View>

                <Pressable
                  style={({ pressed }) => [
                    s.registerButton,
                    pressed && s.registerButtonPressed,
                  ]}
                  onPress={handleRegister}
                  disabled={loading}
                >
                  <Ionicons name="person-add-outline" size={21} color={C.white} />
                  <Text style={s.registerText}>Criar uma conta</Text>
                </Pressable>
              </View>

              <View style={s.mobileFooter}>
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
