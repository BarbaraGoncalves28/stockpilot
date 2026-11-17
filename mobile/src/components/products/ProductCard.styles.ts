import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    minHeight: 112,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0D1520",
    borderWidth: 0.6,
    borderColor: "#1E2A3B",
    borderLeftWidth: 6,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 16,
    marginBottom: 12,
    gap: 10,
  },
  info: { flex: 1, minWidth: 0, gap: 5 },
  name: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  sku: { color: "#A9C9F5", fontSize: 13 },
  meta: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 3 },
  quantity: { color: "#D7E6FA", fontSize: 13 },
  right: { alignItems: "flex-end", gap: 9 },
  price: { color: "#FFFFFF", fontSize: 17, fontWeight: "500" },
  badge: {
    minHeight: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 0.6,
    borderRadius: 20,
    paddingHorizontal: 9,
  },
  badgeText: { fontSize: 11, fontWeight: "700" },
});

