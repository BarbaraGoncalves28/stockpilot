import { StyleSheet } from "react-native";

import { colors } from "../../theme/colors";
import { radius, shadows, spacing } from "../../theme/spacing";
export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#050B14",
  },

  content: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 24,
  },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background.light,
    paddingHorizontal: spacing[6],
  },

  loadingIcon: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
    backgroundColor: colors.brand[50],
    marginBottom: spacing[4],
  },

  loadingTitle: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: "700",
  },

  loadingDescription: {
    maxWidth: 280,
    marginTop: spacing[2],
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },

  errorIcon: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
    backgroundColor: colors.coral[50],
    marginBottom: spacing[4],
  },

  errorIconText: {
    color: colors.coral[600],
    fontSize: 24,
    fontWeight: "800",
  },

  errorTitle: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },

  errorDescription: {
    maxWidth: 300,
    marginTop: spacing[2],
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },

  retryButton: {
    marginTop: spacing[5],
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    borderRadius: radius.md,
    backgroundColor: colors.brand[500],
    ...shadows.soft,
  },

  retryButtonText: {
    color: colors.text.inverse,
    fontSize: 14,
    fontWeight: "700",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing[6],
  },

  headerText: {
    flex: 1,
    paddingRight: spacing[4],
  },

  eyebrow: {
    color: colors.brand[600],
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginBottom: spacing[2],
  },

  title: {
    color: colors.text.primary,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  subtitle: {
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing[1],
  },

  avatar: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
    backgroundColor: colors.brand[500],
    ...shadows.soft,
  },

  avatarText: {
    color: colors.text.inverse,
    fontSize: 15,
    fontWeight: "800",
  },

  inlineError: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[3],
    padding: spacing[3],
    marginBottom: spacing[5],
    borderRadius: radius.md,
    backgroundColor: colors.coral[50],
    borderWidth: 1,
    borderColor: colors.coral[100],
  },

  inlineErrorText: {
    flex: 1,
    color: colors.coral[700],
    fontSize: 12,
    lineHeight: 18,
  },

  inlineErrorAction: {
    color: colors.coral[700],
    fontSize: 12,
    fontWeight: "700",
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[3],
  },

  statColumn: {
    width: "48%",
    minWidth: 0,
  },

  section: {
    marginTop: spacing[7],
  },

  intelligenceCard: {
    backgroundColor: "#061321",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#17334A",
    padding: 14,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },

  intelligenceHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  intelligenceHeaderIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: colors.brand[50],
    marginRight: spacing[3],
  },

  intelligenceHeaderIconText: {
    color: colors.brand[600],
    fontSize: 22,
    fontWeight: "800",
  },

  intelligenceHeaderContent: {
    flex: 1,
  },

  intelligenceTitle: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: "800",
  },

  intelligenceDescription: {
    color: colors.text.secondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },

  intelligenceDivider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing[4],
  },

  intelligenceLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing[4],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },

  intelligenceLinkText: {
    color: colors.brand[600],
    fontSize: 12,
    fontWeight: "700",
  },

  intelligenceLinkArrow: {
    color: colors.brand[600],
    fontSize: 17,
    fontWeight: "700",
  },

  chartCard: {
    backgroundColor: colors.surface.light,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing[5],
    ...shadows.soft,
  },

  chartLegend: {
    flexDirection: "row",
    gap: spacing[5],
    marginBottom: spacing[5],
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },

  legendDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },

  legendText: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: "600",
  },

  chart: {
    height: 165,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingTop: spacing[2],
  },

  chartColumn: {
    flex: 1,
    alignItems: "center",
  },

  bars: {
    height: 140,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 3,
  },

  barTrack: {
    width: 8,
    height: 130,
    justifyContent: "flex-end",
  },

  bar: {
    width: 8,
    borderRadius: radius.full,
  },

  chartLabel: {
    color: colors.text.muted,
    fontSize: 9,
    marginTop: spacing[2],
  },

  emptyChart: {
    minHeight: 190,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing[5],
  },

  emptyChartIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
    backgroundColor: colors.brand[50],
    marginBottom: spacing[3],
  },

  emptyChartIconText: {
    color: colors.brand[500],
    fontSize: 24,
    fontWeight: "700",
  },

  emptyChartTitle: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },

  emptyChartDescription: {
    maxWidth: 270,
    color: colors.text.secondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: spacing[2],
  },

  footerSpace: {
    height: spacing[5],
  },
});
