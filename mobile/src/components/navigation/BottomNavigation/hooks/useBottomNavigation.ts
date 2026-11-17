import { BottomTabBarProps } from "expo-router/build/react-navigation/bottom-tabs/types";

export const bottomNavigationItems = {
  dashboard: {
    label: "Início",
    icon: "home-outline",
    activeIcon: "home",
  },
  products: {
    label: "Produtos",
    icon: "cube-outline",
    activeIcon: "cube",
  },
  movements: {
    label: "Movimentos",
    icon: "swap-horizontal-outline",
    activeIcon: "swap-horizontal",
  },
  more: {
    label: "Mais",
    icon: "ellipsis-horizontal",
    activeIcon: "ellipsis-horizontal",
  },
} as const;

export function useBottomNavigation({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const items = state.routes
    .filter((route) => route.name in bottomNavigationItems)
    .map((route) => {
      const config =
        bottomNavigationItems[
          route.name as keyof typeof bottomNavigationItems
        ];

      return {
        key: route.key,
        name: route.name,
        label: config.label,
        icon: config.icon,
        activeIcon: config.activeIcon,
        focused: state.routes[state.index]?.key === route.key,
        options: descriptors[route.key].options,
        onPress: () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        },
        onLongPress: () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        },
      };
    });

  return { items };
}

