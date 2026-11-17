import { StyleSheet } from "react-native";

export const heroStyles = StyleSheet.create({
  hero: {
    gap: 9,
    paddingTop: 5,
    paddingBottom: 3,
  },
  productName: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 31,
  },
  sku: {
    color: "#8B9BB4",
    fontSize: 13,
  },
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 3,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "700",
  },
});
