import { StyleSheet } from "react-native";

export const intelligenceStyles = StyleSheet.create({
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
  riskBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  riskText: {
    fontSize: 11,
    fontWeight: "700",
  },
  columns: {
    flexDirection: "row",
    gap: 12,
  },
  metric: {
    flex: 1,
    backgroundColor: "#0D1520",
    borderWidth: 0.6,
    borderColor: "#1E2A3B",
    borderRadius: 14,
    padding: 12,
    gap: 5,
  },
  metricLabel: {
    color: "#8B9BB4",
    fontSize: 11,
  },
  metricValue: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
