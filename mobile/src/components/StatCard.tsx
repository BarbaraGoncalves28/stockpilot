import { StyleSheet, Text, View } from "react-native";

import { colors } from "../theme/colors";
import { radius, shadows, spacing } from "../theme/spacing";

type StatCardProps = {
  label: string;
  value: string | number;
  description?: string;
  accent: "brand" | "teal" | "amber" | "coral";
};

const accentColors = {
  brand: colors.brand[500],
  teal: colors.teal[500],
  amber: colors.amber[500],
  coral: colors.coral[500],
};

export function StatCard({
  label,
  value,
  description,
  accent,
}: StatCardProps) {
  return (
    <View style={styles.card}>
      <View
        style={[
          styles.accent,
          {
            backgroundColor: accentColors[accent],
          },
        ]}
      />

      <Text style={styles.label}>{label}</Text>

      <Text style={styles.value}>{value}</Text>

      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 132,
    backgroundColor: colors.surface.light,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing[4],
    overflow: "hidden",
    ...shadows.soft,
  },

  accent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },

  label: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: "600",
    marginTop: spacing[1],
  },

  value: {
    color: colors.text.primary,
    fontSize: 28,
    fontWeight: "800",
    marginTop: spacing[2],
  },

  description: {
    color: colors.text.muted,
    fontSize: 11,
    marginTop: spacing[1],
  },
});