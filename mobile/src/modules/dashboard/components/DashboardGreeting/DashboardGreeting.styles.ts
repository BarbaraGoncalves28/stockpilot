import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    minHeight: 104,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(0, 209, 255, 0.07)",
    borderWidth: 1,
    borderColor: "rgba(0, 209, 255, 0.45)",
    borderRadius: 16,
    overflow: "hidden",
  },

  content: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.4,
  },

  subtitle: {
    color: "#8B9BB4",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 2,
  },
});