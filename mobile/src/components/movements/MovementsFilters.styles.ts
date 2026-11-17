import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    marginTop: 25,
  },
  list: {
    gap: 10,
    paddingRight: 4,
  },
  chip: {
    minHeight: 47,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    borderRadius: 24,
    backgroundColor: "#0D1B2A",
    borderWidth: 1,
    borderColor: "#1E2A3B",
  },
  chipActive: {
    backgroundColor: "rgba(0,229,153,0.10)",
    borderColor: "#00E599",
  },
  chipText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  countBadge: {
    minWidth: 27,
    height: 25,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },
  countText: {
    fontSize: 11,
    fontWeight: "800",
  },
});
