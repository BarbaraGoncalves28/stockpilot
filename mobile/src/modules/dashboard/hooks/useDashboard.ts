import { useCallback, useEffect, useRef, useState } from "react";

import {
  getDashboardMovements,
  getDashboardSummary,
} from "../dashboardService";
import type {
  DashboardMovementChartItem,
  DashboardSummary,
} from "../dashboard.types";
import { getStockIntelligenceAlerts } from "../../stock-intelligence/stockIntelligenceService";
import type { StockAlertItem } from "../../stock-intelligence/stockIntelligence.types";

export function useDashboard(accessToken: string | null | undefined) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [movements, setMovements] = useState<DashboardMovementChartItem[]>([]);
  const [alerts, setAlerts] = useState<StockAlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [periodLoading, setPeriodLoading] = useState(false);

  const selectedPeriodRef = useRef(30);
  const periodRequestRef = useRef(0);

  const loadDashboard = useCallback(
    async (isRefresh = false) => {
      if (!accessToken) {
        return;
      }

      try {
        setError("");

        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const [
          summaryResponse,
          movementsResponse,
          alertsResponse,
        ] = await Promise.all([
          getDashboardSummary(accessToken, selectedPeriodRef.current),
          getDashboardMovements(accessToken, 30),
          getStockIntelligenceAlerts(accessToken, 30),
        ]);

        setSummary(summaryResponse);
        setMovements(movementsResponse);
        setAlerts(alertsResponse);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar o dashboard.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken],
  );

  const handlePeriodChange = useCallback(
    async (days: number) => {
      if (!accessToken || days === selectedPeriodRef.current) {
        return;
      }

      const previousPeriod = selectedPeriodRef.current;
      const requestId = ++periodRequestRef.current;

      selectedPeriodRef.current = days;
      setSelectedPeriod(days);
      setPeriodLoading(true);

      try {
        setError("");

        const response = await getDashboardSummary(accessToken, days);

        if (requestId === periodRequestRef.current) {
          setSummary(response);
        }
      } catch (err) {
        if (requestId === periodRequestRef.current) {
          selectedPeriodRef.current = previousPeriod;
          setSelectedPeriod(previousPeriod);

          setError(
            err instanceof Error
              ? err.message
              : "Não foi possível atualizar os indicadores.",
          );
        }
      } finally {
        if (requestId === periodRequestRef.current) {
          setPeriodLoading(false);
        }
      }
    },
    [accessToken],
  );

  useEffect(() => {
    if (accessToken) {
      loadDashboard();
    }
  }, [accessToken, loadDashboard]);

  return {
    summary,
    movements,
    alerts,
    loading,
    refreshing,
    error,
    selectedPeriod,
    periodLoading,
    loadDashboard,
    handlePeriodChange,
  };
}
