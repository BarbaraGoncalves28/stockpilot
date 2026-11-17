import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    overflow: "hidden",
    backgroundColor: "#0D1520",
    borderWidth: 1,
    borderColor: "#1E2A3B",
    borderRadius: 15,
  },
  accent: {
    width: 7,
  },
  content: {
    flex: 1,
    paddingHorizontal: 13,
    paddingTop: 10,
    paddingBottom: 0,
  },
  mainRow: {
    minHeight: 105,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconCircle: {
    width: 53,
    height: 53,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  productColumn: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },
  typeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    marginBottom: 6,
  },
  typeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  productName: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  sku: {
    color: "#8B9BB4",
    fontSize: 11,
    marginTop: 2,
  },
  stockLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 6,
  },
  stockText: {
    color: "#8B9BB4",
    fontSize: 11,
  },
  quantityBox: {
    minWidth: 83,
    maxWidth: 112,
    minHeight: 57,
    paddingHorizontal: 8,
    paddingVertical: 7,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 13,
  },
  quantity: {
    fontSize: 18,
    fontWeight: "800",
  },
  units: {
    fontSize: 10,
    marginTop: 1,
  },
  adjustmentLabel: {
    fontSize: 10,
    fontWeight: "600",
  },
  previousStock: {
    color: "#C5A4E8",
    fontSize: 9,
    marginTop: 3,
  },
  footer: {
    minHeight: 39,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#1E2A3B",
  },
  reasonGroup: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reason: {
    flex: 1,
    color: "#8BBAF0",
    fontSize: 10,
  },
  dateGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateText: {
    color: "#8BBAF0",
    fontSize: 9,
  },
  dateSeparator: {
    color: "#8B9BB4",
    fontSize: 10,
  },
});
