import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { colors } from "../../../src/theme/colors";
import {
  radius,
  shadows,
  spacing,
} from "../../../src/theme/spacing";

type MenuItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  accent: string;
  onPress: () => void;
};

function MenuItem({
  icon,
  title,
  description,
  accent,
  onPress,
}: MenuItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        pressed ? styles.menuItemPressed : undefined,
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: `${accent}14`,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={22}
          color={accent}
        />
      </View>

      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>
          {title}
        </Text>

        <Text style={styles.menuDescription}>
          {description}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={19}
        color={colors.text.muted}
      />
    </Pressable>
  );
}

export default function MoreScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>
            CONFIGURAÇÕES
          </Text>

          <Text style={styles.title}>
            Mais
          </Text>

          <Text style={styles.description}>
            Gerencie recursos e configurações do
            StockPilot.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Cadastros
          </Text>

          <Text style={styles.sectionDescription}>
            Organize as informações utilizadas no
            controle do seu estoque.
          </Text>

          <View style={styles.menuCard}>
            <MenuItem
              icon="pricetags-outline"
              title="Categorias"
              description="Organize seus produtos por categorias."
              accent={colors.brand[500]}
              onPress={() =>
                router.push("/(tabs)/more/categories")
              }
            />

            <View style={styles.divider} />

            <MenuItem
              icon="business-outline"
              title="Fornecedores"
              description="Gerencie os fornecedores dos seus produtos."
              accent={colors.teal[500]}
              onPress={() =>
                router.push("/(tabs)/more/suppliers")
              }
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Inteligência
          </Text>

          <Text style={styles.sectionDescription}>
            Insights para acompanhar o comportamento
            do seu estoque.
          </Text>

          <Pressable
  onPress={() =>
    router.push("/(tabs)/more/intelligence")
  }
  style={({ pressed }) => [
    styles.comingSoonCard,
    pressed ? styles.menuItemPressed : undefined,
  ]}
>
  <View style={styles.comingSoonIcon}>
    <Ionicons
      name="analytics-outline"
      size={21}
      color={colors.brand[500]}
    />
  </View>

  <View style={styles.comingSoonContent}>
    <Text style={styles.comingSoonTitle}>
      Inteligência de estoque
    </Text>

    <Text style={styles.comingSoonDescription}>
      Consumo médio, previsão de reposição
      e alertas inteligentes.
    </Text>
  </View>

  <Ionicons
    name="chevron-forward"
    size={19}
    color={colors.text.muted}
  />
</Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Conta
          </Text>

          <View style={styles.accountCard}>
            <View style={styles.accountIcon}>
              <Ionicons
                name="person-outline"
                size={21}
                color={colors.brand[600]}
              />
            </View>

            <View style={styles.accountContent}>
              <Text style={styles.accountTitle}>
                Perfil e configurações
              </Text>

              <Text style={styles.accountDescription}>
                Preferências da conta e configurações
                do aplicativo.
              </Text>
            </View>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                EM BREVE
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerTitle}>
            StockPilot
          </Text>

          <Text style={styles.footerText}>
            Gestão inteligente de estoque.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },

  content: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[8],
    paddingBottom: spacing[12],
  },

  header: {
    marginBottom: spacing[8],
  },

  eyebrow: {
    color: colors.brand[600],
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
  },

  title: {
    color: colors.text.primary,
    fontSize: 30,
    fontWeight: "800",
    marginTop: spacing[2],
  },

  description: {
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing[1],
    maxWidth: 320,
  },

  section: {
    marginBottom: spacing[7],
  },

  sectionTitle: {
    color: colors.text.primary,
    fontSize: 17,
    fontWeight: "800",
  },

  sectionDescription: {
    color: colors.text.secondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing[1],
    marginBottom: spacing[3],
  },

  menuCard: {
    backgroundColor: colors.surface.light,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
    overflow: "hidden",
    ...shadows.soft,
  },

  menuItem: {
    minHeight: 88,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    flexDirection: "row",
    alignItems: "center",
  },

  menuItemPressed: {
    opacity: 0.72,
  },

  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing[3],
  },

  menuContent: {
    flex: 1,
    paddingRight: spacing[3],
  },

  menuTitle: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: "700",
  },

  menuDescription: {
    color: colors.text.secondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginLeft: spacing[4] + 46 + spacing[3],
  },

  comingSoonCard: {
    backgroundColor: colors.surface.light,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing[4],
    flexDirection: "row",
    alignItems: "center",
    ...shadows.soft,
  },

  comingSoonIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.amber[50],
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing[3],
  },

  comingSoonContent: {
    flex: 1,
    paddingRight: spacing[2],
  },

  comingSoonTitle: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: "700",
  },

  comingSoonDescription: {
    color: colors.text.secondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },

  badge: {
    backgroundColor: colors.neutral[100],
    borderRadius: radius.full,
    paddingHorizontal: spacing[2],
    paddingVertical: 5,
  },

  badgeText: {
    color: colors.text.secondary,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  accountCard: {
    backgroundColor: colors.surface.light,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing[4],
    flexDirection: "row",
    alignItems: "center",
    ...shadows.soft,
  },

  accountIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.brand[50],
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing[3],
  },

  accountContent: {
    flex: 1,
    paddingRight: spacing[2],
  },

  accountTitle: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: "700",
  },

  accountDescription: {
    color: colors.text.secondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },

  footer: {
    alignItems: "center",
    marginTop: spacing[2],
  },

  footerTitle: {
    color: colors.brand[600],
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.4,
  },

  footerText: {
    color: colors.text.muted,
    fontSize: 11,
    marginTop: 4,
  },
});
