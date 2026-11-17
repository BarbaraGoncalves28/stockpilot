import { StyleSheet } from "react-native";

export const valuesStyles = StyleSheet.create({
  container: {
    backgroundColor: "#0D1520",
    borderWidth: 0.6,
    borderColor: "#1E2A3B",
    borderRadius: 14,
    padding: 16,
    gap: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  rowLabel: {
    color: "#8B9BB4",
    fontSize: 13,
    flex: 1,
  },
  rowValue: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: "#1E2A3B",
  },
});
