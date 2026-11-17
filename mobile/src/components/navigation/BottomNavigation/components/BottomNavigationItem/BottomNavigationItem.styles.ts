import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  icon: {
    height: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 8,
    fontWeight: "500",
    lineHeight: 11,
  },
  activeLabel: {
    color: "#00E599",
    fontWeight: "700",
  },
  inactiveLabel: {
    color: "#8B9BB4",
  },
  indicator: {
    width: 34,
    height: 3,
    borderRadius: 3,
    backgroundColor: "#00E599",
    marginTop: 2,
  },
  indicatorInactive: {
    opacity: 0,
  },
});
