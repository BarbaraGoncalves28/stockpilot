import "./global.css";

import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-950">
      <Text className="text-3xl font-bold text-white">
        StockPilot
      </Text>

      <Text className="mt-2 text-base text-slate-400">
        Gestão de estoque
      </Text>

      <StatusBar style="light" />
    </View>
  );
}