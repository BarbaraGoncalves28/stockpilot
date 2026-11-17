import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 14,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 40,
  },

  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#07352F",
    borderWidth: 1,
    borderColor: "#00E599",
    marginRight: 10,
    shadowColor: "#00E599",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },

  headerIconText: {
    color: "#00E599",
    fontSize: 21,
    fontWeight: "700",
  },

  headerContent: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    color: "#F4F8FC",
    fontSize: 14,
    fontWeight: "700",
  },

  description: {
    color: "#8B9BB4",
    fontSize: 10,
    marginTop: 3,
  },

  viewAll: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#092337",
    marginLeft: 8,
  },

  viewAllText: {
    color: "#00E599",
    fontSize: 10,
    fontWeight: "600",
  },

  viewAllArrow: {
    color: "#00E599",
    fontSize: 18,
    lineHeight: 18,
    marginLeft: 7,
  },

  alertList: {
    gap: 7,
  },

  alertCard: {
    minHeight: 59,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#071827",
    borderWidth: 1,
    borderColor: "#17334A",
    borderRadius: 13,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },

  alertContent: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },

  alertTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  productName: {
    flexShrink: 1,
    color: "#F1F5F9",
    fontSize: 10,
    fontWeight: "700",
  },

  productSku: {
    color: "#91A5BA",
    fontSize: 9,
    marginTop: 2,
  },

  message: {
    color: "#A4B5C7",
    fontSize: 9,
    lineHeight: 13,
    marginTop: 4,
  },

  riskBadge: {
  flexShrink: 0,
  minHeight: 20,
  borderRadius: 10,
  paddingHorizontal: 8,
  alignItems: "center",
  justifyContent: "center",
},

  riskBadgeText: {
  color: "#07111D",
  fontSize: 8,
  fontWeight: "900",
  textAlign: "center",
  includeFontPadding: false,
  lineHeight: 11,
},

  riskOutOfStock: {
    backgroundColor: "#FF365D",
  },

  riskCritical: {
    backgroundColor: "#FF9D24",
  },

  riskHigh: {
    backgroundColor: "#FFD34E",
  },

  riskMedium: {
    backgroundColor: "#21B9F3",
  },

  riskLow: {
    backgroundColor: "#00E599",
  },

  riskDefault: {
    backgroundColor: "#9AA9BA",
  },

  movementContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginLeft: 12,
    minWidth: 100,
    gap: 5,
  },

  movementRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  clockIcon: {
    color: "#8FA5BB",
    fontSize: 13,
  },

  movementText: {
    color: "#A7B7C9",
    fontSize: 9,
  },

  chevron: {
    color: "#8FA5BB",
    fontSize: 20,
    lineHeight: 21,
  },

  emptyState: {
    minHeight: 70,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#17334A",
    borderRadius: 13,
    backgroundColor: "#071827",
  },

  emptyText: {
    color: "#8B9BB4",
    fontSize: 11,
  },
});

