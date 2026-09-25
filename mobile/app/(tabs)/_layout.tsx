import { Tabs } from "expo-router";
import {
  Ionicons,
} from "@expo/vector-icons";

import { colors } from "../../src/theme/colors";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: colors.brand[500],
        tabBarInactiveTintColor: colors.text.muted,

        tabBarStyle: {
          height: 68,
          paddingTop: 8,
          paddingBottom: 10,
          backgroundColor: colors.surface.light,
          borderTopWidth: 1,
          borderTopColor: colors.border.light,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },

        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Início",

          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={
                focused
                  ? "grid"
                  : "grid-outline"
              }
              size={22}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="products"
        options={{
          title: "Produtos",

          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={
                focused
                  ? "cube"
                  : "cube-outline"
              }
              size={22}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="movements"
        options={{
          title: "Movimentos",

          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={
                focused
                  ? "swap-vertical"
                  : "swap-vertical-outline"
              }
              size={23}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="more"
        options={{
          title: "Mais",

          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={
                focused
                  ? "menu"
                  : "menu-outline"
              }
              size={23}
              color={color}
            />
          ),
        }}
      />

            <Tabs.Screen
        name="movement-create"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}