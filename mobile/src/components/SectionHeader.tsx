import { StyleSheet, Text, View } from "react-native";

import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

type SectionHeaderProps = {
  title: string;
  action?: string;
};

export function SectionHeader({
  title,
  action,
}: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {action ? (
        <Text style={styles.action}>{action}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing[3],
  },

  title: {
    color: colors.text.primary,
    fontSize: 17,
    fontWeight: "700",
  },

  action: {
    color: colors.brand[600],
    fontSize: 13,
    fontWeight: "600",
  },
});