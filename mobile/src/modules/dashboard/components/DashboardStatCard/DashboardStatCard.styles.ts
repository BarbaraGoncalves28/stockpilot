import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,
    minHeight: 158,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    justifyContent: "flex-start",
    gap: 9,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 3,
  },

  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  label: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },

  value: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  description: {
    fontSize: 10,
    fontWeight: "600",
  },
});