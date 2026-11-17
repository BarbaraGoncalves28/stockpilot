import { Image, Text, View } from "react-native";

import { styles } from "./DashboardGreeting.styles";

type DashboardGreetingProps = {
  name: string;
};

export function DashboardGreeting({
  name,
}: DashboardGreetingProps) {
  const firstName = name.trim().split(/\s+/)[0] || "usuário";

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          Olá, {firstName}! 
        </Text>

        <Text style={styles.subtitle}>
          Aqui está um resumo do seu estoque hoje. 
        </Text>

        <Text style={styles.subtitle}>
          Continue assim, você está no controle! 
        </Text>
      </View>
    </View>
  );
}
