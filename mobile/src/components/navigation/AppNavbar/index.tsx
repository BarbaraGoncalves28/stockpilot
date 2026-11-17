import { useMemo } from "react";
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../../../auth/AuthContext";
import { styles } from "./AppNavbar.styles";

export function AppNavbar() {
  const { user } = useAuth();

  const initials = useMemo(() => {
    const parts = (user?.name ?? "Usuário")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 0) return "U";
    if (parts.length === 1) {
      return parts[0].slice(0, 1).toUpperCase();
    }

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }, [user?.name]);

  function handleNotifications() {
    Alert.alert(
      "Notificações",
      "A central de notificações será integrada em uma próxima etapa.",
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={require("../../../../assets/img/logo.png")}
        style={styles.logo}
        resizeMode="contain"
        accessibilityLabel="StockPilot"
      />

      <View style={styles.actions}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Abrir notificações"
          activeOpacity={0.7}
          onPress={handleNotifications}
          style={styles.iconButton}
        >
          <Ionicons
            name="notifications-outline"
            size={25}
            color="#FFFFFF"
          />

          <View style={styles.notificationDot} />
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Perfil de ${user?.name ?? "usuário"}`}
          activeOpacity={0.7}
          style={styles.avatar}
          onPress={() =>
            Alert.alert(
              user?.name ?? "Perfil",
              user?.email ?? "Usuário autenticado",
            )
          }
        >
          <Text style={styles.avatarText}>{initials}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
