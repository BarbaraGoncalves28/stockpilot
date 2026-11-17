import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.72)", justifyContent: "center", padding: 24 },
  modal: { backgroundColor: "#0D1520", borderColor: "#1E5A78", borderWidth: 1, borderRadius: 18, padding: 18, maxHeight: "75%" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  title: { color: "#FFFFFF", fontSize: 18, fontWeight: "800" },
  option: { minHeight: 48, borderTopWidth: 1, borderTopColor: "#1E2A3B", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  optionText: { color: "#D7E6FA", fontSize: 14 },
});
