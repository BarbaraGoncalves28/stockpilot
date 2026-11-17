import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 20,
  },
  selector: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#1E2A3B",
    borderRadius: 8,
    backgroundColor: "#0B131E",
  },
  selectorText: {
    color: "#8B9BB4",
    fontSize: 10,
    fontWeight: "600",
  },
  dropdown: {
    position: "absolute",
    top: 40,
    right: 0,
    width: 145,
    backgroundColor: "#131D2C",
    borderWidth: 1,
    borderColor: "#1E2A3B",
    borderRadius: 8,
    padding: 4,
    zIndex: 30,
    elevation: 10,
  },
  option: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  optionActive: {
    backgroundColor: "rgba(0, 229, 153, 0.1)",
  },
  optionText: {
    color: "#8B9BB4",
    fontSize: 11,
  },
  optionTextActive: {
    color: "#00E599",
    fontWeight: "700",
  },
});
