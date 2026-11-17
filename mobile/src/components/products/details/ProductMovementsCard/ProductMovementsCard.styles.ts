import { StyleSheet } from "react-native";

export const movementsStyles = StyleSheet.create({
  container: {
    backgroundColor: "#0D1520",
    borderWidth: 0.6,
    borderColor: "#1E2A3B",
    borderRadius: 14,
    padding: 16,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  link: {
    color: "#00E599",
    fontSize: 12,
    fontWeight: "700",
  },
  separator: {
    height: 1,
    backgroundColor: "#1E2A3B",
  },
  emptyText: {
    color: "#8B9BB4",
    fontSize: 12,
    textAlign: "center",
    paddingVertical: 12,
  },
  movement: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  movementIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  movementSymbol: {
    fontSize: 18,
    fontWeight: "700",
  },
  movementInfo: {
    flex: 1,
    gap: 4,
  },
  movementTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  movementDate: {
    color: "#8B9BB4",
    fontSize: 11,
  },
  movementAmount: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "right",
  },
});
