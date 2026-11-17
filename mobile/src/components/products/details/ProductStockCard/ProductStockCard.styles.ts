import { StyleSheet } from "react-native";
import { palette } from "../ProductDetails.styles";

export const stockCardStyles = StyleSheet.create({
  container: {
    backgroundColor: "#0D1520",
    borderWidth: 0.6,
    borderColor: "#1E2A3B",
    
    
    borderRadius: 14,
    padding: 16,
    paddingTop: 12,
    paddingBottom: 2,
    gap: 0,
  },
  stockMain: {
    flexDirection: "row",
    alignItems: "center",
  },
  stockOverview: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 38,
  },
  stockCurrent: {
    flex: 1.35,
    justifyContent: "center",
    paddingLeft: 43,
  },
  stockLimit: {
    flex: 1.15,
    minHeight: 54,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  stockDivider: {
    position: "absolute",
    left: 0,
    top: 2,
    height: 32,
    width: 1,
    backgroundColor: "#29445C",
  },
  metricLabel: {
    color: palette.secondary,
    fontSize: 11,
  },
  metricValue: {
    color: palette.text,
    fontSize: 15,
    fontWeight: "700",
  },
});





