import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { styles } from "./MovementPeriodSelect.styles";

type MovementPeriodSelectProps = {
  selectedPeriod: number;
  menuOpen: boolean;
  onToggle: () => void;
  onSelect: (days: number) => void;
};

export function MovementPeriodSelect({
  selectedPeriod,
  menuOpen,
  onToggle,
  onSelect,
}: MovementPeriodSelectProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onToggle}
        style={styles.selector}
      >
        <Text style={styles.selectorText}>
          Últimos {selectedPeriod} dias
        </Text>

        <Ionicons
          name={menuOpen ? "chevron-up" : "chevron-down"}
          size={14}
          color="#8B9BB4"
        />
      </TouchableOpacity>

      {menuOpen && (
        <View style={styles.dropdown}>
          {[7, 15, 30].map((days) => (
            <TouchableOpacity
              key={days}
              activeOpacity={0.7}
              onPress={() => onSelect(days)}
              style={[
                styles.option,
                selectedPeriod === days && styles.optionActive,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedPeriod === days && styles.optionTextActive,
                ]}
              >
                Últimos {days} dias
              </Text>

              {selectedPeriod === days && (
                <Ionicons name="checkmark" size={15} color="#00E599" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
