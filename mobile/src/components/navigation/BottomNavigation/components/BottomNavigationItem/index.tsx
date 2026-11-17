import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { styles } from "./BottomNavigationItem.styles";

type BottomNavigationItemProps = {
  label: string;
  icon: string;
  activeIcon: string;
  focused: boolean;
  onPress: () => void;
  onLongPress: () => void;
};

export function BottomNavigationItem({
  label,
  icon,
  activeIcon,
  focused,
  onPress,
  onLongPress,
}: BottomNavigationItemProps) {
  const color = focused ? "#00E599" : "#8B9BB4";

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: focused }}
      activeOpacity={0.7}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.container}
    >
      <View style={styles.icon}>
        <Ionicons
          name={(focused ? activeIcon : icon) as any}
          size={21}
          color={color}
        />
      </View>

      <Text
        style={[
          styles.label,
          focused ? styles.activeLabel : styles.inactiveLabel,
        ]}
      >
        {label}
      </Text>

      <View
        style={[
          styles.indicator,
          !focused && styles.indicatorInactive,
        ]}
      />
    </TouchableOpacity>
  );
}
