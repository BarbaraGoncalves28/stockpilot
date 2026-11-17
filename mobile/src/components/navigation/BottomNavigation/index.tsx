import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomTabBarProps } from "expo-router/build/react-navigation/bottom-tabs/types";

import { useBottomNavigation } from "./hooks/useBottomNavigation";
import { BottomNavigationItem } from "./components/BottomNavigationItem";
import { styles } from "./BottomNavigation.styles";

export function BottomNavigation(props: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { items } = useBottomNavigation(props);

  return (
    <View
      style={[
        styles.container,
        { bottom: Math.max(insets.bottom, 4) },
      ]}
    >
      {items.map((item) => (
        <BottomNavigationItem
          key={item.key}
          label={item.label}
          icon={item.icon}
          activeIcon={item.activeIcon}
          focused={item.focused}
          onPress={item.onPress}
          onLongPress={item.onLongPress}
        />
      ))}
    </View>
  );
}
