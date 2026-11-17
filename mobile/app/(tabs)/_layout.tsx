import { Tabs } from "expo-router";

import { AppNavbar } from "../../src/components/navigation/AppNavbar";
import { BottomNavigation } from "../../src/components/navigation/BottomNavigation";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomNavigation {...props} />}
      screenOptions={{
        headerShown: true,
        header: () => <AppNavbar />,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: "#050B14",
          borderTopWidth: 0,
          elevation: 0,
        },
        sceneStyle: {
          paddingBottom: 72,
          backgroundColor: "#050B14",
        },
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: "Início" }} />
      <Tabs.Screen name="products" options={{ title: "Produtos" }} />
      <Tabs.Screen name="movements" options={{ title: "Movimentos" }} />
      <Tabs.Screen name="more" options={{ title: "Mais" }} />
      <Tabs.Screen name="movement-create" options={{ href: null }} />
    </Tabs>
  );
}
