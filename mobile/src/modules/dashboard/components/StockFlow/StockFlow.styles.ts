
import { StyleSheet } from "react-native";

import { spacing } from "../../../../theme/spacing";

export const styles = StyleSheet.create({
  section: {
    marginTop: spacing[7],
  },

  periodCard: {
    backgroundColor: "#0D1520",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1E2A3B",
    padding: 14,
    overflow: "visible",
  },

  periodHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    zIndex: 10,
  },

  periodHeading: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    minWidth: 0,
  },

  periodHeadingText: {
    flex: 1,
    minWidth: 0,
  },

  periodTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  periodDescription: {
    color: "#8B9BB4",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },

  periodSelectorContainer: {
    position: "relative",
    zIndex: 20,
  },

  periodSelector: {
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

  periodSelectorText: {
    color: "#8B9BB4",
    fontSize: 10,
    fontWeight: "600",
  },

  periodDropdown: {
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

  periodDropdownOption: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    borderRadius: 8,
  },

  periodDropdownOptionActive: {
    backgroundColor: "rgba(0, 229, 153, 0.1)",
  },

  periodDropdownText: {
    color: "#8B9BB4",
    fontSize: 11,
  },

  periodDropdownTextActive: {
    color: "#00E599",
    fontWeight: "700",
  },

  flowRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 8,
    marginTop: 16,
  },

  flowItem: {
    flex: 1,
    minWidth: 0,
    minHeight: 82,
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 9,
    paddingHorizontal: 7,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 10,
  },

  entryItem: {
    backgroundColor: "rgba(0, 229, 153, 0.1)",
    borderColor: "#00E599",
  },

  exitItem: {
    backgroundColor: "rgba(255, 51, 102, 0.1)",
    borderColor: "#FF3366",
  },

  balanceItem: {
    backgroundColor: "rgba(0, 209, 255, 0.1)",
    borderColor: "#00D1FF",
  },

  turnoverItem: {
    backgroundColor: "#131D2C",
    borderColor: "#1E2A3B",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  flowLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  flowMetricRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    width: "100%",
  },

  flowContent: {
    flex: 1,
    minWidth: 0,
  },

  flowLabel: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },

  flowValue: {
    fontSize: 14,
    fontWeight: "800",
    marginTop: 0,
  },

  flowUnit: {
    color: "#8B9BB4",
    fontSize: 9,
    marginTop: 2,
  },

  turnoverCircle: {
    width: 54,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
  },

  turnoverPercentage: {
    position: "absolute",
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
    includeFontPadding: false,
  },

  turnoverTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },

  turnoverDescription: {
    color: "#8B9BB4",
    fontSize: 9,
    marginTop: 3,
  },

  periodLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
  },

  periodLoadingText: {
    color: "#8B9BB4",
    fontSize: 10,
  },
});
