import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { gap: 10, marginBottom: 20 },
  row: { flexDirection: "row", gap: 7 },
  chip: {
    flex: 1,
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 7,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#1E2A3B",
    backgroundColor: "#0D1B2A",
  },
  activeChip: { borderColor: "#00E599", backgroundColor: "rgba(0,229,153,0.10)" },
  dangerActiveChip: {
    borderColor: "#FF3366",
    backgroundColor: "rgba(255,51,102,0.12)",
  },
  label: { color: "#D7E6FA", fontSize: 11, fontWeight: "500" },
  activeLabel: { color: "#FFFFFF" },
  category: {
    minHeight: 42,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#1E2A3B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    backgroundColor: "#0D1B2A",
  },
});
