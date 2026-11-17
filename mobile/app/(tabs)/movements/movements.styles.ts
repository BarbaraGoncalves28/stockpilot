import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050B14",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 22,
  },
summary: {
    flex: 1,
    minWidth: 0,
  },
  summaryLabel: {
    color: "#FFFFFF",
    fontSize: 29,
    fontWeight: "800",
    marginBottom: 5,
  },
  summaryValue: {
    color: "#FFFFFF",
    fontSize: 34,
    lineHeight: 39,
    fontWeight: "800",
    marginTop: 1,
  },
  percentageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  percentageText: {
    color: "#00E599",
    fontSize: 12,
    fontWeight: "600",
  },
  negativePercentage: {
    color: "#FF3366",
  },
  addButton: {
    minHeight: 48,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "#00E599",
    borderRadius: 22,
  },
  addButtonText: {
    color: "#050B14",
    fontSize: 12,
    fontWeight: "800",
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginTop: 23,
    marginBottom: 16,
  },
  historyText: {
    flex: 1,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "500",
  },
  sectionDescription: {
    color: "#8B9BB4",
    fontSize: 12,
    marginTop: 3,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#0D1B2A",
    borderWidth: 1,
    borderColor: "#1E2A3B",
    borderRadius: 22,
  },
  sortText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  list: {
    gap: 12,
  },
  feedback: {
    alignItems: "center",
    padding: 25,
    backgroundColor: "#0D1520",
    borderWidth: 1,
    borderColor: "#1E2A3B",
    borderRadius: 12,
  },
  feedbackTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 12,
  },
  feedbackText: {
    color: "#8B9BB4",
    fontSize: 12,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
  retryButton: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: "#00E599",
    borderRadius: 8,
  },
  retryText: {
    color: "#050B14",
    fontSize: 12,
    fontWeight: "800",
  },
  loading: {
    paddingVertical: 22,
  },
  pagination: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, paddingVertical: 20 },
  paginationButton: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: "#0D1B2A", borderWidth: 1, borderColor: "#29435F" },
  paginationButtonDisabled: { opacity: 0.55 },
  paginationText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700", minWidth: 42, textAlign: "center" },
});




